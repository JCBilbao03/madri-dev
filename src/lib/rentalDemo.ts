import { DEMO_APPLICATIONS, DEMO_LANDLORD_ID, DEMO_PROPERTIES } from '@/data/demoListings';
import type { ApplicationAnswer, ApplicationStatus, Property, RentalApplication, ScreeningQuestion } from '@/types/rental';
import { applicationDocId } from '@/types/rental';

export const DEMO_TENANT_ID = 'demo-tenant';
export const DEMO_TENANT_NAME = 'Demo guest';

export function mergeDemoProperties(
  properties: Property[],
  screeningOverrides: Record<string, ScreeningQuestion[]>,
): Property[] {
  const source = properties.length > 0 ? properties : DEMO_PROPERTIES;

  return source.map((property) => {
    const override = screeningOverrides[property.propertyId];
    if (!override) {
      return property;
    }

    return { ...property, screeningQuestions: override };
  });
}

export function mergeDemoApplications(localApplications: RentalApplication[]): RentalApplication[] {
  const byId = new Map<string, RentalApplication>();

  for (const application of DEMO_APPLICATIONS) {
    byId.set(application.applicationId, application);
  }

  for (const application of localApplications) {
    byId.set(application.applicationId, application);
  }

  return [...byId.values()].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

export function demoLandlordProperties(properties: Property[]): Property[] {
  const merged = properties.length > 0 ? properties : DEMO_PROPERTIES;
  return merged.filter((property) => property.landlordId === DEMO_LANDLORD_ID);
}

export function demoTenantApplications(applications: RentalApplication[]): RentalApplication[] {
  return applications.filter((application) => application.tenantId === DEMO_TENANT_ID);
}

export function createDemoApplication(
  propertyId: string,
  answers: ApplicationAnswer[],
): RentalApplication {
  const applicationId = applicationDocId(DEMO_TENANT_ID, propertyId);

  return {
    applicationId,
    propertyId,
    tenantId: DEMO_TENANT_ID,
    status: 'pending',
    timestamp: new Date().toISOString(),
    answers,
  };
}

export function updateDemoApplicationStatus(
  applications: RentalApplication[],
  applicationId: string,
  status: ApplicationStatus,
): RentalApplication[] {
  const existing = applications.find((application) => application.applicationId === applicationId);
  const seed = existing ?? DEMO_APPLICATIONS.find((application) => application.applicationId === applicationId);

  if (!seed) {
    return applications;
  }

  const next = { ...seed, status };
  const without = applications.filter((application) => application.applicationId !== applicationId);
  return [next, ...without];
}
