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
import { getStorage } from 'firebase/storage';

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

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
  if (import.meta.env.DEV) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

/** Lead writes require a valid App Check token in Firestore rules. */
export async function ensureAppCheckToken(): Promise<void> {
  if (!appCheck) {
    return;
  }

  await getToken(appCheck, false);
}

/** Firebase Authentication — email/password for the rental marketplace. */
export const auth = getAuth(firebaseApp);

/** Cloud Firestore — users, properties, and applications. */
export const db = getFirestore(firebaseApp);

/** Cloud Storage — property photos in a later phase. */
export const storage = getStorage(firebaseApp);

void isSupported().then((supported) => {
  if (supported) {
    getAnalytics(firebaseApp);
  }
});
