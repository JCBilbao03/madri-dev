import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';

import { db, storage, waitForFirestore } from '@/lib/firebase';
import {
  asInventoryItem,
  deriveBarcodeValue,
  type BarcodeStatus,
  type InventoryItem,
  type InventoryItemInput,
  type ShopifySyncStatus,
} from '@/types/inventory';

function deriveBarcodeFields(
  sku: string,
  input: InventoryItemInput,
  existing?: InventoryItem,
): { barcode: string; barcodeStatus: BarcodeStatus; barcodeValue: string } {
  const barcode = (input.barcode ?? existing?.barcode ?? '').trim();
  const barcodeStatus =
    input.barcodeStatus ??
    (barcode ? (existing?.barcodeStatus === 'verified' ? 'verified' : 'ready') : 'missing');

  return {
    barcode,
    barcodeStatus,
    barcodeValue: deriveBarcodeValue(barcode, sku),
  };
}

function buildItemDocument(
  id: string,
  input: InventoryItemInput,
  photoUrl: string,
  existing?: InventoryItem,
): InventoryItem {
  const now = new Date().toISOString();
  const sku = input.sku.trim();
  const barcodeFields = deriveBarcodeFields(sku, input, existing);
  const shopifySyncStatus: ShopifySyncStatus =
    input.shopifySyncStatus ?? existing?.shopifySyncStatus ?? 'not_linked';

  return {
    id,
    name: input.name.trim(),
    sku,
    stock: Math.max(0, input.stock),
    weightKg: Math.max(0, input.weightKg),
    dimensions: { ...input.dimensions },
    cartonWeightKg: Math.max(0, input.cartonWeightKg),
    cartonDimensions: { ...input.cartonDimensions },
    photoUrl,
    ...barcodeFields,
    shopifySyncStatus,
    shopifyVariantId: input.shopifyVariantId ?? existing?.shopifyVariantId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function parseInventoryDoc(id: string, data: Record<string, unknown>): InventoryItem | null {
  const normalized = {
    ...data,
    id: typeof data.id === 'string' ? data.id : id,
    photoUrl:
      typeof data.photoUrl === 'string'
        ? data.photoUrl
        : typeof data.photoDataUrl === 'string'
          ? data.photoDataUrl
          : '',
  };

  return asInventoryItem(normalized);
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  await waitForFirestore();
  const snapshot = await getDocs(collection(db, 'inventoryItems'));
  return snapshot.docs
    .map((entry) => parseInventoryDoc(entry.id, entry.data()))
    .filter((item): item is InventoryItem => item !== null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function fetchInventoryItem(itemId: string): Promise<InventoryItem | null> {
  await waitForFirestore();
  const snapshot = await getDoc(doc(db, 'inventoryItems', itemId));
  if (!snapshot.exists()) {
    return null;
  }

  return parseInventoryDoc(snapshot.id, snapshot.data());
}

async function deleteInventoryPhotos(itemId: string): Promise<void> {
  const folderRef = ref(storage, `inventory/${itemId}`);

  try {
    const listing = await listAll(folderRef);
    await Promise.all(listing.items.map((itemRef) => deleteObject(itemRef)));
  } catch {
    // Folder may not exist yet — safe to ignore.
  }
}

async function uploadPhotoFile(itemId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
  const objectRef = ref(storage, `inventory/${itemId}/photo.${safeExtension}`);

  await uploadBytes(objectRef, file, { contentType: file.type || 'image/jpeg' });
  return getDownloadURL(objectRef);
}

async function uploadPhotoDataUrl(itemId: string, dataUrl: string): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
  return uploadPhotoFile(itemId, file);
}

/** Firestore rules reject data URLs — only persist Firebase Storage / HTTP links. */
function persistablePhotoUrl(url: string): string {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url.slice(0, 4096);
  }
  return '';
}

async function resolvePhotoUrl(
  itemId: string,
  input: InventoryItemInput,
  photoFile: File | null | undefined,
  existing?: InventoryItem,
): Promise<string> {
  const existingHttpUrl = persistablePhotoUrl(existing?.photoUrl ?? '');

  if (photoFile) {
    return uploadPhotoFile(itemId, photoFile);
  }

  if (input.photoUrl.startsWith('data:')) {
    return uploadPhotoDataUrl(itemId, input.photoUrl);
  }

  if (!input.photoUrl.trim() && existingHttpUrl) {
    await deleteInventoryPhotos(itemId);
    return '';
  }

  return persistablePhotoUrl(input.photoUrl) || existingHttpUrl;
}

export async function createInventoryItem(
  input: InventoryItemInput,
  photoFile?: File | null,
): Promise<InventoryItem> {
  await waitForFirestore();
  const id = `inv-${crypto.randomUUID().slice(0, 8)}`;
  const photoUrl = await resolvePhotoUrl(id, input, photoFile);
  const item = buildItemDocument(id, input, photoUrl);

  await setDoc(doc(db, 'inventoryItems', id), item);
  return item;
}

export async function updateInventoryItem(
  itemId: string,
  input: InventoryItemInput,
  photoFile?: File | null,
  existing?: InventoryItem,
): Promise<InventoryItem> {
  await waitForFirestore();
  const current = existing ?? (await fetchInventoryItem(itemId));
  if (!current) {
    throw new Error('Product not found.');
  }

  const photoUrl = await resolvePhotoUrl(itemId, input, photoFile, current);
  const item = buildItemDocument(itemId, input, photoUrl, current);

  await setDoc(doc(db, 'inventoryItems', itemId), item);
  return item;
}

export async function patchInventoryItem(
  itemId: string,
  patch: Partial<
    Pick<
      InventoryItem,
      | 'barcode'
      | 'barcodeStatus'
      | 'barcodeValue'
      | 'shopifySyncStatus'
      | 'shopifyVariantId'
    >
  >,
  existing?: InventoryItem,
): Promise<InventoryItem> {
  await waitForFirestore();
  const current = existing ?? (await fetchInventoryItem(itemId));
  if (!current) {
    throw new Error('Product not found.');
  }

  const barcode = patch.barcode ?? current.barcode;
  const item: InventoryItem = {
    ...current,
    ...patch,
    barcode,
    barcodeValue: patch.barcodeValue ?? deriveBarcodeValue(barcode, current.sku),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'inventoryItems', itemId), item);
  return item;
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  await waitForFirestore();
  await deleteInventoryPhotos(itemId);
  await deleteDoc(doc(db, 'inventoryItems', itemId));
}

/** Migrate a legacy local item into Firestore + Storage. */
export async function migrateLegacyInventoryItem(legacy: InventoryItem): Promise<InventoryItem> {
  return createInventoryItem({
    name: legacy.name,
    sku: legacy.sku,
    stock: legacy.stock,
    weightKg: legacy.weightKg,
    dimensions: legacy.dimensions,
    cartonWeightKg: legacy.cartonWeightKg,
    cartonDimensions: legacy.cartonDimensions,
    photoUrl: legacy.photoUrl,
    barcode: legacy.barcode,
    barcodeStatus: legacy.barcodeStatus,
    shopifySyncStatus: legacy.shopifySyncStatus,
    shopifyVariantId: legacy.shopifyVariantId,
  });
}
