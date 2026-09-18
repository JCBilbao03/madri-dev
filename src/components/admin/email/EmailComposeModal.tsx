import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';

import { AdminDialog } from '@/components/admin/AdminDialog';
import { Button } from '@/components/ui/Button';
import { applyEmailTemplate } from '@/data/emailTemplates';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import type { MailComposePayload, MailMessage } from '@/types/email';

const fieldClasses =
  'w-full rounded-xl border border-line bg-base px-4 py-3 text-base text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

export interface ComposeSeed {
  to?: string;
  subject?: string;
  body?: string;
}

interface EmailComposeModalProps {
  isOpen: boolean;
  mode: 'compose' | 'reply';
  replyTo: MailMessage | null;
  seed?: ComposeSeed | null;
  onClose: () => void;
  onSend: (payload: MailComposePayload) => Promise<void>;
}

interface ComposeFormValues {
  to: string;
  cc: string;
  subject: string;
  body: string;
}

function initialValues(
  mode: 'compose' | 'reply',
  replyTo: MailMessage | null,
  seed: ComposeSeed | null | undefined,
): ComposeFormValues {
  if (mode === 'reply' && replyTo) {
    const replyAddress = replyTo.from.address.trim();
    const subject = replyTo.subject.trim().toLowerCase().startsWith('re:')
      ? replyTo.subject.trim()
      : `Re: ${replyTo.subject.trim() || '(No subject)'}`;

    return {
      to: replyAddress,
      cc: '',
      subject,
      body: '',
    };
  }

  return {
    to: seed?.to?.trim() ?? '',
    cc: '',
    subject: seed?.subject?.trim() ?? '',
    body: seed?.body?.trim() ?? '',
  };
}

function parseRecipientField(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function EmailComposeModal({
  isOpen,
  mode,
  replyTo,
  seed,
  onClose,
  onSend,
}: EmailComposeModalProps) {
  const formId = useId();
  const { templates, isLoading: isLoadingTemplates } = useEmailTemplates();
  const [values, setValues] = useState<ComposeFormValues>(() => initialValues(mode, replyTo, seed));
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [defaultTemplateApplied, setDefaultTemplateApplied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues(mode, replyTo, seed));
      setError('');
      setIsSending(false);
      setDefaultTemplateApplied(false);
    }
  }, [isOpen, mode, replyTo, seed]);

  useEffect(() => {
    if (!isOpen || mode !== 'compose' || defaultTemplateApplied || isLoadingTemplates) {
      return;
    }

    const nextValues = initialValues(mode, replyTo, seed);
    if (nextValues.subject.trim() || nextValues.body.trim() || !nextValues.to.trim()) {
      return;
    }

    const template = templates[0];
    if (!template) {
      return;
    }

    const applied = applyEmailTemplate(template, {
      company: nextValues.to.split('@')[0],
      name: nextValues.to.split('@')[0],
    });

    setValues((current) => ({
      ...current,
      subject: applied.subject,
      body: applied.body,
    }));
    setDefaultTemplateApplied(true);
  }, [defaultTemplateApplied, isLoadingTemplates, isOpen, mode, replyTo, seed, templates]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const handleTemplateChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const template = templates.find((entry) => entry.id === event.target.value);
      if (!template) {
        return;
      }

      const applied = applyEmailTemplate(template, {
        company: values.to.split('@')[0],
        name: values.to.split('@')[0],
      });

      setValues((current) => ({
        ...current,
        subject: applied.subject,
        body: applied.body,
      }));
    },
    [templates, values.to],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError('');

      const to = parseRecipientField(values.to);
      const cc = parseRecipientField(values.cc);

      if (to.length === 0) {
        setError('Add at least one recipient.');
        return;
      }

      if (!values.subject.trim()) {
        setError('Subject is required.');
        return;
      }

      if (!values.body.trim()) {
        setError('Message body is required.');
        return;
      }

      const references = replyTo
        ? [...replyTo.references, replyTo.messageId].filter(Boolean)
        : undefined;

      const payload: MailComposePayload = {
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: values.subject.trim(),
        body: values.body.trim(),
        replyToMessageId: replyTo?.id,
        inReplyTo: replyTo?.messageId,
        references,
      };

      setIsSending(true);
      try {
        await onSend(payload);
        onClose();
      } catch (sendError) {
        setError(sendError instanceof Error ? sendError.message : 'Could not send email.');
      } finally {
        setIsSending(false);
      }
    },
    [onClose, onSend, replyTo, values.body, values.cc, values.subject, values.to],
  );

  return (
    <AdminDialog
      isOpen={isOpen}
      title={mode === 'reply' ? 'Reply' : 'Compose email'}
      description="Messages send from hello@madribuild.com via Titan SMTP."
      onClose={onClose}
    >
      <form id={formId} onSubmit={handleSubmit} className="w-full min-w-0 space-y-4">
        {mode === 'compose' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Template</span>
            <select
              onChange={handleTemplateChange}
              defaultValue=""
              disabled={isLoadingTemplates || templates.length === 0}
              className={fieldClasses}
            >
              <option value="" disabled>
                {isLoadingTemplates
                  ? 'Loading templates…'
                  : templates.length === 0
                    ? 'No templates available'
                    : 'Insert a template…'}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">To</span>
          <input
            name="to"
            type="text"
            autoComplete="email"
            value={values.to}
            onChange={handleChange}
            className={fieldClasses}
            placeholder="name@company.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Cc</span>
          <input
            name="cc"
            type="text"
            autoComplete="email"
            value={values.cc}
            onChange={handleChange}
            className={fieldClasses}
            placeholder="Optional"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Subject</span>
          <input
            name="subject"
            type="text"
            value={values.subject}
            onChange={handleChange}
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Message</span>
          <textarea
            name="body"
            rows={8}
            value={values.body}
            onChange={handleChange}
            className={fieldClasses}
            placeholder="Write your message…"
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSending}>
            {isSending ? 'Sending…' : 'Send email'}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}
