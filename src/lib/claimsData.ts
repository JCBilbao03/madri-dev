import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import {
  asDamageClaim,
  type ClaimRefund,
  type ClaimResponsibility,
  type ClaimResolution,
  type ClaimStatus,
  type DamageClaim,
  type DamageClaimInput,
} from '@/types/operations';

let displayCounter = 1000;

function nextDisplayId(): string {
  displayCounter += 1;
  return `DL-${displayCounter}`;
}

function defaultRefund(): ClaimRefund {
  return {
    customerRefund: 0,
    shippingRefund: 0,
    shopifyRefundStatus: 'pending',
    claimRefundStatus: 'pending',
    customerNotified: false,
  };
}

function buildClaimDocument(
  id: string,
  input: DamageClaimInput,
  existing?: DamageClaim,
  overrides?: Partial<DamageClaim>,
): DamageClaim {
  const now = new Date().toISOString();

  return {
    id,
    displayId: existing?.displayId ?? nextDisplayId(),
    orderNumber: input.orderNumber.trim(),
    customerName: input.customerName.trim(),
    productId: input.productId,
    productName: input.productName.trim(),
    quantity: Math.max(1, input.quantity),
    issueType: input.issueType,
    status: existing?.status ?? 'new',
    responsibility: existing?.responsibility ?? 'unknown',
    resolution: existing?.resolution ?? null,
    evidence: input.evidence ?? existing?.evidence ?? [],
    refund: existing?.refund ?? defaultRefund(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...overrides,
  };
}

export function parseClaimDoc(id: string, data: Record<string, unknown>): DamageClaim | null {
  const normalized = {
    ...data,
    id: typeof data.id === 'string' ? data.id : id,
  };
  return asDamageClaim(normalized);
}

export async function fetchClaims(): Promise<DamageClaim[]> {
  const snapshot = await getDocs(collection(db, 'damageClaims'));
  return snapshot.docs
    .map((entry) => parseClaimDoc(entry.id, entry.data()))
    .filter((claim): claim is DamageClaim => claim !== null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function fetchClaim(claimId: string): Promise<DamageClaim | null> {
  const snapshot = await getDoc(doc(db, 'damageClaims', claimId));
  if (!snapshot.exists()) {
    return null;
  }
  return parseClaimDoc(snapshot.id, snapshot.data());
}

export async function createClaim(input: DamageClaimInput): Promise<DamageClaim> {
  const id = `claim-${crypto.randomUUID().slice(0, 8)}`;
  const claim = buildClaimDocument(id, input);
  await setDoc(doc(db, 'damageClaims', id), claim);
  return claim;
}

export async function updateClaim(
  claimId: string,
  input: DamageClaimInput,
  existing?: DamageClaim,
): Promise<DamageClaim> {
  const current = existing ?? (await fetchClaim(claimId));
  if (!current) {
    throw new Error('Claim not found.');
  }

  const claim = buildClaimDocument(claimId, input, current);
  await setDoc(doc(db, 'damageClaims', claimId), claim);
  return claim;
}

export async function patchClaim(
  claimId: string,
  patch: Partial<
    Pick<
      DamageClaim,
      'status' | 'responsibility' | 'resolution' | 'evidence' | 'refund' | 'displayId'
    >
  >,
  existing?: DamageClaim,
): Promise<DamageClaim> {
  const current = existing ?? (await fetchClaim(claimId));
  if (!current) {
    throw new Error('Claim not found.');
  }

  const claim: DamageClaim = {
    ...current,
    ...patch,
    refund: patch.refund ? { ...current.refund, ...patch.refund } : current.refund,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'damageClaims', claimId), claim);
  return claim;
}

export async function deleteClaim(claimId: string): Promise<void> {
  await deleteDoc(doc(db, 'damageClaims', claimId));
}

export function canTransitionClaimStatus(from: ClaimStatus, to: ClaimStatus): boolean {
  const order: ClaimStatus[] = ['new', 'investigating', 'waiting_3pl', 'approved', 'refunded', 'closed'];
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }

  if (to === 'closed') {
    return from === 'refunded' || from === 'approved';
  }

  if (to === 'refunded' && from !== 'approved') {
    return false;
  }

  return toIndex >= fromIndex && toIndex <= fromIndex + 1;
}

export function isValidClaimResolution(resolution: ClaimResolution): boolean {
  return resolution === null || ['refund', 'replacement', 'store_credit', 'reject'].includes(resolution);
}

export function isValidClaimResponsibility(responsibility: ClaimResponsibility): boolean {
  return ['customer', 'carrier', '3pl', 'warehouse', 'unknown'].includes(responsibility);
}
