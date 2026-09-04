/**
 * Seeds demo properties and applications into Firestore using the logged-in
 * Firebase CLI account. Client security rules deny these writes, so this
 * script talks to the Firestore REST API with the CLI's Google access token.
 *
 * Usage: node scripts/seed-demo.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ID = 'madridev-119f7';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'src/data/demo-listings.json'), 'utf8'));

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
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (value && typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [key, toFirestoreValue(nested)]),
        ),
      },
    };
  }
  throw new Error(`Unsupported seed value: ${typeof value}`);
}

function toDocument(fields) {
  return {
    fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, toFirestoreValue(value)])),
  };
}

async function upsert(token, collection, id, fields) {
  const url = `${BASE}/${collection}/${id}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toDocument(fields)),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to write ${collection}/${id}: ${response.status} ${body}`);
  }
}

const token = getAccessToken();

for (const property of seed.DEMO_PROPERTIES) {
  await upsert(token, 'properties', property.propertyId, property);
  console.log(`Seeded properties/${property.propertyId}`);
}

for (const application of seed.DEMO_APPLICATIONS) {
  await upsert(token, 'applications', application.applicationId, application);
  console.log(`Seeded applications/${application.applicationId}`);
}

console.log(
  `Seeded ${seed.DEMO_PROPERTIES.length} properties and ${seed.DEMO_APPLICATIONS.length} applications.`,
);
