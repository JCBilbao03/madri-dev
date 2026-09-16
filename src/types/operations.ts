import type { Dimensions } from '@/types/inventory';

export type AsnStatus = 'draft' | 'validated' | 'generated' | 'submitted';

export type ValidationSeverity = 'error' | 'warning';

export interface AsnLineItem {
  productId: string;
  sku: string;
  barcode: string;
  productName: string;
  quantity: number;
  cartonWeightKg: number;
  cartonDimensions: Dimensions;
}

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  productId?: string;
}

export interface Asn {
  id: string;
  warehouse: string;
  shipmentDate: string;
  poReference: string;
  carrier: string;
  trackingReference: string;
  expectedArrival: string;
  status: AsnStatus;
  lineItems: AsnLineItem[];
  validationIssues: ValidationIssue[];
  generatedFileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AsnInput {
  warehouse: string;
  shipmentDate: string;
  poReference: string;
  carrier: string;
  trackingReference: string;
  expectedArrival: string;
  lineItems: AsnLineItem[];
}

export type ClaimIssueType = 'damaged' | 'missing' | 'wrong_item';

export type ClaimStatus =
  | 'new'
  | 'investigating'
  | 'waiting_3pl'
  | 'approved'
  | 'refunded'
  | 'closed';

export type ClaimResponsibility = 'customer' | 'carrier' | '3pl' | 'warehouse' | 'unknown';

export type ClaimResolution = 'refund' | 'replacement' | 'store_credit' | 'reject' | null;

export type ShopifyRefundStatus = 'pending' | 'completed';

export interface ClaimEvidence {
  id: string;
  label: string;
  url: string;
}

export interface ClaimRefund {
  customerRefund: number;
  shippingRefund: number;
  shopifyRefundStatus: ShopifyRefundStatus;
  claimRefundStatus: ShopifyRefundStatus;
  customerNotified: boolean;
}

export interface DamageClaim {
  id: string;
  displayId: string;
  orderNumber: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  issueType: ClaimIssueType;
  status: ClaimStatus;
  responsibility: ClaimResponsibility;
  resolution: ClaimResolution;
  evidence: ClaimEvidence[];
  refund: ClaimRefund;
  createdAt: string;
  updatedAt: string;
}

export interface DamageClaimInput {
  orderNumber: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  issueType: ClaimIssueType;
  evidence?: ClaimEvidence[];
}

function isDimensions(value: unknown): value is Dimensions {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.lengthCm === 'number' &&
    typeof item.widthCm === 'number' &&
    typeof item.heightCm === 'number'
  );
}

function isAsnLineItem(value: unknown): value is AsnLineItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'string' &&
    typeof item.sku === 'string' &&
    typeof item.barcode === 'string' &&
    typeof item.productName === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.cartonWeightKg === 'number' &&
    isDimensions(item.cartonDimensions)
  );
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    (item.severity === 'error' || item.severity === 'warning') &&
    typeof item.code === 'string' &&
    typeof item.message === 'string' &&
    (item.productId === undefined || typeof item.productId === 'string')
  );
}

export function asAsn(value: unknown): Asn | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.id !== 'string' ||
    typeof item.warehouse !== 'string' ||
    typeof item.shipmentDate !== 'string' ||
    typeof item.poReference !== 'string' ||
    typeof item.carrier !== 'string' ||
    typeof item.trackingReference !== 'string' ||
    typeof item.expectedArrival !== 'string' ||
    !['draft', 'validated', 'generated', 'submitted'].includes(item.status as string) ||
    !Array.isArray(item.lineItems) ||
    !item.lineItems.every(isAsnLineItem) ||
    !Array.isArray(item.validationIssues) ||
    !item.validationIssues.every(isValidationIssue) ||
    typeof item.createdAt !== 'string' ||
    typeof item.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    warehouse: item.warehouse,
    shipmentDate: item.shipmentDate,
    poReference: item.poReference,
    carrier: item.carrier,
    trackingReference: item.trackingReference,
    expectedArrival: item.expectedArrival,
    status: item.status as AsnStatus,
    lineItems: item.lineItems,
    validationIssues: item.validationIssues,
    generatedFileName: typeof item.generatedFileName === 'string' ? item.generatedFileName : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function isClaimEvidence(value: unknown): value is ClaimEvidence {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.label === 'string' &&
    typeof item.url === 'string'
  );
}

function isClaimRefund(value: unknown): value is ClaimRefund {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.customerRefund === 'number' &&
    typeof item.shippingRefund === 'number' &&
    (item.shopifyRefundStatus === 'pending' || item.shopifyRefundStatus === 'completed') &&
    (item.claimRefundStatus === 'pending' || item.claimRefundStatus === 'completed') &&
    typeof item.customerNotified === 'boolean'
  );
}

export function asDamageClaim(value: unknown): DamageClaim | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.id !== 'string' ||
    typeof item.displayId !== 'string' ||
    typeof item.orderNumber !== 'string' ||
    typeof item.customerName !== 'string' ||
    typeof item.productId !== 'string' ||
    typeof item.productName !== 'string' ||
    typeof item.quantity !== 'number' ||
    !['damaged', 'missing', 'wrong_item'].includes(item.issueType as string) ||
    !['new', 'investigating', 'waiting_3pl', 'approved', 'refunded', 'closed'].includes(
      item.status as string,
    ) ||
    !['customer', 'carrier', '3pl', 'warehouse', 'unknown'].includes(
      item.responsibility as string,
    ) ||
    (item.resolution !== null &&
      !['refund', 'replacement', 'store_credit', 'reject'].includes(item.resolution as string)) ||
    !Array.isArray(item.evidence) ||
    !item.evidence.every(isClaimEvidence) ||
    !isClaimRefund(item.refund) ||
    typeof item.createdAt !== 'string' ||
    typeof item.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    displayId: item.displayId,
    orderNumber: item.orderNumber,
    customerName: item.customerName,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    issueType: item.issueType as ClaimIssueType,
    status: item.status as ClaimStatus,
    responsibility: item.responsibility as ClaimResponsibility,
    resolution: item.resolution as ClaimResolution,
    evidence: item.evidence,
    refund: item.refund,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const DEMO_WAREHOUSES = [
  'Dallas, TX — Fulfillment Center',
  'Reno, NV — West Coast DC',
  'Allentown, PA — East Coast Hub',
] as const;

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  new: 'New',
  investigating: 'Investigating',
  waiting_3pl: 'Waiting 3PL',
  approved: 'Approved',
  refunded: 'Refunded',
  closed: 'Closed',
};

export const ASN_STATUS_LABELS: Record<AsnStatus, string> = {
  draft: 'Draft',
  validated: 'Validated',
  generated: 'Generated',
  submitted: 'Submitted',
};
