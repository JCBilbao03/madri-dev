import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function readEnvToken() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return undefined;
  }

  const match = fs.readFileSync(envPath, 'utf8').match(/^VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=(.+)$/m);
  return match?.[1]?.trim();
}

const debugToken = process.argv[2] ?? process.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN ?? readEnvToken();

if (!debugToken) {
  console.error('Usage: node scripts/register-app-check-debug-token.mjs <uuid-debug-token>');
  process.exit(1);
}

const cfgPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const accessToken = cfg.tokens?.access_token;
const expiresAt = cfg.tokens?.expires_at ?? 0;

if (!accessToken) {
  console.error('No Firebase CLI access token found. Run: npx firebase login');
  process.exit(1);
}

if (Date.now() > expiresAt - 60_000) {
  console.error('Firebase CLI token expired. Run: npx firebase login');
  process.exit(1);
}

const tokenJson = { access_token: accessToken };

const projectNumber = '1070631792638';
const appId = encodeURIComponent('1:1070631792638:web:ab81d45c7adaf2272c9aaf');
const url = `https://firebaseappcheck.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/debugTokens`;

const createRes = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenJson.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    displayName: 'Localhost dev (MadriBuild)',
    token: debugToken,
  }),
});

const body = await createRes.text();

if (!createRes.ok) {
  console.error(`Failed (${createRes.status}):`, body);
  process.exit(1);
}

console.log('App Check debug token registered successfully.');
console.log(body);
