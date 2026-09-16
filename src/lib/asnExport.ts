import * as XLSX from 'xlsx';

import type { Asn } from '@/types/operations';
import { formatDimensions } from '@/types/inventory';

const ASN_HEADERS = [
  'SKU',
  'Barcode',
  'Description',
  'Qty',
  'Carton Weight (kg)',
  'Carton L×W×H (cm)',
  'PO Reference',
  'Expected Arrival',
] as const;

function lineToRow(asn: Asn, line: Asn['lineItems'][number]): (string | number)[] {
  return [
    line.sku,
    line.barcode,
    line.productName,
    line.quantity,
    line.cartonWeightKg,
    formatDimensions(line.cartonDimensions),
    asn.poReference,
    asn.expectedArrival,
  ];
}

export function buildAsnFileName(asn: Asn): string {
  const po = asn.poReference.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 24) || 'asn';
  const stamp = new Date().toISOString().slice(0, 10);
  return `3PL-ASN-${po}-${stamp}.xlsx`;
}

export function exportAsnToXlsx(asn: Asn): string {
  const rows = asn.lineItems.map((line) => lineToRow(asn, line));
  const worksheet = XLSX.utils.aoa_to_sheet([[...ASN_HEADERS], ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ASN');
  const fileName = buildAsnFileName(asn);
  XLSX.writeFile(workbook, fileName);
  return fileName;
}
