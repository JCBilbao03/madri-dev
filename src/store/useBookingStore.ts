import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getCleanerById } from '@/lib/cleaning';
import { captureLead } from '@/lib/leads';
import {
  asBooking,
  BOOKING_STEPS,
  type Booking,
  type BookingDraft,
  type BookingStep,
  type CleaningService,
} from '@/types/cleaning';

const BOOKING_STORAGE_KEY = 'madribuild-cleaning-bookings';
const LEGACY_BOOKING_STORAGE_KEY = 'madridev-cleaning-bookings';

/** One-time migration from the pre-rebrand persist key. */
function migrateLegacyBookingStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const legacy = window.localStorage.getItem(LEGACY_BOOKING_STORAGE_KEY);
    if (legacy && !window.localStorage.getItem(BOOKING_STORAGE_KEY)) {
      window.localStorage.setItem(BOOKING_STORAGE_KEY, legacy);
      window.localStorage.removeItem(LEGACY_BOOKING_STORAGE_KEY);
    }
  } catch {
    // Private mode or blocked storage — migration is best-effort.
  }
}

migrateLegacyBookingStorage();

const EMPTY_DRAFT: BookingDraft = {
  cleanerId: '',
  serviceType: '',
  date: '',
  time: '',
  address: '',
};

interface BookingState {
  isBookingOpen: boolean;
  step: BookingStep;
  draft: BookingDraft;
  bookings: Booking[];
  openBooking: (cleanerId: string, serviceType?: CleaningService) => void;
  closeBooking: () => void;
  setDraft: (partial: Partial<BookingDraft>) => void;
  nextStep: () => void;
  prevStep: () => void;
  confirmBooking: () => Booking | null;
  acceptBooking: (id: string) => void;
  declineBooking: (id: string) => void;
}

/**
 * Booking flow and persisted requests for the cleaning marketplace demo.
 * Always read with an atomic selector: `useBookingStore((state) => state.bookings)`.
 */
export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      isBookingOpen: false,
      step: 'datetime',
      draft: EMPTY_DRAFT,
      bookings: [],

      openBooking: (cleanerId, serviceType) => {
        const cleaner = getCleanerById(cleanerId);
        const fallback = cleaner?.services[0] ?? '';

        set({
          isBookingOpen: true,
          step: 'datetime',
          draft: {
            ...EMPTY_DRAFT,
            cleanerId,
            serviceType: serviceType ?? fallback,
          },
        });
      },

      closeBooking: () =>
        set({
          isBookingOpen: false,
          step: 'datetime',
          draft: EMPTY_DRAFT,
        }),

      setDraft: (partial) =>
        set((state) => ({
          draft: { ...state.draft, ...partial },
        })),

      nextStep: () => {
        const index = BOOKING_STEPS.indexOf(get().step);
        const next = BOOKING_STEPS[index + 1];
        if (next) {
          set({ step: next });
        }
      },

      prevStep: () => {
        const index = BOOKING_STEPS.indexOf(get().step);
        const previous = BOOKING_STEPS[index - 1];
        if (previous) {
          set({ step: previous });
        }
      },

      confirmBooking: () => {
        const { draft, bookings } = get();
        const cleaner = getCleanerById(draft.cleanerId);

        if (!cleaner || !draft.serviceType || !draft.date || !draft.time || !draft.address.trim()) {
          return null;
        }

        const booking: Booking = {
          id: `bk-${crypto.randomUUID().slice(0, 8)}`,
          cleanerId: cleaner.id,
          cleanerName: cleaner.name,
          serviceType: draft.serviceType,
          date: draft.date,
          time: draft.time,
          address: draft.address.trim(),
          hourlyRate: cleaner.hourlyRate,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set({
          bookings: [booking, ...bookings],
          isBookingOpen: false,
          step: 'datetime',
          draft: EMPTY_DRAFT,
        });

        captureLead({
          appId: 'cleaning',
          source: 'cleaning-booking',
          name: 'Cleaning guest',
          email: 'guest@cleaning.local',
          summary: `${booking.serviceType} with ${booking.cleanerName} on ${booking.date} at ${booking.time}`,
          metadata: {
            bookingId: booking.id,
            cleanerId: booking.cleanerId,
            serviceType: booking.serviceType,
            address: booking.address,
          },
        });

        return booking;
      },

      acceptBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, status: 'accepted' } : booking,
          ),
        })),

      declineBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, status: 'declined' } : booking,
          ),
        })),
    }),
    {
      name: BOOKING_STORAGE_KEY,
      partialize: (state) => ({ bookings: state.bookings }),
      merge: (persisted, current) => {
        const raw = persisted as Partial<BookingState> | undefined;
        const bookings = Array.isArray(raw?.bookings)
          ? raw.bookings.map(asBooking).filter((booking): booking is Booking => booking !== null)
          : [];

        return { ...current, bookings };
      },
    },
  ),
);
