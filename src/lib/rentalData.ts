import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { DEMO_APPLICATIONS, DEMO_PROPERTIES } from '@/data/demoListings';
import { db } from '@/lib/firebase';
import {
  applicationDocId,
  asApplicationAnswers,
  asScreeningQuestions,
  isApplicationStatus,
  LISTING_AREAS,
  type ApplicationAnswer,
  type ApplicationStatus,
  type ListingSort,
  type Property,
  type RentalApplication,
  type ScreeningQuestion,
} from '@/types/rental';

export function asProperty(id: string, data: Record<string, unknown>): Property | null {
  const price = typeof data.price === 'number' ? data.price : Number(data.price);

  if (
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    typeof data.address !== 'string' ||
    typeof data.landlordId !== 'string' ||
    typeof data.status !== 'string' ||
    !Number.isFinite(price) ||
    !Array.isArray(data.photos)
  ) {
    return null;
  }

  return {
    propertyId: typeof data.propertyId === 'string' ? data.propertyId : id,
    landlordId: data.landlordId,
    title: data.title,
    description: data.description,
    address: data.address,
    price,
    photos: data.photos.filter((photo): photo is string => typeof photo === 'string'),
    status: data.status,
    screeningQuestions: asScreeningQuestions(data.screeningQuestions),
  };
}

function asApplication(id: string, data: Record<string, unknown>): RentalApplication | null {
  if (
    typeof data.propertyId !== 'string' ||
    typeof data.tenantId !== 'string' ||
    !isApplicationStatus(data.status) ||
    typeof data.timestamp !== 'string'
  ) {
    return null;
  }

  return {
    applicationId: typeof data.applicationId === 'string' ? data.applicationId : id,
    propertyId: data.propertyId,
    tenantId: data.tenantId,
    status: data.status,
    timestamp: data.timestamp,
    answers: asApplicationAnswers(data.answers),
  };
}

export async function fetchProperties(): Promise<Property[]> {
  try {
    const snapshot = await getDocs(collection(db, 'properties'));
    const properties = snapshot.docs
      .map((item) => asProperty(item.id, item.data()))
      .filter((item): item is Property => item !== null);

    return properties.length > 0 ? properties : DEMO_PROPERTIES;
  } catch {
    return DEMO_PROPERTIES;
  }
}

export async function fetchProperty(propertyId: string): Promise<Property | null> {
  try {
    const snapshot = await getDoc(doc(db, 'properties', propertyId));
    if (snapshot.exists()) {
      return asProperty(snapshot.id, snapshot.data());
    }
  } catch {
    // Fall through to bundled demo listings.
  }

  return DEMO_PROPERTIES.find((property) => property.propertyId === propertyId) ?? null;
}

export async function fetchApplications(): Promise<RentalApplication[]> {
  try {
    const snapshot = await getDocs(collection(db, 'applications'));
    const applications = snapshot.docs
      .map((item) => asApplication(item.id, item.data()))
      .filter((item): item is RentalApplication => item !== null);

    return applications.length > 0 ? applications : DEMO_APPLICATIONS;
  } catch {
    return DEMO_APPLICATIONS;
  }
}

export async function fetchTenantApplications(tenantId: string): Promise<RentalApplication[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'applications'), where('tenantId', '==', tenantId)),
    );

    return snapshot.docs
      .map((item) => asApplication(item.id, item.data()))
      .filter((item): item is RentalApplication => item !== null);
  } catch {
    return [];
  }
}

export async function fetchApplicationForProperty(
  tenantId: string,
  propertyId: string,
): Promise<RentalApplication | null> {
  try {
    const snapshot = await getDoc(doc(db, 'applications', applicationDocId(tenantId, propertyId)));
    if (!snapshot.exists()) {
      return null;
    }

    return asApplication(snapshot.id, snapshot.data());
  } catch {
    return null;
  }
}

export async function submitApplication(
  tenantId: string,
  propertyId: string,
  answers: ApplicationAnswer[],
): Promise<RentalApplication> {
  const applicationId = applicationDocId(tenantId, propertyId);
  const application: RentalApplication = {
    applicationId,
    propertyId,
    tenantId,
    status: 'pending',
    timestamp: new Date().toISOString(),
    answers,
  };

  await setDoc(doc(db, 'applications', applicationId), application);
  return application;
}

export async function updateScreeningQuestions(
  propertyId: string,
  screeningQuestions: ScreeningQuestion[],
): Promise<void> {
  await updateDoc(doc(db, 'properties', propertyId), { screeningQuestions });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<void> {
  await updateDoc(doc(db, 'applications', applicationId), { status });
}

export function formatRent(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function matchesArea(property: Property, areaId: string): boolean {
  if (!areaId) {
    return true;
  }

  const area = LISTING_AREAS.find((item) => item.id === areaId);
  if (!area || area.needles.length === 0) {
    return true;
  }

  const haystack = `${property.title} ${property.address}`.toLowerCase();
  return area.needles.some((needle) => haystack.includes(needle));
}

export function sortProperties(properties: Property[], sort: ListingSort): Property[] {
  if (sort === 'featured') {
    return properties;
  }

  return [...properties].sort((left, right) =>
    sort === 'price-asc' ? left.price - right.price : right.price - left.price,
  );
}

export function filterProperties(
  properties: Property[],
  search: string,
  maxPrice: number | null,
  areaId = '',
): Property[] {
  const needle = search.trim().toLowerCase();

  return properties.filter((property) => {
    if (property.status !== 'available') {
      return false;
    }

    const matchesSearch =
      needle.length === 0 ||
      property.title.toLowerCase().includes(needle) ||
      property.address.toLowerCase().includes(needle) ||
      property.description.toLowerCase().includes(needle);

    const matchesPrice = maxPrice === null || property.price <= maxPrice;
    return matchesSearch && matchesPrice && matchesArea(property, areaId);
  });
}
