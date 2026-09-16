import { create } from 'zustand';

import {
  canTransitionClaimStatus,
  createClaim,
  deleteClaim,
  fetchClaim,
  fetchClaims,
  patchClaim,
  updateClaim,
} from '@/lib/claimsData';
import { build3plRequestSummary, simulate3plRequestDelay } from '@/lib/simulatedAction';
import type {
  ClaimRefund,
  ClaimResponsibility,
  ClaimResolution,
  ClaimStatus,
  DamageClaim,
  DamageClaimInput,
} from '@/types/operations';

function formatClaimError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  if (/permission|insufficient/i.test(message)) {
    return 'Could not reach Firestore. Deploy the latest Firebase rules and refresh.';
  }
  return message;
}

interface ClaimsState {
  claims: DamageClaim[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  last3plSummary: string;
  hydrate: () => Promise<void>;
  addClaim: (input: DamageClaimInput) => Promise<DamageClaim>;
  saveClaim: (claimId: string, input: DamageClaimInput) => Promise<DamageClaim | null>;
  removeClaim: (claimId: string) => Promise<void>;
  setStatus: (claimId: string, status: ClaimStatus) => Promise<DamageClaim | null>;
  setResponsibility: (claimId: string, responsibility: ClaimResponsibility) => Promise<DamageClaim | null>;
  setResolution: (claimId: string, resolution: ClaimResolution) => Promise<DamageClaim | null>;
  updateRefund: (claimId: string, refund: Partial<ClaimRefund>) => Promise<DamageClaim | null>;
  request3plInvestigation: (claimId: string) => Promise<DamageClaim | null>;
  getClaimById: (claimId: string) => DamageClaim | undefined;
  fetchClaimById: (claimId: string) => Promise<DamageClaim | null>;
}

export const useClaimsStore = create<ClaimsState>()((set, get) => ({
  claims: [],
  isLoading: false,
  isSaving: false,
  error: '',
  last3plSummary: '',

  hydrate: async () => {
    set({ isLoading: true, error: '' });
    try {
      const claims = await fetchClaims();
      set({ claims, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: formatClaimError(error) });
    }
  },

  addClaim: async (input) => {
    set({ isSaving: true, error: '' });
    try {
      const claim = await createClaim(input);
      set((state) => ({
        claims: [claim, ...state.claims.filter((entry) => entry.id !== claim.id)],
        isSaving: false,
      }));
      return claim;
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
      throw error;
    }
  },

  saveClaim: async (claimId, input) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().claims.find((entry) => entry.id === claimId);
      const claim = await updateClaim(claimId, input, existing);
      set((state) => ({
        claims: state.claims.map((entry) => (entry.id === claimId ? claim : entry)),
        isSaving: false,
      }));
      return claim;
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
      return null;
    }
  },

  removeClaim: async (claimId) => {
    set({ isSaving: true, error: '' });
    try {
      await deleteClaim(claimId);
      set((state) => ({
        claims: state.claims.filter((entry) => entry.id !== claimId),
        isSaving: false,
      }));
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
    }
  },

  setStatus: async (claimId, status) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().claims.find((entry) => entry.id === claimId);
      if (!existing) {
        throw new Error('Claim not found.');
      }

      if (!canTransitionClaimStatus(existing.status, status)) {
        throw new Error(`Cannot move claim from ${existing.status} to ${status}.`);
      }

      const claim = await patchClaim(claimId, { status }, existing);
      set((state) => ({
        claims: state.claims.map((entry) => (entry.id === claimId ? claim : entry)),
        isSaving: false,
      }));
      return claim;
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
      return null;
    }
  },

  setResponsibility: async (claimId, responsibility) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().claims.find((entry) => entry.id === claimId);
      if (!existing) {
        throw new Error('Claim not found.');
      }

      const claim = await patchClaim(claimId, { responsibility }, existing);
      set((state) => ({
        claims: state.claims.map((entry) => (entry.id === claimId ? claim : entry)),
        isSaving: false,
      }));
      return claim;
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
      return null;
    }
  },

  setResolution: async (claimId, resolution) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().claims.find((entry) => entry.id === claimId);
      if (!existing) {
        throw new Error('Claim not found.');
      }

      const claim = await patchClaim(claimId, { resolution }, existing);
      set((state) => ({
        claims: state.claims.map((entry) => (entry.id === claimId ? claim : entry)),
        isSaving: false,
      }));
      return claim;
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
      return null;
    }
  },

  updateRefund: async (claimId, refund) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().claims.find((entry) => entry.id === claimId);
      if (!existing) {
        throw new Error('Claim not found.');
      }

      const claim = await patchClaim(claimId, { refund: { ...existing.refund, ...refund } }, existing);
      set((state) => ({
        claims: state.claims.map((entry) => (entry.id === claimId ? claim : entry)),
        isSaving: false,
      }));
      return claim;
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
      return null;
    }
  },

  request3plInvestigation: async (claimId) => {
    set({ isSaving: true, error: '' });
    try {
      const existing = get().claims.find((entry) => entry.id === claimId);
      if (!existing) {
        throw new Error('Claim not found.');
      }

      await simulate3plRequestDelay();
      const summary = build3plRequestSummary({
        displayId: existing.displayId,
        orderNumber: existing.orderNumber,
        customerName: existing.customerName,
        productName: existing.productName,
        quantity: existing.quantity,
        issueType: existing.issueType,
      });

      const claim = await patchClaim(
        claimId,
        {
          status: existing.status === 'new' ? 'waiting_3pl' : 'waiting_3pl',
          responsibility: existing.responsibility === 'unknown' ? '3pl' : existing.responsibility,
        },
        existing,
      );

      set((state) => ({
        claims: state.claims.map((entry) => (entry.id === claimId ? claim : entry)),
        isSaving: false,
        last3plSummary: summary,
      }));
      return claim;
    } catch (error) {
      set({ isSaving: false, error: formatClaimError(error) });
      return null;
    }
  },

  getClaimById: (claimId) => get().claims.find((entry) => entry.id === claimId),

  fetchClaimById: async (claimId) => {
    const cached = get().getClaimById(claimId);
    if (cached) {
      return cached;
    }

    try {
      const claim = await fetchClaim(claimId);
      if (claim) {
        set((state) => ({
          claims: [claim, ...state.claims.filter((entry) => entry.id !== claim.id)],
        }));
      }
      return claim;
    } catch {
      return null;
    }
  },
}));
