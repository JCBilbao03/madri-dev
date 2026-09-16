import { create } from 'zustand';

import { formatFirestoreError } from '@/lib/firestoreErrors';
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchInventoryItems,
  migrateLegacyInventoryItem,
  patchInventoryItem,
  updateInventoryItem,
} from '@/lib/inventoryData';
import { generateDemoEan, simulateShopifySyncDelay } from '@/lib/simulatedAction';
import { deriveBarcodeValue, asInventoryItem, type InventoryItem, type InventoryItemInput } from '@/types/inventory';

const LEGACY_STORAGE_KEY = 'madribuild-inventory-items';

function formatInventoryError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  if (/storage|upload|bucket/i.test(message)) {
    return 'Could not upload the product photo to Firebase Storage. Check that Storage is enabled and rules are deployed.';
  }
  return formatFirestoreError(error, 'Catalog');
}

interface LegacyPersistedState {
  state?: {
    items?: unknown[];
  };
}

function readLegacyItems(): InventoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as LegacyPersistedState;
    const items = parsed.state?.items;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map(asInventoryItem).filter((item): item is InventoryItem => item !== null);
  } catch {
    return [];
  }
}

function clearLegacyStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Best-effort cleanup.
  }
}

interface InventoryState {
  items: InventoryItem[];
  selectedIds: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  hydrate: () => Promise<void>;
  addItem: (input: InventoryItemInput, photoFile?: File | null) => Promise<InventoryItem>;
  updateItem: (id: string, input: InventoryItemInput, photoFile?: File | null) => Promise<InventoryItem | null>;
  deleteItem: (id: string) => Promise<void>;
  generateBarcode: (id: string) => Promise<InventoryItem | null>;
  markVerified: (id: string) => Promise<InventoryItem | null>;
  simulateShopifySync: (id: string) => Promise<InventoryItem | null>;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  getItemById: (id: string) => InventoryItem | undefined;
}

/**
 * Inventory catalog state synced with Firestore.
 * Always read with atomic selectors: `useInventoryStore((state) => state.items)`.
 */
export const useInventoryStore = create<InventoryState>()((set, get) => ({
  items: [],
  selectedIds: [],
  isLoading: false,
  isSaving: false,
  error: '',

  hydrate: async () => {
    set({ isLoading: true, error: '' });

    try {
      let items = await fetchInventoryItems();

      if (items.length === 0) {
        const legacyItems = readLegacyItems();
        if (legacyItems.length > 0) {
          const migrated = await Promise.all(legacyItems.map((legacy) => migrateLegacyInventoryItem(legacy)));
          items = migrated;
          clearLegacyStorage();
        }
      }

      set({ items, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: formatInventoryError(error),
      });
    }
  },

  addItem: async (input, photoFile) => {
    set({ isSaving: true, error: '' });

    try {
      const item = await createInventoryItem(input, photoFile);
      set((state) => ({
        items: [item, ...state.items.filter((entry) => entry.id !== item.id)],
        isSaving: false,
      }));
      return item;
    } catch (error) {
      set({
        isSaving: false,
        error: formatInventoryError(error),
      });
      throw error;
    }
  },

  updateItem: async (id, input, photoFile) => {
    set({ isSaving: true, error: '' });

    try {
      const existing = get().items.find((entry) => entry.id === id);
      const item = await updateInventoryItem(id, input, photoFile, existing);
      set((state) => ({
        items: state.items.map((entry) => (entry.id === id ? item : entry)),
        isSaving: false,
      }));
      return item;
    } catch (error) {
      set({
        isSaving: false,
        error: formatInventoryError(error),
      });
      return null;
    }
  },

  deleteItem: async (id) => {
    set({ isSaving: true, error: '' });

    try {
      await deleteInventoryItem(id);
      set((state) => ({
        items: state.items.filter((entry) => entry.id !== id),
        selectedIds: state.selectedIds.filter((entry) => entry !== id),
        isSaving: false,
      }));
    } catch (error) {
      set({
        isSaving: false,
        error: formatInventoryError(error),
      });
    }
  },

  generateBarcode: async (id) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().items.find((entry) => entry.id === id);
      if (!existing) {
        throw new Error('Product not found.');
      }

      const barcode = generateDemoEan();
      const item = await patchInventoryItem(
        id,
        {
          barcode,
          barcodeStatus: 'ready',
          barcodeValue: deriveBarcodeValue(barcode, existing.sku),
        },
        existing,
      );

      set((state) => ({
        items: state.items.map((entry) => (entry.id === id ? item : entry)),
        isSaving: false,
      }));
      return item;
    } catch (error) {
      set({ isSaving: false, error: formatInventoryError(error) });
      return null;
    }
  },

  markVerified: async (id) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().items.find((entry) => entry.id === id);
      if (!existing) {
        throw new Error('Product not found.');
      }

      if (!existing.barcode.trim()) {
        throw new Error('Assign a barcode before marking as verified.');
      }

      const item = await patchInventoryItem(id, { barcodeStatus: 'verified' }, existing);
      set((state) => ({
        items: state.items.map((entry) => (entry.id === id ? item : entry)),
        isSaving: false,
      }));
      return item;
    } catch (error) {
      set({ isSaving: false, error: formatInventoryError(error) });
      return null;
    }
  },

  simulateShopifySync: async (id) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().items.find((entry) => entry.id === id);
      if (!existing) {
        throw new Error('Product not found.');
      }

      let item = await patchInventoryItem(
        id,
        {
          shopifySyncStatus: 'pending',
          shopifyVariantId: existing.shopifyVariantId ?? `gid://shopify/ProductVariant/${Math.floor(Math.random() * 900000 + 100000)}`,
        },
        existing,
      );

      set((state) => ({
        items: state.items.map((entry) => (entry.id === id ? item : entry)),
      }));

      await simulateShopifySyncDelay();

      item = await patchInventoryItem(id, { shopifySyncStatus: 'synced' }, item);
      set((state) => ({
        items: state.items.map((entry) => (entry.id === id ? item : entry)),
        isSaving: false,
      }));
      return item;
    } catch (error) {
      set({ isSaving: false, error: formatInventoryError(error) });
      return null;
    }
  },

  toggleSelected: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((entry) => entry !== id)
        : [...state.selectedIds, id],
    }));
  },

  selectAll: (ids) => {
    set({ selectedIds: ids });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  getItemById: (id) => get().items.find((entry) => entry.id === id),
}));
