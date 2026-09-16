import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { db, waitForFirestore } from '@/lib/firebase';
import { asAsn, type Asn, type AsnInput, type AsnStatus, type ValidationIssue } from '@/types/operations';

function buildAsnDocument(
  id: string,
  input: AsnInput,
  status: AsnStatus,
  validationIssues: ValidationIssue[],
  existing?: Asn,
  generatedFileName?: string,
): Asn {
  const now = new Date().toISOString();

  return {
    id,
    warehouse: input.warehouse.trim(),
    shipmentDate: input.shipmentDate,
    poReference: input.poReference.trim(),
    carrier: input.carrier.trim(),
    trackingReference: input.trackingReference.trim(),
    expectedArrival: input.expectedArrival,
    status,
    lineItems: input.lineItems.map((line) => ({ ...line })),
    validationIssues,
    generatedFileName: generatedFileName ?? existing?.generatedFileName,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function parseAsnDoc(id: string, data: Record<string, unknown>): Asn | null {
  const normalized = {
    ...data,
    id: typeof data.id === 'string' ? data.id : id,
  };
  return asAsn(normalized);
}

export async function fetchAsns(): Promise<Asn[]> {
  await waitForFirestore();
  const snapshot = await getDocs(collection(db, 'asns'));
  return snapshot.docs
    .map((entry) => parseAsnDoc(entry.id, entry.data()))
    .filter((asn): asn is Asn => asn !== null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function fetchAsn(asnId: string): Promise<Asn | null> {
  await waitForFirestore();
  const snapshot = await getDoc(doc(db, 'asns', asnId));
  if (!snapshot.exists()) {
    return null;
  }
  return parseAsnDoc(snapshot.id, snapshot.data());
}

export async function createAsn(input: AsnInput): Promise<Asn> {
  await waitForFirestore();
  const id = `asn-${crypto.randomUUID().slice(0, 8)}`;
  const asn = buildAsnDocument(id, input, 'draft', []);
  await setDoc(doc(db, 'asns', id), asn);
  return asn;
}

export async function updateAsn(
  asnId: string,
  input: AsnInput,
  existing?: Asn,
): Promise<Asn> {
  await waitForFirestore();
  const current = existing ?? (await fetchAsn(asnId));
  if (!current) {
    throw new Error('ASN not found.');
  }

  const asn = buildAsnDocument(
    asnId,
    input,
    current.status === 'submitted' ? 'submitted' : current.status,
    current.validationIssues,
    current,
    current.generatedFileName,
  );

  await setDoc(doc(db, 'asns', asnId), asn);
  return asn;
}

export async function patchAsn(
  asnId: string,
  patch: Partial<Pick<Asn, 'status' | 'validationIssues' | 'generatedFileName' | 'lineItems'>>,
  existing?: Asn,
): Promise<Asn> {
  await waitForFirestore();
  const current = existing ?? (await fetchAsn(asnId));
  if (!current) {
    throw new Error('ASN not found.');
  }

  const asn: Asn = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'asns', asnId), asn);
  return asn;
}

export async function deleteAsn(asnId: string): Promise<void> {
  await waitForFirestore();
  await deleteDoc(doc(db, 'asns', asnId));
}
