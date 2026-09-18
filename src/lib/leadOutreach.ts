import type { Lead } from '@/types/admin';

export function leadIndustry(lead: Lead): string {
  return lead.metadata.serviceType?.trim() || '';
}

export function buildLeadEmailSearchParams(lead: Lead): URLSearchParams {
  const params = new URLSearchParams({
    compose: '1',
    leadId: lead.leadId,
    to: lead.email.trim(),
  });

  if (lead.metadata.mailMessageId) {
    params.set('thread', lead.metadata.mailMessageId);
  }

  return params;
}

export function buildLeadEmailPath(lead: Lead): string {
  if (!lead.email.trim()) {
    return '/admin/email';
  }

  return `/admin/email?${buildLeadEmailSearchParams(lead).toString()}`;
}

export function collectLeadIndustries(leads: Lead[]): string[] {
  const values = new Set<string>();

  for (const lead of leads) {
    const industry = leadIndustry(lead);
    if (industry) {
      values.add(industry);
    }
  }

  return [...values].sort((left, right) => left.localeCompare(right));
}
