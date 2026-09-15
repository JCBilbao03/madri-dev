import * as XLSX from 'xlsx';

import { captureLead } from '@/lib/leads';
import type { InventoryItem } from '@/types/inventory';
import { formatDimensions } from '@/types/inventory';

export type InventoryExportFormat = 'csv' | 'xlsx';

export function filterInventoryItems(items: InventoryItem[], query: string): InventoryItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.sku.toLowerCase().includes(normalized) ||
      item.barcodeValue.toLowerCase().includes(normalized),
  );
}

const EXPORT_HEADERS = [
  'ID',
  'Name',
  'SKU',
  'Stock',
  'Weight (kg)',
  'Product Length (cm)',
  'Product Width (cm)',
  'Product Height (cm)',
  'Carton Weight (kg)',
  'Carton Length (cm)',
  'Carton Width (cm)',
  'Carton Height (cm)',
  'Barcode Value',
  'Photo URL',
  'Created',
  'Updated',
] as const;

function itemToExportRow(item: InventoryItem): (string | number)[] {
  return [
    item.id,
    item.name,
    item.sku,
    item.stock,
    item.weightKg,
    item.dimensions.lengthCm,
    item.dimensions.widthCm,
    item.dimensions.heightCm,
    item.cartonWeightKg,
    item.cartonDimensions.lengthCm,
    item.cartonDimensions.widthCm,
    item.cartonDimensions.heightCm,
    item.barcodeValue,
    item.photoUrl,
    item.createdAt,
    item.updatedAt,
  ];
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function recordExportLead(items: InventoryItem[], format: InventoryExportFormat): void {
  captureLead({
    appId: 'inventory',
    source: 'inventory-export',
    name: 'Inventory user',
    email: 'inventory@madribuild.local',
    summary: `Exported ${items.length} inventory item${items.length === 1 ? '' : 's'} as ${format.toUpperCase()}`,
    metadata: {
      itemCount: String(items.length),
      skus: items
        .map((item) => item.sku)
        .join(', ')
        .slice(0, 200),
    },
  });
}

export function exportInventory(items: InventoryItem[], format: InventoryExportFormat): void {
  if (items.length === 0) {
    return;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const rows = items.map(itemToExportRow);

  if (format === 'csv') {
    const csv = [EXPORT_HEADERS.join(','), ...rows.map((row) => row.map(escapeCsvCell).join(','))].join('\r\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `inventory-export-${stamp}.csv`);
  } else {
    const worksheet = XLSX.utils.aoa_to_sheet([[...EXPORT_HEADERS], ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, `inventory-export-${stamp}.xlsx`);
  }

  recordExportLead(items, format);
}

/** @deprecated Use exportInventory(items, 'csv') */
export function exportInventoryToCsv(items: InventoryItem[]): void {
  exportInventory(items, 'csv');
}

export function inventorySummary(item: InventoryItem): string {
  return `${item.name} (${item.sku}) — ${item.stock} in stock, ${formatDimensions(item.dimensions)}, ${item.weightKg} kg`;
}

export function buildLabelSheetUrl(itemIds: string[]): string {
  const params = new URLSearchParams({ ids: itemIds.join(',') });
  return `/inventory-app/labels?${params.toString()}`;
}
