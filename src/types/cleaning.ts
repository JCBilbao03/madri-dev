export const CLEANING_SERVICES = [
  'Standard clean',
  'Deep clean',
  'Move-out',
  'Office',
  'Airbnb turnover',
] as const;

export type CleaningService = (typeof CLEANING_SERVICES)[number];

export type CleanerKind = 'solo' | 'agency';

export type BookingStatus = 'pending' | 'accepted' | 'declined';

export type BookingStep = 'datetime' | 'address' | 'confirm';

export const BOOKING_STEPS: BookingStep[] = ['datetime', 'address', 'confirm'];

export const BOOKING_TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
] as const;

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Cleaner {
  id: string;
  name: string;
  kind: CleanerKind;
  bio: string;
  hourlyRate: number;
  location: string;
  city: string;
  services: CleaningService[];
  photo: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export interface BookingDraft {
  cleanerId: string;
  serviceType: CleaningService | '';
  date: string;
  time: string;
  address: string;
}

export interface Booking {
  id: string;
  cleanerId: string;
  cleanerName: string;
  serviceType: CleaningService;
  date: string;
  time: string;
  address: string;
  hourlyRate: number;
  status: BookingStatus;
  createdAt: string;
}

export function isCleaningService(value: unknown): value is CleaningService {
  return typeof value === 'string' && (CLEANING_SERVICES as readonly string[]).includes(value);
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return value === 'pending' || value === 'accepted' || value === 'declined';
}

export function asBooking(value: unknown): Booking | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== 'string' ||
    typeof item.cleanerId !== 'string' ||
    typeof item.cleanerName !== 'string' ||
    !isCleaningService(item.serviceType) ||
    typeof item.date !== 'string' ||
    typeof item.time !== 'string' ||
    typeof item.address !== 'string' ||
    typeof item.hourlyRate !== 'number' ||
    !Number.isFinite(item.hourlyRate) ||
    !isBookingStatus(item.status) ||
    typeof item.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    cleanerId: item.cleanerId,
    cleanerName: item.cleanerName,
    serviceType: item.serviceType,
    date: item.date,
    time: item.time,
    address: item.address,
    hourlyRate: item.hourlyRate,
    status: item.status,
    createdAt: item.createdAt,
  };
}
