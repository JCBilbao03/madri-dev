import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBtRfHkOCHNOXpO-3OXvuyAjy5OxnYy9Kc',
  authDomain: 'madridev-119f7.firebaseapp.com',
  projectId: 'madridev-119f7',
  storageBucket: 'madridev-119f7.firebasestorage.app',
  messagingSenderId: '1070631792638',
  appId: '1:1070631792638:web:ab81d45c7adaf2272c9aaf',
  measurementId: 'G-Y1VNYNQ6K3',
};

export const firebaseApp = initializeApp(firebaseConfig);

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
