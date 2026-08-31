import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

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

void isSupported().then((supported) => {
  if (supported) {
    getAnalytics(firebaseApp);
  }
});
