/**
 * Must load before any Firebase SDK import. See Firebase App Check debug provider docs.
 */
declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;
const configuredDebugToken = import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN?.trim();

if (typeof window !== 'undefined' && import.meta.env.DEV && appCheckSiteKey) {
  const useFixedToken = Boolean(configuredDebugToken && configuredDebugToken.length > 0);

  window.FIREBASE_APPCHECK_DEBUG_TOKEN = useFixedToken ? configuredDebugToken : true;

  if (useFixedToken) {
    console.info(
      `[App Check] Using debug token from .env: ${configuredDebugToken}\n` +
        'Register it once at Firebase Console → App Check → Manage debug tokens:\n' +
        'https://console.firebase.google.com/project/madridev-119f7/appcheck',
    );
  } else {
    console.info(
      '[App Check] Debug mode enabled. Copy the debug token from the next console line and register it at:\n' +
        'https://console.firebase.google.com/project/madridev-119f7/appcheck',
    );
  }
}

export {};
