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
   - `http://localhost:*/*` and `http://127.0.0.1:*/*` (local development — required for App Check token exchange on `localhost`)
   - Optionally also `http://localhost:5173/*` if you always use Vite’s default port

Without the **madribuild.com** referrers, Firestore and Auth calls fail on the custom
domain even though Hosting serves the site correctly.

## Demo app visit analytics (privacy-first)

Anonymous traffic for Works / demo apps is recorded by the **`recordAppVisit`** Cloud
Function (region `asia-southeast1`). It:

- Requires **App Check** (same as other public writes).
- Derives **approximate country** from the request IP using an offline GeoIP database, then **does not store the IP**.
- Writes **aggregate counters** only (`appVisitDaily`, `appVisitTotals`).
- Uses short-lived **hashed dedupe** documents in `appVisitDedupe` (enable **Firestore TTL** on field `expiresAt` in Firebase Console).

Admin read access is Firestore rules (`isAdmin()`). Public privacy copy lives at `/privacy`.

After deploying functions, enable **App Check enforcement for Cloud Functions** when metrics look healthy.

## Firebase App Check (required for public lead forms and demo writes)

Contact and cleaning lead writes and inventory/ops demo **mutations** require a valid App Check token in **Firestore and Storage rules** (`isAppCheckVerified()` /
`isTrustedClient()`). Demo collection **reads** (inventory, claims, ASNs, tasks) stay public.

1. In [Firebase Console → App Check](https://console.firebase.google.com/project/madridev-119f7/appcheck),
   register the web app with **reCAPTCHA Enterprise** (must match the provider in
   `src/lib/firebase.ts` — `ReCaptchaEnterpriseProvider`, not v3).
2. Copy the **site key** into `.env` (see `.env.example`):

   ```bash
   VITE_FIREBASE_APP_CHECK_SITE_KEY=your_recaptcha_enterprise_site_key
   ```

3. Rebuild and deploy: `npm run deploy`.
4. In App Check, enable **Enforcement** for Cloud Firestore and Cloud Storage when traffic looks healthy.

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

1. Set a fixed debug token in `.env` (see `.env.example`):

   ```bash
   VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=your-uuid-v4-token
   ```

2. Register it once (requires `npx firebase login`):

   ```bash
   npm run appcheck:register-debug-token
   ```

   Or paste the same UUID under [App Check → Manage debug tokens](https://console.firebase.google.com/project/madridev-119f7/appcheck).

3. Restart `npm run dev` and hard-refresh the browser.

Without a registered debug token, Firestore reads/writes fail on `localhost` when App Check enforcement is enabled.

## Content Security Policy (Hosting headers)

Firebase Analytics loads gtag from `googletagmanager.com`. The CSP in
`firebase.json` must allow that host in **`script-src`** (not only `connect-src`).
After changing headers, run `firebase deploy --only hosting`.

## Deploying rules and headers

`npm run deploy` publishes Hosting, Firestore rules, and Storage rules together.

## Monitoring alerts

Operational alerts (Firestore/Storage write spikes, rules denials, App Check failures) are configured with Cloud Monitoring. See [monitoring/ALERTS.md](monitoring/ALERTS.md) and run:

```bash
npm run monitoring:setup-alerts
```

Budget alerts are set up once in the Firebase / Google Cloud console (also documented in `monitoring/ALERTS.md`).

## Admin accounts

Admin users are seeded with `ADMIN_PASSWORD=<password> node scripts/seed-admins.mjs`.
Never commit passwords or `.env` files.
