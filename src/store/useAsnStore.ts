import { create } from 'zustand';

import { formatFirestoreError } from '@/lib/firestoreErrors';
import { exportAsnToXlsx } from '@/lib/asnExport';
import {
  createAsn,
  deleteAsn,
  fetchAsn,
  fetchAsns,
  patchAsn,
  updateAsn,
} from '@/lib/asnData';
import { deriveAsnStatusAfterValidation, validateAsnLineItems } from '@/lib/asnValidation';
import { simulateAsnSubmitDelay } from '@/lib/simulatedAction';
import type { InventoryItem } from '@/types/inventory';
import type { Asn, AsnInput } from '@/types/operations';

interface AsnState {
  asns: Asn[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  hydrate: () => Promise<void>;
  addAsn: (input: AsnInput) => Promise<Asn>;
  saveAsn: (asnId: string, input: AsnInput) => Promise<Asn | null>;
  removeAsn: (asnId: string) => Promise<void>;
  validateAsn: (asnId: string, products: InventoryItem[]) => Promise<Asn | null>;
  generateAsn: (asnId: string, products: InventoryItem[]) => Promise<Asn | null>;
  submitAsn: (asnId: string) => Promise<Asn | null>;
  getAsnById: (asnId: string) => Asn | undefined;
  fetchAsnById: (asnId: string) => Promise<Asn | null>;
}

export const useAsnStore = create<AsnState>()((set, get) => ({
  asns: [],
  isLoading: false,
  isSaving: false,
  error: '',

  hydrate: async () => {
    set({ isLoading: true, error: '' });
    try {
      const asns = await fetchAsns();
      set({ asns, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: formatFirestoreError(error) });
    }
  },

  addAsn: async (input) => {
    set({ isSaving: true, error: '' });
    try {
      const asn = await createAsn(input);
      set((state) => ({
        asns: [asn, ...state.asns.filter((entry) => entry.id !== asn.id)],
        isSaving: false,
      }));
      return asn;
    } catch (error) {
      set({ isSaving: false, error: formatFirestoreError(error) });
      throw error;
    }
  },

  saveAsn: async (asnId, input) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().asns.find((entry) => entry.id === asnId);
      const asn = await updateAsn(asnId, input, existing);
      set((state) => ({
        asns: state.asns.map((entry) => (entry.id === asnId ? asn : entry)),
        isSaving: false,
      }));
      return asn;
    } catch (error) {
      set({ isSaving: false, error: formatFirestoreError(error) });
      return null;
    }
  },

  removeAsn: async (asnId) => {
    set({ isSaving: true, error: '' });
    try {
      await deleteAsn(asnId);
      set((state) => ({
        asns: state.asns.filter((entry) => entry.id !== asnId),
        isSaving: false,
      }));
    } catch (error) {
      set({ isSaving: false, error: formatFirestoreError(error) });
    }
  },

  validateAsn: async (asnId, products) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().asns.find((entry) => entry.id === asnId);
      if (!existing) {
        throw new Error('ASN not found.');
      }

      const validationIssues = validateAsnLineItems(existing.lineItems, products);
      const status = deriveAsnStatusAfterValidation(validationIssues);
      const asn = await patchAsn(asnId, { validationIssues, status }, existing);

      set((state) => ({
        asns: state.asns.map((entry) => (entry.id === asnId ? asn : entry)),
        isSaving: false,
      }));
      return asn;
    } catch (error) {
      set({ isSaving: false, error: formatFirestoreError(error) });
      return null;
    }
  },

  generateAsn: async (asnId, products) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().asns.find((entry) => entry.id === asnId);
      if (!existing) {
        throw new Error('ASN not found.');
      }

      const validationIssues = validateAsnLineItems(existing.lineItems, products);
      if (validationIssues.some((issue) => issue.severity === 'error')) {
        const draft = await patchAsn(
          asnId,
          { validationIssues, status: 'draft' },
          existing,
        );
        set((state) => ({
          asns: state.asns.map((entry) => (entry.id === asnId ? draft : entry)),
          isSaving: false,
          error: 'Fix validation errors before generating the ASN file.',
        }));
        return draft;
      }

      const generatedFileName = exportAsnToXlsx(existing);
      const asn = await patchAsn(
        asnId,
        { validationIssues, status: 'generated', generatedFileName },
        existing,
      );

      set((state) => ({
        asns: state.asns.map((entry) => (entry.id === asnId ? asn : entry)),
        isSaving: false,
      }));
      return asn;
    } catch (error) {
      set({ isSaving: false, error: formatFirestoreError(error) });
      return null;
    }
  },

  submitAsn: async (asnId) => {
    set({ isSaving: true, error: '' });
    try {
      await simulateAsnSubmitDelay();
      const existing = get().asns.find((entry) => entry.id === asnId);
      if (!existing) {
        throw new Error('ASN not found.');
      }

      const asn = await patchAsn(asnId, { status: 'submitted' }, existing);
      set((state) => ({
        asns: state.asns.map((entry) => (entry.id === asnId ? asn : entry)),
        isSaving: false,
      }));
      return asn;
    } catch (error) {
      set({ isSaving: false, error: formatFirestoreError(error) });
      return null;
    }
  },

  getAsnById: (asnId) => get().asns.find((entry) => entry.id === asnId),

  fetchAsnById: async (asnId) => {
    const cached = get().getAsnById(asnId);
    if (cached) {
      return cached;
    }

    try {
      const asn = await fetchAsn(asnId);
      if (asn) {
        set((state) => ({
          asns: [asn, ...state.asns.filter((entry) => entry.id !== asn.id)],
        }));
      }
      return asn;
    } catch {
      return null;
    }
  },
}));
