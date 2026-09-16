export function formatFirestoreError(error: unknown, context = 'Firestore'): string {
  const message = error instanceof Error ? error.message : 'Something went wrong.';

  if (/app.?check|recaptcha/i.test(message)) {
    const debugToken = import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN?.trim();

    if (import.meta.env.DEV && debugToken) {
      return `App Check blocked this request. Register debug token ${debugToken} (npm run appcheck:register-debug-token), confirm API key referrers include http://localhost:*/*, then hard-refresh.`;
    }

    return 'App Check blocked this request. On localhost, copy the debug token from the browser console and add it under Firebase Console → App Check → Manage debug tokens.';
  }

  if (/permission|insufficient/i.test(message)) {
    return `${context} could not load. Hard-refresh the page. If you are on localhost, register an App Check debug token. On a custom domain, confirm API key HTTP referrers and reCAPTCHA allowed domains include this site.`;
  }

  return message;
}
