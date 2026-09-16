const SHOPIFY_SYNC_DELAY_MS = 1500;
const THREE_PL_DELAY_MS = 1200;

export interface SimulatedActionResult {
  success: boolean;
  message: string;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function simulateShopifySyncDelay(): Promise<SimulatedActionResult> {
  await delay(SHOPIFY_SYNC_DELAY_MS);
  return { success: true, message: 'Product synced to Shopify (simulated).' };
}

export async function simulate3plRequestDelay(): Promise<SimulatedActionResult> {
  await delay(THREE_PL_DELAY_MS);
  return { success: true, message: '3PL investigation request sent (simulated).' };
}

export async function simulateAsnSubmitDelay(): Promise<SimulatedActionResult> {
  await delay(THREE_PL_DELAY_MS);
  return { success: true, message: 'ASN submitted to 3PL (simulated).' };
}

export function generateDemoEan(): string {
  const suffix = Math.floor(Math.random() * 100_000_000_000)
    .toString()
    .padStart(11, '0');
  return `0${suffix}`;
}

export function build3plRequestSummary(params: {
  displayId: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  issueType: string;
}): string {
  return [
    '3PL INVESTIGATION REQUEST (DEMO)',
    '--------------------------------',
    `Claim: ${params.displayId}`,
    `Order: ${params.orderNumber}`,
    `Customer: ${params.customerName}`,
    `Product: ${params.productName} × ${params.quantity}`,
    `Issue: ${params.issueType}`,
    '',
    'Please investigate packaging damage and confirm responsibility.',
    'Reply with photos and disposition within 48 hours.',
  ].join('\n');
}
