export interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
}

/** Built-in defaults — seeded into Firestore on first load when no templates exist. */
export const DEFAULT_OUTREACH_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'intro',
    label: 'Cold intro',
    subject: 'Quick idea for {{company}}',
    body: `Hello,

I hope you're doing well. I'm with MadriBuild — we help businesses like yours with websites, web apps, and product design.

I'd love to learn a bit about what you're working on and see if there's a fit to help.

Would you be open to a short call this week?

Best,
MadriBuild`,
  },
  {
    id: 'dental',
    label: 'Dental clinic',
    subject: 'Helping {{company}} get more patient inquiries online',
    body: `Hello,

I came across your clinic and wanted to reach out. At MadriBuild we help dental practices improve their online presence — clearer websites, easier booking flows, and better mobile experience for patients.

If you're exploring a refresh or want more inquiries from your site, I'd be happy to share a few ideas — no pressure.

Best,
MadriBuild`,
  },
  {
    id: 'follow-up',
    label: 'Follow-up',
    subject: 'Following up — MadriBuild',
    body: `Hello,

Just following up on my note from last week. Happy to share examples of recent work or jump on a quick call if timing is better now.

Best,
MadriBuild`,
  },
];

/** @deprecated Use fetchEmailTemplates() — kept as a synchronous fallback only. */
export const OUTREACH_EMAIL_TEMPLATES = DEFAULT_OUTREACH_EMAIL_TEMPLATES;

export function applyEmailTemplate(
  template: EmailTemplate,
  context: { company?: string; name?: string },
): { subject: string; body: string } {
  const company = context.company?.trim() || context.name?.trim() || 'your team';

  return {
    subject: template.subject.replaceAll('{{company}}', company),
    body: template.body.replaceAll('{{company}}', company),
  };
}
