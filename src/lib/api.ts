export interface ProjectInquiry {
  name: string;
  email: string;
  details: string;
}

export interface InquiryResult {
  ok: boolean;
  message: string;
}

/**
 * Submits a project inquiry.
 *
 * TODO: point this at a real endpoint — a Firebase Cloud Function, a Firestore
 * `inquiries` collection write, or a form service such as Formspree. Until then
 * it resolves locally so the form's success and error states stay demonstrable.
 */
export async function submitProjectInquiry(inquiry: ProjectInquiry): Promise<InquiryResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (import.meta.env.DEV) {
    console.info('[MadriDev] Project inquiry (not yet sent anywhere):', inquiry);
  }

  return {
    ok: true,
    message: 'Thanks — your brief is in. We reply to every inquiry within one business day.',
  };
}
