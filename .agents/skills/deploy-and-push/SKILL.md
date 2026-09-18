---
name: deploy-and-push
description: >-
  Build, commit, push to GitHub, and deploy MadriBuild to Firebase Hosting and
  Firestore rules. Use when the user asks to deploy, push to GitHub, ship changes,
  go live, or publish the site.
---

# Deploy and Push (MadriBuild)

End-to-end workflow: verify build → commit → push → Firebase deploy.

**Live URL:** https://madridev-119f7.web.app  
**Firebase project:** `madridev-119f7`  
**Default branch:** `main`

## Prerequisites

- Firebase CLI authenticated (`firebase login`)
- Git remote: `origin` → GitHub (`JCBilbao03/madri-dev`)
- For contact/cleaning lead forms on production: `.env` with `VITE_FIREBASE_APP_CHECK_SITE_KEY` (see [SECURITY.md](../../../SECURITY.md))

Never commit `.env`, credentials, or secrets.

## Workflow

Copy and track progress:

```
Deploy Progress:
- [ ] 1. Inspect changes
- [ ] 2. Build passes
- [ ] 3. Commit
- [ ] 4. Push to GitHub
- [ ] 5. Deploy to Firebase
- [ ] 6. Report URLs and any follow-ups
```

### 1. Inspect changes

Run in parallel:

```bash
git status
git diff
git log -3 --oneline
```

- Do not commit `.env`, `.firebase/`, `dist/`, or `node_modules/`
- If there are no changes to commit, skip commit/push and deploy only if the user still wants live updated

### 2. Build must pass

```bash
npm run build
```

Fix TypeScript or build errors before committing. Do not deploy a failing build.

### 3. Commit

Only when the user requested deploy/push (or explicitly asked to commit).

Draft a 1–2 sentence message focused on **why**, matching recent repo style.

**PowerShell commit example:**

```powershell
git add -A
git commit -m "Short summary of why these changes ship."
```

Git safety rules:

- Never `--force` push to `main`
- Never skip hooks unless the user explicitly asks
- Never amend unless HEAD was created this session, not pushed, and amend was requested

### 4. Push to GitHub

```bash
git push origin HEAD
```

Use the current branch name if not `main`. Confirm remote is up to date after push.

### 5. Deploy to Firebase

Primary command (from [package.json](../../../package.json)):

```bash
npm run deploy
```

This runs `npm run build` then:

```bash
firebase deploy --only hosting,firestore:rules,storage
```

**If Storage deploy fails** (Storage not enabled on the project):

```bash
firebase deploy --only hosting,firestore:rules
```

Tell the user to enable Storage in Firebase Console if they need storage rules live.

### 6. Report back

Return to the user:

- Commit SHA and branch pushed (if applicable)
- Hosting URL: https://madridev-119f7.web.app
- What was deployed (hosting, Firestore rules, storage)
- Any failures or skipped steps (e.g. missing App Check env, Storage not set up)

## Common failures

| Error | Action |
|-------|--------|
| `tsc` / build error | Fix code; do not deploy |
| Firebase auth error | Run `firebase login` |
| Storage not set up | Deploy `hosting,firestore:rules` only |
| Contact form fails after deploy | Ensure `VITE_FIREBASE_APP_CHECK_SITE_KEY` is in `.env` at build time; redeploy |
| Nothing to commit | Push skipped; deploy only if requested |

## Optional checks

Before deploy on large changes:

```bash
npm run typecheck
```

After deploy, optionally verify:

```bash
git status
```

Working tree should be clean if everything was committed.
