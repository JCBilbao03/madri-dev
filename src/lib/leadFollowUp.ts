import { formatLeadDate, type Lead, type LeadStatus } from '@/types/admin';

export const REACH_OUT_PRESETS = [
  { days: 1, label: 'Tomorrow' },
  { days: 3, label: 'In 3 days' },
  { days: 7, label: 'In 1 week' },
  { days: 14, label: 'In 2 weeks' },
] as const;

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isFollowUpDue(followUpAt: string, status: LeadStatus): boolean {
  if (!followUpAt || status === 'closed') {
    return false;
  }

  return followUpAt <= todayDateString();
}

export function followUpTone(followUpAt: string, status: LeadStatus): 'due' | 'upcoming' | 'none' {
  if (!followUpAt || status === 'closed') {
    return 'none';
  }

  if (isFollowUpDue(followUpAt, status)) {
    return 'due';
  }

  return 'upcoming';
}

export function followUpLabel(followUpAt: string): string {
  const today = todayDateString();
  const formatted = formatLeadDate(`${followUpAt}T12:00:00.000Z`);

  if (followUpAt < today) {
    return `Overdue · ${formatted}`;
  }

  if (followUpAt === today) {
    return 'Due today';
  }

  return `Due ${formatted}`;
}

export function presetOptionLabel(days: number): string {
  const preset = REACH_OUT_PRESETS.find((entry) => entry.days === days);
  const dateLabel = formatLeadDate(`${addDaysFromToday(days)}T12:00:00.000Z`);
  return preset ? `${preset.label} · ${dateLabel}` : dateLabel;
}

/** Due and overdue leads first, then upcoming follow-ups, then the rest by created date. */
export function sortLeadsByFollowUp(leads: Lead[]): Lead[] {
  return [...leads].sort((left, right) => {
    const leftDue = isFollowUpDue(left.followUpAt, left.status);
    const rightDue = isFollowUpDue(right.followUpAt, right.status);

    if (leftDue && !rightDue) {
      return -1;
    }

    if (!leftDue && rightDue) {
      return 1;
    }

    if (leftDue && rightDue) {
      const byFollowUp = left.followUpAt.localeCompare(right.followUpAt);
      if (byFollowUp !== 0) {
        return byFollowUp;
      }
    }

    const leftHasFollowUp = Boolean(left.followUpAt) && left.status !== 'closed';
    const rightHasFollowUp = Boolean(right.followUpAt) && right.status !== 'closed';

    if (leftHasFollowUp && rightHasFollowUp) {
      const byUpcoming = left.followUpAt.localeCompare(right.followUpAt);
      if (byUpcoming !== 0) {
        return byUpcoming;
      }
    }

    if (leftHasFollowUp && !rightHasFollowUp) {
      return -1;
    }

    if (!leftHasFollowUp && rightHasFollowUp) {
      return 1;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function countDueFollowUps(leads: Lead[]): number {
  return leads.filter((lead) => isFollowUpDue(lead.followUpAt, lead.status)).length;
}
