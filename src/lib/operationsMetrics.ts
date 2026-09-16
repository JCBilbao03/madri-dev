import type { InventoryItem } from '@/types/inventory';
import type { Asn, DamageClaim } from '@/types/operations';
import { hasBlockingIssues, isAsnIncomplete } from '@/lib/asnValidation';

export interface ActionRequiredItem {
  id: string;
  label: string;
  count: number;
  href: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OperationsMetrics {
  totalProducts: number;
  missingBarcodes: number;
  pendingAsns: number;
  openClaims: number;
  refundsPending: number;
  ordersRequiringAttention: number;
}

export interface ClaimStatusCounts {
  new: number;
  investigating: number;
  waiting_3pl: number;
  approved: number;
  refunded: number;
  closed: number;
}

export function countMissingBarcodes(items: InventoryItem[]): number {
  return items.filter((item) => item.barcodeStatus === 'missing' || !item.barcode.trim()).length;
}

export function countPendingAsns(asns: Asn[]): number {
  return asns.filter((asn) => isAsnIncomplete(asn)).length;
}

export function countOpenClaims(claims: DamageClaim[]): number {
  return claims.filter((claim) => claim.status !== 'closed' && claim.status !== 'refunded').length;
}

export function countRefundsPending(claims: DamageClaim[]): number {
  return claims.filter(
    (claim) =>
      claim.status === 'approved' && claim.refund.shopifyRefundStatus === 'pending',
  ).length;
}

export function countOrdersRequiringAttention(
  claims: DamageClaim[],
  asns: Asn[],
): number {
  const newClaims = claims.filter((claim) => claim.status === 'new').length;
  const asnsWithErrors = asns.filter((asn) => hasBlockingIssues(asn.validationIssues)).length;
  return newClaims + asnsWithErrors;
}

export function computeOperationsMetrics(
  items: InventoryItem[],
  asns: Asn[],
  claims: DamageClaim[],
): OperationsMetrics {
  return {
    totalProducts: items.length,
    missingBarcodes: countMissingBarcodes(items),
    pendingAsns: countPendingAsns(asns),
    openClaims: countOpenClaims(claims),
    refundsPending: countRefundsPending(claims),
    ordersRequiringAttention: countOrdersRequiringAttention(claims, asns),
  };
}

export function computeClaimStatusCounts(claims: DamageClaim[]): ClaimStatusCounts {
  const counts: ClaimStatusCounts = {
    new: 0,
    investigating: 0,
    waiting_3pl: 0,
    approved: 0,
    refunded: 0,
    closed: 0,
  };

  for (const claim of claims) {
    counts[claim.status] += 1;
  }

  return counts;
}

export function buildActionRequiredItems(
  items: InventoryItem[],
  asns: Asn[],
  claims: DamageClaim[],
): ActionRequiredItem[] {
  const actions: ActionRequiredItem[] = [];

  const missingBarcodes = countMissingBarcodes(items);
  if (missingBarcodes > 0) {
    actions.push({
      id: 'missing-barcodes',
      label: `${missingBarcodes} product${missingBarcodes === 1 ? '' : 's'} missing barcodes`,
      count: missingBarcodes,
      href: '/inventory-app/products?filter=missing',
      priority: 'high',
    });
  }

  const pendingAsns = countPendingAsns(asns);
  if (pendingAsns > 0) {
    actions.push({
      id: 'incomplete-asns',
      label: `${pendingAsns} ASN${pendingAsns === 1 ? '' : 's'} incomplete`,
      count: pendingAsns,
      href: '/inventory-app/asn?filter=incomplete',
      priority: 'high',
    });
  }

  const waiting3pl = claims.filter((claim) => claim.status === 'waiting_3pl').length;
  if (waiting3pl > 0) {
    actions.push({
      id: 'waiting-3pl',
      label: `${waiting3pl} claim${waiting3pl === 1 ? '' : 's'} waiting for 3PL`,
      count: waiting3pl,
      href: '/inventory-app/claims?status=waiting_3pl',
      priority: 'medium',
    });
  }

  const refundsPending = countRefundsPending(claims);
  if (refundsPending > 0) {
    actions.push({
      id: 'pending-refunds',
      label: `${refundsPending} refund${refundsPending === 1 ? '' : 's'} approved but not processed`,
      count: refundsPending,
      href: '/inventory-app/claims?status=approved',
      priority: 'high',
    });
  }

  const syncPending = items.filter((item) => item.shopifySyncStatus === 'pending').length;
  if (syncPending > 0) {
    actions.push({
      id: 'shopify-pending',
      label: `${syncPending} product${syncPending === 1 ? '' : 's'} syncing to Shopify`,
      count: syncPending,
      href: '/inventory-app/products?filter=sync_pending',
      priority: 'low',
    });
  }

  return actions.sort((left, right) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[left.priority] - priorityOrder[right.priority];
  });
}

export function countProductsRequiringAttention(items: InventoryItem[]): number {
  return items.filter(
    (item) =>
      item.barcodeStatus === 'missing' ||
      !item.barcode.trim() ||
      item.shopifySyncStatus === 'pending' ||
      item.shopifySyncStatus === 'error',
  ).length;
}
