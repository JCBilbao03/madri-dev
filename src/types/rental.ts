export type UserRole = 'tenant' | 'landlord';

export interface UserProfile {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  profileData: Record<string, unknown>;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'declined' | 'withdrawn';

const APPLICATION_STATUSES: ApplicationStatus[] = [
  'pending',
  'reviewing',
  'accepted',
  'declined',
  'withdrawn',
];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && APPLICATION_STATUSES.includes(value as ApplicationStatus);
}

export interface Property {
  propertyId: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  price: number;
  photos: string[];
  status: string;
  screeningQuestions: ScreeningQuestion[];
}

export type ScreeningQuestionType = 'text' | 'yesno';

export interface ScreeningQuestion {
  id: string;
  prompt: string;
  type: ScreeningQuestionType;
}

export interface ApplicationAnswer {
  questionId: string;
  prompt: string;
  answer: string;
}

export interface RentalApplication {
  applicationId: string;
  propertyId: string;
  tenantId: string;
  status: ApplicationStatus;
  timestamp: string;
  answers: ApplicationAnswer[];
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'tenant' || value === 'landlord';
}

export function dashboardPath(role: UserRole): '/landlord' | '/tenant' {
  return role === 'landlord' ? '/landlord' : '/tenant';
}

export function applicationDocId(tenantId: string, propertyId: string): string {
  return `${tenantId}_${propertyId}`;
}

export function savedIdsFromProfile(profileData: Record<string, unknown>): string[] {
  const value = profileData.savedPropertyIds;
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

export type ListingSort = 'featured' | 'price-asc' | 'price-desc';

export interface ListingArea {
  id: string;
  label: string;
  needles: string[];
}

export const LISTING_AREAS: ListingArea[] = [
  { id: '', label: 'All areas', needles: [] },
  { id: 'austin', label: 'Austin', needles: ['austin', 'rainey'] },
  { id: 'brooklyn', label: 'Brooklyn', needles: ['brooklyn', 'williamsburg', 'bedford'] },
  { id: 'chicago', label: 'Chicago', needles: ['chicago', 'lincoln park', 'clark'] },
  { id: 'denver', label: 'Denver', needles: ['denver', 'rino', 'larimer'] },
];

export function isListingSort(value: string): value is ListingSort {
  return value === 'featured' || value === 'price-asc' || value === 'price-desc';
}

export const MAX_SCREENING_QUESTIONS = 8;
export const MIN_SCREENING_PROMPT = 8;
export const MAX_SCREENING_PROMPT = 160;
export const MAX_SCREENING_ANSWER = 400;

export const DEFAULT_SCREENING_QUESTIONS: ScreeningQuestion[] = [
  { id: 'occupants', prompt: 'How many people will live in this home?', type: 'text' },
  { id: 'pets', prompt: 'Do you have pets?', type: 'yesno' },
  { id: 'move-in', prompt: 'When do you want to move in?', type: 'text' },
  { id: 'income', prompt: 'What is your monthly household income?', type: 'text' },
];

export function isScreeningQuestionType(value: unknown): value is ScreeningQuestionType {
  return value === 'text' || value === 'yesno';
}

export function asScreeningQuestion(value: unknown): ScreeningQuestion | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || item.id.length === 0 || item.id.length > 40) {
    return null;
  }

  if (typeof item.prompt !== 'string' || !isScreeningQuestionType(item.type)) {
    return null;
  }

  return { id: item.id, prompt: item.prompt, type: item.type };
}

export function asScreeningQuestions(value: unknown): ScreeningQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(asScreeningQuestion).filter((item): item is ScreeningQuestion => item !== null);
}

export function asApplicationAnswers(value: unknown): ApplicationAnswer[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return [];
    }

    const item = entry as Record<string, unknown>;
    if (typeof item.questionId !== 'string' || typeof item.prompt !== 'string' || typeof item.answer !== 'string') {
      return [];
    }

    return [{ questionId: item.questionId, prompt: item.prompt, answer: item.answer }];
  });
}

export function newQuestionId(): string {
  return `q-${crypto.randomUUID().slice(0, 8)}`;
}
