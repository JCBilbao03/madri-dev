import { cleaners } from '@/data/cleaners';
import type { Booking, Cleaner, CleaningService } from '@/types/cleaning';

export function getCleanerById(id: string): Cleaner | undefined {
  return cleaners.find((cleaner) => cleaner.id === id);
}

export function filterCleaners(
  listings: Cleaner[],
  query: string,
  service: CleaningService | '' = '',
): Cleaner[] {
  const needle = query.trim().toLowerCase();

  return listings.filter((cleaner) => {
    if (service && !cleaner.services.includes(service)) {
      return false;
    }

    if (!needle) {
      return true;
    }

    const haystack = [cleaner.name, cleaner.city, cleaner.location, cleaner.kind, cleaner.bio, ...cleaner.services]
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export function formatHourlyRate(rate: number): string {
  return `$${rate}/hr`;
}

export function formatBookingDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeSlot(time: string): string {
  const parts = time.split(':');
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return time;
  }

  const parsed = new Date();
  parsed.setHours(hours, minutes, 0, 0);

  return parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatReviewDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function todayDateInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isUpcomingBooking(booking: Booking): boolean {
  if (booking.status === 'declined') {
    return false;
  }

  const when = new Date(`${booking.date}T${booking.time}:00`);
  if (Number.isNaN(when.getTime())) {
    return booking.status === 'pending' || booking.status === 'accepted';
  }

  return when.getTime() >= Date.now() - 60 * 60 * 1000;
}

export function sortBookingsByDate(bookings: Booking[]): Booking[] {
  return [...bookings].sort((left, right) => {
    const leftTime = new Date(`${left.date}T${left.time}:00`).getTime();
    const rightTime = new Date(`${right.date}T${right.time}:00`).getTime();
    return leftTime - rightTime;
  });
}
