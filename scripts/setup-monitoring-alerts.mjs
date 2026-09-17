/**
 * Creates Cloud Monitoring email notification channels and alert policies for
 * MadriBuild. Uses the Firebase CLI access token (same auth as seed-admins).
 *
 * Usage:
 *   ALERT_EMAIL=you@example.com npm run monitoring:setup-alerts
 *
 * Optional env:
 *   FIREBASE_PROJECT_ID — defaults to madridev-119f7
 *   ALERT_EMAIL — defaults to the logged-in Firebase CLI user email
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? 'madridev-119f7';
const MONITORING_BASE = `https://monitoring.googleapis.com/v3/projects/${PROJECT_ID}`;
const POLICY_PREFIX = 'MadriBuild —';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const POLICIES_DIR = path.join(SCRIPT_DIR, '..', 'monitoring', 'alert-policies');

function getFirebaseAuth() {
  const raw = execFileSync('firebase', ['login:list', '--json'], {
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(raw);
  const entry = parsed?.result?.[0];
  const accessToken = entry?.tokens?.access_token;
  const email = entry?.user?.email;

  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new Error('No Firebase CLI access token. Run: npx firebase login');
  }

  return { accessToken, email };
}

async function monitoringRequest(token, method, urlPath, body) {
  const response = await fetch(`${MONITORING_BASE}${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? JSON.stringify(payload.error)
        : String(payload);
    throw new Error(`${method} ${urlPath} failed: ${response.status} ${message}`);
  }

  return payload;
}

async function listNotificationChannels(token) {
  const payload = await monitoringRequest(token, 'GET', '/notificationChannels', undefined);
  return payload?.notificationChannels ?? [];
}

async function ensureEmailChannel(token, email) {
  const existing = (await listNotificationChannels(token)).find(
    (channel) =>
      channel.type === 'email' &&
      channel.labels?.email_address?.toLowerCase() === email.toLowerCase(),
  );

  if (existing?.name) {
    console.log(`Using notification channel: ${email} (${existing.name})`);
    return existing.name;
  }

  const created = await monitoringRequest(token, 'POST', '/notificationChannels', {
    type: 'email',
    displayName: `MadriBuild alerts (${email})`,
    labels: {
      email_address: email,
    },
    enabled: true,
  });

  if (typeof created?.name !== 'string') {
    throw new Error(`Failed to create notification channel for ${email}`);
  }

  console.log(`Created notification channel: ${email} (${created.name})`);
  return created.name;
}

async function listAlertPolicies(token) {
  const payload = await monitoringRequest(token, 'GET', '/alertPolicies', undefined);
  return payload?.alertPolicies ?? [];
}

async function ensureAlertPolicy(token, policyFile, notificationChannelName) {
  const policyPath = path.join(POLICIES_DIR, policyFile);
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  const displayName = policy.displayName;

  const existing = (await listAlertPolicies(token)).find(
    (item) => item.displayName === displayName,
  );

  if (existing?.name) {
    console.log(`Alert policy already exists: ${displayName}`);
    return existing.name;
  }

  const created = await monitoringRequest(token, 'POST', '/alertPolicies', {
    ...policy,
    notificationChannels: [notificationChannelName],
  });

  if (typeof created?.name !== 'string') {
    throw new Error(`Failed to create alert policy from ${policyFile}`);
  }

  console.log(`Created alert policy: ${displayName}`);
  return created.name;
}

const POLICY_FILES = [
  'firestore-write-spike.json',
  'firestore-rules-denials.json',
  'storage-write-spike.json',
  'app-check-invalid.json',
];

const { accessToken, email: cliEmail } = getFirebaseAuth();
const alertEmail = process.env.ALERT_EMAIL ?? cliEmail;

if (typeof alertEmail !== 'string' || !alertEmail.includes('@')) {
  throw new Error('Set ALERT_EMAIL to a valid email address.');
}

console.log(`Project: ${PROJECT_ID}`);
console.log(`Alert email: ${alertEmail}`);

const channelName = await ensureEmailChannel(accessToken, alertEmail);

for (const policyFile of POLICY_FILES) {
  await ensureAlertPolicy(accessToken, policyFile, channelName);
}

console.log('\nMonitoring alerts are configured.');
console.log('Next: create a billing budget alert in the Firebase / Google Cloud console.');
console.log('See monitoring/ALERTS.md for budget setup and threshold tuning.');
