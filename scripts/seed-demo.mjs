/**
 * Seeds demo properties, applications, and leads into Firestore using the
 * logged-in Firebase CLI account. Client security rules deny some of these
 * writes, so this script talks to the Firestore REST API with the CLI's
 * Google access token.
 *
 * Usage:
 *   node scripts/seed-demo.mjs
 *   node scripts/seed-demo.mjs --admin-uid <firebaseAuthUid>
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

async function patchFields(token, collection, id, fields) {
  const mask = Object.keys(fields)
    .map((key) => `updateMask.fields=${encodeURIComponent(key)}`)
    .join('&');
  const url = `${BASE}/${collection}/${id}?${mask}`;
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
    throw new Error(`Failed to patch ${collection}/${id}: ${response.status} ${body}`);
  }
}

async function getDocument(token, collection, id) {
  const url = `${BASE}/${collection}/${id}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to read ${collection}/${id}: ${response.status} ${body}`);
  }

  return response.json();
}

function parseAdminUid() {
  const fromEnv = process.env.ADMIN_UID;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv;
  }

  const flag = process.argv.find((arg) => arg.startsWith('--admin-uid='));
  if (flag) {
    return flag.slice('--admin-uid='.length);
  }

  const index = process.argv.indexOf('--admin-uid');
  if (index !== -1 && typeof process.argv[index + 1] === 'string') {
    return process.argv[index + 1];
  }

  return '';
}

const SAMPLE_LEADS = [
  {
    leadId: 'ld-seed-mkt-01',
    appId: 'marketing',
    source: 'contact-form',
    name: 'Avery Chen',
    email: 'avery.chen@example.com',
    summary: 'Looking for a tenant portal that can handle applications and screening questions.',
    status: 'new',
    createdAt: '2026-09-07T02:15:00.000Z',
    metadata: {},
  },
  {
    leadId: 'ld-seed-mkt-02',
    appId: 'marketing',
    source: 'contact-form',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    summary: 'Need a cleaning marketplace MVP in eight weeks, with booking and cleaner dashboards.',
    status: 'contacted',
    createdAt: '2026-09-05T11:40:00.000Z',
    metadata: {},
  },
  {
    leadId: 'ld-seed-mkt-03',
    appId: 'marketing',
    source: 'contact-form',
    name: 'Sam Ortiz',
    email: 'sam.ortiz@example.com',
    summary: 'Want to replace a spreadsheet ops tool with a role-based internal dashboard.',
    status: 'qualified',
    createdAt: '2026-09-02T16:05:00.000Z',
    metadata: {},
  },
  {
    leadId: 'ld-seed-mkt-04',
    appId: 'marketing',
    source: 'contact-form',
    name: 'Elena Voss',
    email: 'elena.voss@example.com',
    summary: 'Asked for a performance audit on an existing React app; decided to pause.',
    status: 'closed',
    createdAt: '2026-08-28T09:20:00.000Z',
    metadata: {},
  },
  {
    leadId: 'ld-seed-rent-01',
    appId: 'rental',
    source: 'rental-application',
    name: 'Jordan Blake',
    email: 'jordan.blake@example.com',
    summary: 'Application for Sunlit 1BR in Austin',
    status: 'new',
    createdAt: '2026-09-06T08:30:00.000Z',
    metadata: {
      propertyId: 'prop-bgc-1br',
      applicationId: 'app-bgc-pending',
      tenantId: 'demo-tenant',
    },
  },
  {
    leadId: 'ld-seed-rent-02',
    appId: 'rental',
    source: 'rental-application',
    name: 'Casey Nguyen',
    email: 'casey.nguyen@example.com',
    summary: 'Application for Family 2BR in Lincoln Park',
    status: 'contacted',
    createdAt: '2026-09-03T14:10:00.000Z',
    metadata: {
      propertyId: 'prop-qc-2br',
      applicationId: 'app-qc-review',
      tenantId: 'demo-tenant-2',
    },
  },
  {
    leadId: 'ld-seed-rent-03',
    appId: 'rental',
    source: 'rental-application',
    name: 'Riley Gomez',
    email: 'riley.gomez@example.com',
    summary: 'Application for Quiet studio in Williamsburg',
    status: 'qualified',
    createdAt: '2026-09-01T19:45:00.000Z',
    metadata: {
      propertyId: 'prop-makati-studio',
      applicationId: 'app-seed-studio',
      tenantId: 'demo-tenant-3',
    },
  },
  {
    leadId: 'ld-seed-rent-04',
    appId: 'rental',
    source: 'rental-application',
    name: 'Morgan Hale',
    email: 'morgan.hale@example.com',
    summary: 'Application for Townhouse in RiNo',
    status: 'closed',
    createdAt: '2026-08-26T12:00:00.000Z',
    metadata: {
      propertyId: 'prop-alabang-house',
      applicationId: 'app-seed-townhouse',
      tenantId: 'demo-tenant-4',
    },
  },
  {
    leadId: 'ld-seed-clean-01',
    appId: 'cleaning',
    source: 'cleaning-booking',
    name: 'Hannah Park',
    email: 'hannah.park@example.com',
    summary: 'Deep clean with Maya Chen on 2026-09-12 at 10:00',
    status: 'new',
    createdAt: '2026-09-06T16:45:00.000Z',
    metadata: {
      bookingId: 'bk-seed01',
      cleanerId: 'maya-chen',
      serviceType: 'Deep clean',
      address: '88 Rainey Street, Austin',
    },
  },
  {
    leadId: 'ld-seed-clean-02',
    appId: 'cleaning',
    source: 'cleaning-booking',
    name: 'Chris Lang',
    email: 'chris.lang@example.com',
    summary: 'Standard clean with BrightNest on 2026-09-10 at 09:00',
    status: 'contacted',
    createdAt: '2026-09-04T10:12:00.000Z',
    metadata: {
      bookingId: 'bk-seed02',
      cleanerId: 'brightnest',
      serviceType: 'Standard clean',
      address: '1200 South Congress, Austin',
    },
  },
  {
    leadId: 'ld-seed-clean-03',
    appId: 'cleaning',
    source: 'cleaning-booking',
    name: 'Taylor Reed',
    email: 'taylor.reed@example.com',
    summary: 'Airbnb turnover with Maya Chen on 2026-09-08 at 14:00',
    status: 'qualified',
    createdAt: '2026-09-02T21:05:00.000Z',
    metadata: {
      bookingId: 'bk-seed03',
      cleanerId: 'maya-chen',
      serviceType: 'Airbnb turnover',
      address: '410 East 6th Street, Austin',
    },
  },
  {
    leadId: 'ld-seed-clean-04',
    appId: 'cleaning',
    source: 'cleaning-booking',
    name: 'Alex Kim',
    email: 'alex.kim@example.com',
    summary: 'Move-out clean with BrightNest on 2026-08-30 at 11:00',
    status: 'closed',
    createdAt: '2026-08-24T07:55:00.000Z',
    metadata: {
      bookingId: 'bk-seed04',
      cleanerId: 'brightnest',
      serviceType: 'Move-out',
      address: '900 West Lynn, Austin',
    },
  },
];

const token = getAccessToken();

for (const property of seed.DEMO_PROPERTIES) {
  await upsert(token, 'properties', property.propertyId, property);
  console.log(`Seeded properties/${property.propertyId}`);
}

for (const application of seed.DEMO_APPLICATIONS) {
  await upsert(token, 'applications', application.applicationId, application);
  console.log(`Seeded applications/${application.applicationId}`);
}

for (const lead of SAMPLE_LEADS) {
  await upsert(token, 'leads', lead.leadId, {
    ...lead,
    notes: [],
    assigneeId: '',
    assigneeName: '',
  });
  console.log(`Seeded leads/${lead.leadId}`);
}

const adminUid = parseAdminUid();
if (adminUid) {
  const existing = await getDocument(token, 'users', adminUid);
  if (!existing) {
    throw new Error(`No users/${adminUid} document found. Sign up first, then re-run with --admin-uid.`);
  }

  await patchFields(token, 'users', adminUid, { role: 'admin' });
  console.log(`Promoted users/${adminUid} to admin.`);
}

console.log(
  `Seeded ${seed.DEMO_PROPERTIES.length} properties, ${seed.DEMO_APPLICATIONS.length} applications, and ${SAMPLE_LEADS.length} leads.`,
);
