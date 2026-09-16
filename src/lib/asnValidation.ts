import type { InventoryItem } from '@/types/inventory';
import type { Asn, AsnLineItem, ValidationIssue } from '@/types/operations';

export function validateAsnLineItems(
  lineItems: AsnLineItem[],
  products: InventoryItem[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const skuCounts = new Map<string, number>();

  for (const line of lineItems) {
    const product = products.find((entry) => entry.id === line.productId);

    if (!line.sku.trim()) {
      issues.push({
        severity: 'error',
        code: 'MISSING_SKU',
        message: `${line.productName || 'Line item'} is missing a SKU.`,
        productId: line.productId,
      });
    }

    if (!line.barcode.trim()) {
      issues.push({
        severity: 'error',
        code: 'MISSING_BARCODE',
        message: `${line.productName || line.sku} has no barcode — fix in Product Manager.`,
        productId: line.productId,
      });
    }

    if (line.quantity <= 0) {
      issues.push({
        severity: 'error',
        code: 'ZERO_QUANTITY',
        message: `${line.productName || line.sku} quantity must be greater than zero.`,
        productId: line.productId,
      });
    }

    const normalizedSku = line.sku.trim().toLowerCase();
    if (normalizedSku) {
      skuCounts.set(normalizedSku, (skuCounts.get(normalizedSku) ?? 0) + 1);
    }

    if (product && product.barcodeStatus !== 'verified') {
      issues.push({
        severity: 'warning',
        code: 'UNVERIFIED_BARCODE',
        message: `${product.name} barcode is not verified.`,
        productId: product.id,
      });
    }
  }

  for (const [sku, count] of skuCounts) {
    if (count > 1) {
      issues.push({
        severity: 'warning',
        code: 'DUPLICATE_SKU',
        message: `SKU "${sku.toUpperCase()}" appears ${count} times in this ASN.`,
      });
    }
  }

  return issues;
}

export function hasBlockingIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}

export function isAsnIncomplete(asn: Asn): boolean {
  if (asn.status === 'draft') {
    return (
      !asn.warehouse.trim() ||
      !asn.poReference.trim() ||
      asn.lineItems.length === 0 ||
      hasBlockingIssues(asn.validationIssues)
    );
  }

  if (asn.status === 'validated') {
    return hasBlockingIssues(asn.validationIssues);
  }

  return false;
}

export function deriveAsnStatusAfterValidation(issues: ValidationIssue[]): 'validated' | 'draft' {
  if (issues.length === 0 || !hasBlockingIssues(issues)) {
    return 'validated';
  }
  return 'draft';
}
