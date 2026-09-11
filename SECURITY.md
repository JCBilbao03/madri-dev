# Security

## Firebase API key restrictions

The browser Firebase config is public by design. Restrict the Web API key in
[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):

1. Open the **Browser key** used by Firebase.
2. Under **Application restrictions**, choose **HTTP referrers**.
3. Allow only:
   - `https://madridev-119f7.web.app/*`
   - `https://madridev-119f7.firebaseapp.com/*`
   - `http://localhost:*` (local development)

## Firebase App Check (required for public lead forms)

Contact and cleaning lead writes require a valid App Check token in Firestore rules.

1. In [Firebase Console → App Check](https://console.firebase.google.com/project/madridev-119f7/appcheck),
   register the web app with **reCAPTCHA v3**.
2. Copy the **site key** into `.env` (see `.env.example`):

   ```bash
   VITE_FIREBASE_APP_CHECK_SITE_KEY=your_recaptcha_v3_site_key
   ```

3. Rebuild and deploy: `npm run deploy`.
4. In App Check, enable **Enforcement** for Cloud Firestore when traffic looks healthy.

### Local development

With `VITE_FIREBASE_APP_CHECK_SITE_KEY` set, the dev server enables a debug token.
Open the browser console, copy the printed debug token, and register it under
**App Check → Manage debug tokens** in Firebase Console.

## Deploying rules and headers

`npm run deploy` publishes Hosting, Firestore rules, and Storage rules together.

## Admin accounts

Admin users are seeded with `ADMIN_PASSWORD=<password> node scripts/seed-admins.mjs`.
Never commit passwords or `.env` files.
