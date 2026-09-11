import { createLead } from '@/lib/leads';

export interface ProjectInquiry {
  name: string;
  email: string;
  details: string;
  /** Honeypot — must stay empty. Bots that fill hidden fields are rejected. */
  company?: string;
}

export interface InquiryResult {
  ok: boolean;
  message: string;
}

/**
 * Persists a project inquiry as a marketing lead in Firestore.
 */
export async function submitProjectInquiry(inquiry: ProjectInquiry): Promise<InquiryResult> {
  if (inquiry.company?.trim()) {
    return {
      ok: true,
      message: 'Thanks — your brief is in. We reply to every inquiry within one business day.',
    };
  }

  await createLead({
    appId: 'marketing',
    source: 'contact-form',
    name: inquiry.name,
    email: inquiry.email,
    summary: inquiry.details,
  });

  return {
    ok: true,
    message: 'Thanks — your brief is in. We reply to every inquiry within one business day.',
  };
}
