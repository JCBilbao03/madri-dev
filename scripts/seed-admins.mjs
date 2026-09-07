/**
 * Creates or updates Firebase Auth users and writes admin Firestore profiles.
 * Client rules cannot create role=admin, so Firestore writes use the CLI token.
 *
 * Usage: ADMIN_PASSWORD=<password> node scripts/seed-admins.mjs
 */
import { execFileSync } from 'node:child_process';

const PROJECT_ID = 'madridev-119f7';
const AUTH_BASE = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}`;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const ADMINS = [
  { email: 'jc@madridev.com', name: 'JC' },
  { email: 'mari@madridev.com', name: 'Mari' },
  { email: 'carla@madridev.com', name: 'Carla' },
  { email: 'ysay@madridev.com', name: 'Ysay' },
];

function getAccessToken() {
  const raw = execFileSync('firebase', ['login:list', '--json'], {
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(raw);
  const token = parsed?.result?.[0]?.tokens?.access_token;
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('No Firebase CLI access token. Run firebase login first.');
  }
  return token;
}

function toFirestoreValue(value) {
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [key, toFirestoreValue(nested)]),
        ),
      },
    };
  }
  throw new Error(`Unsupported value: ${typeof value}`);
}

async function authRequest(token, path, body) {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message ?? JSON.stringify(payload);
    throw new Error(`${path} failed: ${response.status} ${message}`);
  }
  return payload;
}

async function lookupLocalId(token, email) {
  try {
    const payload = await authRequest(token, '/accounts:lookup', { email: [email] });
    const localId = payload?.users?.[0]?.localId;
    return typeof localId === 'string' ? localId : null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('USER_NOT_FOUND')) {
      return null;
    }
    throw error;
  }
}

async function ensureAuthUser(token, email, password, displayName) {
  const existingId = await lookupLocalId(token, email);
  if (existingId) {
    await authRequest(token, '/accounts:update', {
      localId: existingId,
      password,
      displayName,
      emailVerified: true,
    });
    return existingId;
  }

  const created = await authRequest(token, '/accounts', {
    email,
    password,
    displayName,
    emailVerified: true,
  });
  if (typeof created.localId !== 'string') {
    throw new Error(`Create returned no localId for ${email}`);
  }
  return created.localId;
}

async function upsertAdminProfile(token, uid, name, email) {
  const response = await fetch(`${FIRESTORE_BASE}/users/${uid}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        uid: toFirestoreValue(uid),
        role: toFirestoreValue('admin'),
        name: toFirestoreValue(name),
        email: toFirestoreValue(email),
        profileData: toFirestoreValue({}),
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to write users/${uid}: ${response.status} ${body}`);
  }
}

const password = process.env.ADMIN_PASSWORD;
if (typeof password !== 'string' || password.length < 6) {
  throw new Error('Set ADMIN_PASSWORD to a password of at least six characters.');
}

const token = getAccessToken();

for (const admin of ADMINS) {
  const uid = await ensureAuthUser(token, admin.email, password, admin.name);
  await upsertAdminProfile(token, uid, admin.name, admin.email);
  console.log(`Admin ready: ${admin.email} (${uid})`);
}
