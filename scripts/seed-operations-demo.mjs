/**
 * Seeds Dang Lifestyle operations demo data: products, ASNs, and damage claims.
 * Uses Firebase CLI access token (bypasses client security rules).
 *
 * Usage:
 *   node scripts/seed-operations-demo.mjs
 */
import { execFileSync } from 'node:child_process';

const PROJECT_ID = 'madridev-119f7';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
  if (value === null) {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
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

const now = new Date().toISOString();
const dims = (l, w, h) => ({ lengthCm: l, widthCm: w, heightCm: h });

const PRODUCTS = [
  {
    id: 'inv-dl-a001',
    name: 'Linen Throw — Sand',
    sku: 'DL-A001',
    stock: 48,
    weightKg: 0.85,
    dimensions: dims(180, 130, 2),
    cartonWeightKg: 4.2,
    cartonDimensions: dims(40, 30, 25),
    photoUrl: '',
    barcode: '',
    barcodeStatus: 'missing',
    shopifySyncStatus: 'not_linked',
    barcodeValue: 'DL-A001',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-a002',
    name: 'Ceramic Vase — Terracotta',
    sku: 'DL-A002',
    stock: 32,
    weightKg: 1.2,
    dimensions: dims(22, 22, 28),
    cartonWeightKg: 6.5,
    cartonDimensions: dims(45, 35, 30),
    photoUrl: '',
    barcode: '',
    barcodeStatus: 'missing',
    shopifySyncStatus: 'not_linked',
    barcodeValue: 'DL-A002',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-a003',
    name: 'Rattan Basket — Medium',
    sku: 'DL-A003',
    stock: 24,
    weightKg: 0.6,
    dimensions: dims(35, 35, 25),
    cartonWeightKg: 3.8,
    cartonDimensions: dims(38, 38, 28),
    photoUrl: '',
    barcode: '',
    barcodeStatus: 'missing',
    shopifySyncStatus: 'not_linked',
    barcodeValue: 'DL-A003',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-a004',
    name: 'Cotton Cushion Cover — Sage',
    sku: 'DL-A004',
    stock: 60,
    weightKg: 0.25,
    dimensions: dims(45, 45, 3),
    cartonWeightKg: 2.1,
    cartonDimensions: dims(30, 25, 20),
    photoUrl: '',
    barcode: '',
    barcodeStatus: 'missing',
    shopifySyncStatus: 'not_linked',
    barcodeValue: 'DL-A004',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-a005',
    name: 'Brass Candle Holder',
    sku: 'DL-A005',
    stock: 18,
    weightKg: 0.45,
    dimensions: dims(8, 8, 18),
    cartonWeightKg: 2.5,
    cartonDimensions: dims(25, 20, 15),
    photoUrl: '',
    barcode: '',
    barcodeStatus: 'missing',
    shopifySyncStatus: 'not_linked',
    barcodeValue: 'DL-A005',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-a006',
    name: 'Jute Rug — Natural 120×180',
    sku: 'DL-A006',
    stock: 12,
    weightKg: 3.2,
    dimensions: dims(180, 120, 4),
    cartonWeightKg: 8.0,
    cartonDimensions: dims(50, 40, 15),
    photoUrl: '',
    barcode: '',
    barcodeStatus: 'missing',
    shopifySyncStatus: 'not_linked',
    barcodeValue: 'DL-A006',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-a007',
    name: 'Woven Wall Hanging',
    sku: 'DL-A007',
    stock: 15,
    weightKg: 0.55,
    dimensions: dims(60, 40, 2),
    cartonWeightKg: 1.8,
    cartonDimensions: dims(35, 25, 8),
    photoUrl: '',
    barcode: '',
    barcodeStatus: 'missing',
    shopifySyncStatus: 'not_linked',
    barcodeValue: 'DL-A007',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-b001',
    name: 'Scented Candle — Cedarwood & Sage',
    sku: 'DL-B001',
    stock: 90,
    weightKg: 0.35,
    dimensions: dims(9, 9, 10),
    cartonWeightKg: 4.0,
    cartonDimensions: dims(30, 25, 20),
    photoUrl: '',
    barcode: '012345678905',
    barcodeStatus: 'verified',
    shopifySyncStatus: 'synced',
    shopifyVariantId: 'gid://shopify/ProductVariant/482910001',
    barcodeValue: '012345678905',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-b002',
    name: 'Hand Towel Set — Ivory',
    sku: 'DL-B002',
    stock: 45,
    weightKg: 0.5,
    dimensions: dims(70, 40, 8),
    cartonWeightKg: 3.2,
    cartonDimensions: dims(35, 28, 22),
    photoUrl: '',
    barcode: '023456789012',
    barcodeStatus: 'ready',
    shopifySyncStatus: 'synced',
    shopifyVariantId: 'gid://shopify/ProductVariant/482910002',
    barcodeValue: '023456789012',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'inv-dl-b003',
    name: 'Bamboo Serving Tray',
    sku: 'DL-B003',
    stock: 28,
    weightKg: 0.9,
    dimensions: dims(45, 30, 4),
    cartonWeightKg: 5.5,
    cartonDimensions: dims(48, 33, 8),
    photoUrl: '',
    barcode: '034567890123',
    barcodeStatus: 'verified',
    shopifySyncStatus: 'synced',
    shopifyVariantId: 'gid://shopify/ProductVariant/482910003',
    barcodeValue: '034567890123',
    createdAt: now,
    updatedAt: now,
  },
];

const ASNS = [
  {
    id: 'asn-dl-draft01',
    warehouse: '',
    shipmentDate: '',
    poReference: 'PO-DL-DRAFT',
    carrier: '',
    trackingReference: '',
    expectedArrival: '',
    status: 'draft',
    lineItems: [
      {
        productId: 'inv-dl-a001',
        sku: 'DL-A001',
        barcode: '',
        productName: 'Linen Throw — Sand',
        quantity: 10,
        cartonWeightKg: 4.2,
        cartonDimensions: dims(40, 30, 25),
      },
    ],
    validationIssues: [
      {
        severity: 'error',
        code: 'MISSING_BARCODE',
        message: 'Linen Throw — Sand has no barcode — fix in Product Manager.',
        productId: 'inv-dl-a001',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'asn-dl-valid01',
    warehouse: 'Dallas, TX — Fulfillment Center',
    shipmentDate: '2026-09-20',
    poReference: 'PO-DL-2026-042',
    carrier: 'UPS',
    trackingReference: '1Z999AA10123456784',
    expectedArrival: '2026-09-28',
    status: 'validated',
    lineItems: [
      {
        productId: 'inv-dl-b001',
        sku: 'DL-B001',
        barcode: '012345678905',
        productName: 'Scented Candle — Cedarwood & Sage',
        quantity: 50,
        cartonWeightKg: 4.0,
        cartonDimensions: dims(30, 25, 20),
      },
      {
        productId: 'inv-dl-b002',
        sku: 'DL-B002',
        barcode: '023456789012',
        productName: 'Hand Towel Set — Ivory',
        quantity: 30,
        cartonWeightKg: 3.2,
        cartonDimensions: dims(35, 28, 22),
      },
    ],
    validationIssues: [
      {
        severity: 'warning',
        code: 'UNVERIFIED_BARCODE',
        message: 'Hand Towel Set — Ivory barcode is not verified.',
        productId: 'inv-dl-b002',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'asn-dl-gen01',
    warehouse: 'Allentown, PA — East Coast Hub',
    shipmentDate: '2026-09-15',
    poReference: 'PO-DL-2026-038',
    carrier: 'FedEx',
    trackingReference: '794612345678',
    expectedArrival: '2026-09-22',
    status: 'submitted',
    lineItems: [
      {
        productId: 'inv-dl-b003',
        sku: 'DL-B003',
        barcode: '034567890123',
        productName: 'Bamboo Serving Tray',
        quantity: 20,
        cartonWeightKg: 5.5,
        cartonDimensions: dims(48, 33, 8),
      },
    ],
    validationIssues: [],
    generatedFileName: '3PL-ASN-PO-DL-2026-038-2026-09-15.xlsx',
    createdAt: now,
    updatedAt: now,
  },
];

const defaultRefund = (customer, shipping, shopify = 'pending', claim = 'pending', notified = false) => ({
  customerRefund: customer,
  shippingRefund: shipping,
  shopifyRefundStatus: shopify,
  claimRefundStatus: claim,
  customerNotified: notified,
});

const CLAIMS = [
  {
    id: 'claim-dl-1024',
    displayId: 'DL-1024',
    orderNumber: '#DL-10482',
    customerName: 'Jane Smith',
    productId: 'inv-dl-b001',
    productName: 'Scented Candle — Cedarwood & Sage',
    quantity: 1,
    issueType: 'damaged',
    status: 'new',
    responsibility: 'unknown',
    resolution: null,
    evidence: [{ id: 'ev-1', label: 'Cracked jar photo', url: 'https://picsum.photos/seed/dl1024/800/600' }],
    refund: defaultRefund(0, 0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1025',
    displayId: 'DL-1025',
    orderNumber: '#DL-10490',
    customerName: 'Michael Johnson',
    productId: 'inv-dl-b002',
    productName: 'Hand Towel Set — Ivory',
    quantity: 1,
    issueType: 'missing',
    status: 'investigating',
    responsibility: 'carrier',
    resolution: null,
    evidence: [{ id: 'ev-1', label: 'Empty package photo', url: 'https://picsum.photos/seed/dl1025/800/600' }],
    refund: defaultRefund(0, 0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1026',
    displayId: 'DL-1026',
    orderNumber: '#DL-10501',
    customerName: 'Emily Davis',
    productId: 'inv-dl-a001',
    productName: 'Linen Throw — Sand',
    quantity: 1,
    issueType: 'damaged',
    status: 'waiting_3pl',
    responsibility: '3pl',
    resolution: null,
    evidence: [{ id: 'ev-1', label: 'Torn packaging', url: 'https://picsum.photos/seed/dl1026/800/600' }],
    refund: defaultRefund(0, 0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1027',
    displayId: 'DL-1027',
    orderNumber: '#DL-10512',
    customerName: 'Robert Williams',
    productId: 'inv-dl-b003',
    productName: 'Bamboo Serving Tray',
    quantity: 1,
    issueType: 'wrong_item',
    status: 'waiting_3pl',
    responsibility: 'warehouse',
    resolution: null,
    evidence: [{ id: 'ev-1', label: 'Wrong SKU received', url: 'https://picsum.photos/seed/dl1027/800/600' }],
    refund: defaultRefund(0, 0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1028',
    displayId: 'DL-1028',
    orderNumber: '#DL-10520',
    customerName: 'Sarah Martinez',
    productId: 'inv-dl-b001',
    productName: 'Scented Candle — Cedarwood & Sage',
    quantity: 2,
    issueType: 'damaged',
    status: 'waiting_3pl',
    responsibility: '3pl',
    resolution: null,
    evidence: [{ id: 'ev-1', label: 'Leak damage', url: 'https://picsum.photos/seed/dl1028/800/600' }],
    refund: defaultRefund(0, 0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1029',
    displayId: 'DL-1029',
    orderNumber: '#DL-10533',
    customerName: 'David Anderson',
    productId: 'inv-dl-a004',
    productName: 'Cotton Cushion Cover — Sage',
    quantity: 1,
    issueType: 'damaged',
    status: 'waiting_3pl',
    responsibility: 'carrier',
    resolution: null,
    evidence: [{ id: 'ev-1', label: 'Stain on fabric', url: 'https://picsum.photos/seed/dl1029/800/600' }],
    refund: defaultRefund(0, 0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1030',
    displayId: 'DL-1030',
    orderNumber: '#DL-10544',
    customerName: 'Jessica Thompson',
    productId: 'inv-dl-b002',
    productName: 'Hand Towel Set — Ivory',
    quantity: 1,
    issueType: 'missing',
    status: 'waiting_3pl',
    responsibility: '3pl',
    resolution: null,
    evidence: [{ id: 'ev-1', label: 'Packing slip', url: 'https://picsum.photos/seed/dl1030/800/600' }],
    refund: defaultRefund(0, 0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1031',
    displayId: 'DL-1031',
    orderNumber: '#DL-10555',
    customerName: 'Christopher Brown',
    productId: 'inv-dl-b003',
    productName: 'Bamboo Serving Tray',
    quantity: 1,
    issueType: 'damaged',
    status: 'approved',
    responsibility: '3pl',
    resolution: 'refund',
    evidence: [{ id: 'ev-1', label: 'Cracked tray', url: 'https://picsum.photos/seed/dl1031/800/600' }],
    refund: defaultRefund(45.9, 5.0, 'pending', 'pending'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1032',
    displayId: 'DL-1032',
    orderNumber: '#DL-10566',
    customerName: 'Amanda Wilson',
    productId: 'inv-dl-b001',
    productName: 'Scented Candle — Cedarwood & Sage',
    quantity: 1,
    issueType: 'damaged',
    status: 'approved',
    responsibility: 'carrier',
    resolution: 'refund',
    evidence: [{ id: 'ev-1', label: 'Broken lid', url: 'https://picsum.photos/seed/dl1032/800/600' }],
    refund: defaultRefund(28.5, 5.0, 'pending', 'pending'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'claim-dl-1033',
    displayId: 'DL-1033',
    orderNumber: '#DL-10577',
    customerName: 'James Taylor',
    productId: 'inv-dl-b002',
    productName: 'Hand Towel Set — Ivory',
    quantity: 1,
    issueType: 'damaged',
    status: 'refunded',
    responsibility: '3pl',
    resolution: 'refund',
    evidence: [{ id: 'ev-1', label: 'Return photo', url: 'https://picsum.photos/seed/dl1033/800/600' }],
    refund: defaultRefund(32.0, 5.0, 'completed', 'completed', true),
    createdAt: now,
    updatedAt: now,
  },
];

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const TASKS = [
  {
    id: 'task-dl-001',
    title: 'Fix 7 missing product barcodes',
    description: 'Generate and verify barcodes before the next ASN shipment.',
    completed: false,
    priority: 1,
    dueDate: offsetDate(0),
    project: 'barcodes',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-dl-002',
    title: 'Complete draft ASN PO-DL-DRAFT',
    description: 'Add warehouse, carrier, and remaining line items.',
    completed: false,
    priority: 2,
    dueDate: offsetDate(0),
    project: 'asn',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-dl-003',
    title: 'Follow up on 3PL for claim DL-1026',
    description: 'Waiting on packaging investigation response.',
    completed: false,
    priority: 2,
    dueDate: offsetDate(-1),
    project: 'claims',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-dl-004',
    title: 'Process Shopify refunds for DL-1031 and DL-1032',
    description: 'Both claims approved — refunds still pending in Shopify.',
    completed: false,
    priority: 1,
    dueDate: offsetDate(0),
    project: 'refunds',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-dl-005',
    title: 'Validate ASN PO-DL-2026-042 line items',
    description: 'Confirm Hand Towel Set barcode verification status.',
    completed: false,
    priority: 3,
    dueDate: offsetDate(2),
    project: 'asn',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-dl-006',
    title: 'Sync verified SKUs to Shopify',
    description: 'Push Cedarwood & Sage and Bamboo Serving Tray updates.',
    completed: false,
    priority: 3,
    dueDate: offsetDate(3),
    project: 'barcodes',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-dl-007',
    title: 'Review open damage claims summary',
    description: 'Weekly ops review with fulfillment team.',
    completed: false,
    priority: 4,
    dueDate: offsetDate(5),
    project: 'claims',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-dl-008',
    title: 'Archive closed claim DL-1033 documentation',
    description: 'Refund completed and customer notified.',
    completed: true,
    priority: 4,
    dueDate: offsetDate(-3),
    project: 'claims',
    createdAt: now,
    updatedAt: now,
  },
];

const token = getAccessToken();

for (const product of PRODUCTS) {
  await upsert(token, 'inventoryItems', product.id, product);
  console.log(`Seeded inventoryItems/${product.id}`);
}

for (const asn of ASNS) {
  await upsert(token, 'asns', asn.id, asn);
  console.log(`Seeded asns/${asn.id}`);
}

for (const claim of CLAIMS) {
  await upsert(token, 'damageClaims', claim.id, claim);
  console.log(`Seeded damageClaims/${claim.id}`);
}

for (const task of TASKS) {
  await upsert(token, 'operationsTasks', task.id, task);
  console.log(`Seeded operationsTasks/${task.id}`);
}

console.log(
  `Seeded ${PRODUCTS.length} products, ${ASNS.length} ASNs, ${CLAIMS.length} claims, and ${TASKS.length} tasks for Dang Lifestyle Operations.`,
);
