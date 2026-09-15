# Security

## Firebase API key restrictions

The browser Firebase config is public by design. Restrict the Web API key in
[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):

1. Open the **Browser key** used by Firebase.
2. Under **Application restrictions**, choose **HTTP referrers**.
3. Allow only:
   - `https://madribuild.com/*`
   - `https://www.madribuild.com/*`
   - `https://madridev-119f7.web.app/*`
   - `https://madridev-119f7.firebaseapp.com/*`
   - `http://localhost:*` (local development)

Without the **madribuild.com** referrers, Firestore and Auth calls fail on the custom
domain even though Hosting serves the site correctly.

## Firebase App Check (required for public lead forms)

Contact and cleaning lead writes are allowed without login when the payload passes
`isValidLeadShape` (status `new`, no notes, no assignee). App Check is initialized
in the client and can be enforced in rules again once token exchange is healthy.

1. In [Firebase Console → App Check](https://console.firebase.google.com/project/madridev-119f7/appcheck),
   register the web app with **reCAPTCHA Enterprise** (must match the provider in
   `src/lib/firebase.ts` — `ReCaptchaEnterpriseProvider`, not v3).
2. Copy the **site key** into `.env` (see `.env.example`):

   ```bash
   VITE_FIREBASE_APP_CHECK_SITE_KEY=your_recaptcha_enterprise_site_key
   ```

3. Rebuild and deploy: `npm run deploy`.
4. In App Check, enable **Enforcement** for Cloud Firestore when traffic looks healthy.

### Custom domain (madribuild.com)

Hosting can serve the app on `madribuild.com`, but Firebase backend calls also require:

1. **reCAPTCHA Enterprise allowed domains** (Google Cloud → Security → reCAPTCHA
   Enterprise): add `madribuild.com` and `www.madribuild.com` to the site key.
2. **API key HTTP referrers** (see above): include both madribuild.com patterns.
3. **Firebase Auth → Settings → Authorized domains**: add `madribuild.com` and
   `www.madribuild.com` (needed for login/signup on the custom domain).

No redeploy is required after these console changes. Hard-refresh the site and retry
the contact form.

### Local development

With `VITE_FIREBASE_APP_CHECK_SITE_KEY` set, the dev server enables a debug token.
Open the browser console, copy the printed debug token, and register it under
**App Check → Manage debug tokens** in Firebase Console.

## Content Security Policy (Hosting headers)

Firebase Analytics loads gtag from `googletagmanager.com`. The CSP in
`firebase.json` must allow that host in **`script-src`** (not only `connect-src`).
After changing headers, run `firebase deploy --only hosting`.

## Deploying rules and headers

`npm run deploy` publishes Hosting, Firestore rules, and Storage rules together.

## Admin accounts

Admin users are seeded with `ADMIN_PASSWORD=<password> node scripts/seed-admins.mjs`.
Never commit passwords or `.env` files.
