import { initializeApp } from 'firebase/app';
import {
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBtRfHkOCHNOXpO-3OXvuyAjy5OxnYy9Kc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'madridev-119f7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'madridev-119f7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'madridev-119f7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '1070631792638',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:1070631792638:web:ab81d45c7adaf2272c9aaf',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-Y1VNYNQ6K3',
};

export const firebaseApp = initializeApp(firebaseConfig);

const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;

let appCheck: AppCheck | undefined;

if (typeof window !== 'undefined' && appCheckSiteKey) {
  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

/** Public writes and demo collections require a valid App Check token in Firestore rules. */
export async function ensureAppCheckToken(): Promise<void> {
  if (!appCheck) {
    return;
  }

  await getToken(appCheck, false);
}

let firestoreReadyPromise: Promise<void> | undefined;

/**
 * Waits for App Check before Firestore I/O when enforcement is enabled in Firebase Console.
 * Avoids race where the first hydrate runs before a token is attached.
 */
export async function waitForFirestore(): Promise<void> {
  if (!appCheck) {
    return;
  }

  if (!firestoreReadyPromise) {
    firestoreReadyPromise = getToken(appCheck, false)
      .then(() => undefined)
      .catch((error: unknown) => {
        firestoreReadyPromise = undefined;
        throw error;
      });
  }

  await firestoreReadyPromise;
}

/** Firebase Authentication — email/password for the rental marketplace. */
export const auth = getAuth(firebaseApp);

/** Cloud Firestore — users, properties, and applications. */
export const db = getFirestore(firebaseApp);

/** Cloud Storage — property photos in a later phase. */
export const storage = getStorage(firebaseApp);

/** Cloud Functions — admin email sync/send (asia-southeast1). */
export const functions = getFunctions(firebaseApp, 'asia-southeast1');

void isSupported().then((supported) => {
  if (supported) {
    getAnalytics(firebaseApp);
  }
});
