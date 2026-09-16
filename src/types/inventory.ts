export interface Dimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export type BarcodeStatus = 'ready' | 'missing' | 'verified';

export type ShopifySyncStatus = 'synced' | 'pending' | 'error' | 'not_linked';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  weightKg: number;
  dimensions: Dimensions;
  cartonWeightKg: number;
  cartonDimensions: Dimensions;
  photoUrl: string;
  barcode: string;
  barcodeStatus: BarcodeStatus;
  shopifySyncStatus: ShopifySyncStatus;
  shopifyVariantId?: string;
  barcodeValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemInput {
  name: string;
  sku: string;
  stock: number;
  weightKg: number;
  dimensions: Dimensions;
  cartonWeightKg: number;
  cartonDimensions: Dimensions;
  photoUrl: string;
  barcode?: string;
  barcodeStatus?: BarcodeStatus;
  shopifySyncStatus?: ShopifySyncStatus;
  shopifyVariantId?: string;
}

export const EMPTY_DIMENSIONS: Dimensions = {
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
};

export const EMPTY_INVENTORY_INPUT: InventoryItemInput = {
  name: '',
  sku: '',
  stock: 0,
  weightKg: 0,
  dimensions: { ...EMPTY_DIMENSIONS },
  cartonWeightKg: 0,
  cartonDimensions: { ...EMPTY_DIMENSIONS },
  photoUrl: '',
};

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

function deriveBarcodeStatus(barcode: string, explicit?: unknown): BarcodeStatus {
  if (explicit === 'ready' || explicit === 'missing' || explicit === 'verified') {
    return explicit;
  }
  return barcode.trim() ? 'ready' : 'missing';
}

function deriveShopifySyncStatus(value: unknown): ShopifySyncStatus {
  if (value === 'synced' || value === 'pending' || value === 'error' || value === 'not_linked') {
    return value;
  }
  return 'not_linked';
}

export function deriveBarcodeValue(barcode: string, sku: string): string {
  const trimmed = barcode.trim();
  if (trimmed) {
    return trimmed;
  }
  return sku.trim().toUpperCase();
}

export function asInventoryItem(value: unknown): InventoryItem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.id !== 'string' ||
    typeof item.name !== 'string' ||
    typeof item.sku !== 'string' ||
    typeof item.stock !== 'number' ||
    typeof item.weightKg !== 'number' ||
    !isDimensions(item.dimensions) ||
    typeof item.cartonWeightKg !== 'number' ||
    !isDimensions(item.cartonDimensions) ||
    (typeof item.photoUrl !== 'string' && typeof (item as Record<string, unknown>).photoDataUrl !== 'string') ||
    typeof item.barcodeValue !== 'string' ||
    typeof item.createdAt !== 'string' ||
    typeof item.updatedAt !== 'string'
  ) {
    return null;
  }

  const barcode =
    typeof item.barcode === 'string'
      ? item.barcode
      : item.barcodeValue !== item.sku.trim().toUpperCase()
        ? item.barcodeValue
        : '';

  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    stock: item.stock,
    weightKg: item.weightKg,
    dimensions: item.dimensions,
    cartonWeightKg: item.cartonWeightKg,
    cartonDimensions: item.cartonDimensions,
    photoUrl:
      typeof item.photoUrl === 'string'
        ? item.photoUrl
        : typeof (item as Record<string, unknown>).photoDataUrl === 'string'
          ? ((item as Record<string, unknown>).photoDataUrl as string)
          : '',
    barcode,
    barcodeStatus: deriveBarcodeStatus(barcode, item.barcodeStatus),
    shopifySyncStatus: deriveShopifySyncStatus(item.shopifySyncStatus),
    shopifyVariantId: typeof item.shopifyVariantId === 'string' ? item.shopifyVariantId : undefined,
    barcodeValue: item.barcodeValue,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function formatDimensions(dimensions: Dimensions): string {
  const { lengthCm, widthCm, heightCm } = dimensions;
  if (lengthCm === 0 && widthCm === 0 && heightCm === 0) {
    return '—';
  }
  return `${lengthCm} × ${widthCm} × ${heightCm} cm`;
}
