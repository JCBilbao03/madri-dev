import { ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { AdminDialog } from '@/components/admin/AdminDialog';
import { Button } from '@/components/ui/Button';
import {
  leadEmailFromMailMessage,
  leadNameFromMailMessage,
  leadStatusFromMailMessage,
  leadSummaryFromMailMessage,
} from '@/lib/emailLead';
import { addDaysFromToday, presetOptionLabel, REACH_OUT_PRESETS } from '@/lib/leadFollowUp';
import { createLead, findLeadByEmail } from '@/lib/leads';
import { cn } from '@/lib/utils';
import type { Lead, LeadAdminOption } from '@/types/admin';
import type { MailMessage } from '@/types/email';

const fieldClasses =
  'w-full rounded-xl border border-line bg-base px-4 py-3 text-base text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

interface EmailCreateLeadModalProps {
  isOpen: boolean;
  message: MailMessage | null;
  admins: LeadAdminOption[];
  onClose: () => void;
  onCreated: (lead: Lead) => void;
}

interface FormValues {
  name: string;
  email: string;
  summary: string;
  assigneeId: string;
  followUpPreset: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  summary?: string;
}

function valuesFromMessage(message: MailMessage): FormValues {
  return {
    name: leadNameFromMailMessage(message),
    email: leadEmailFromMailMessage(message),
    summary: leadSummaryFromMailMessage(message),
    assigneeId: '',
    followUpPreset: '3',
  };
}

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Add a name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Add an email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'That email address does not look right.';
  }

  if (values.summary.trim().length < 8) {
    errors.summary = 'Add a short summary of this lead.';
  }

  return errors;
}

export function EmailCreateLeadModal({
  isOpen,
  message,
  admins,
  onClose,
  onCreated,
}: EmailCreateLeadModalProps) {
  const fieldId = useId();
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    summary: '',
    assigneeId: '',
    followUpPreset: '3',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [existingLead, setExistingLead] = useState<Lead | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  useEffect(() => {
    if (!isOpen || !message) {
      return;
    }

    setValues(valuesFromMessage(message));
    setErrors({});
    setFormError('');
    setExistingLead(null);

    const email = leadEmailFromMailMessage(message);
    if (!email) {
      return;
    }

    let active = true;
    setIsCheckingExisting(true);

    void findLeadByEmail(email)
      .then((lead) => {
        if (active) {
          setExistingLead(lead);
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingExisting(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, message]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setValues((current) => ({ ...current, [name]: value }));
      setErrors((current) => ({ ...current, [name]: undefined }));
      setFormError('');
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!message || existingLead) {
        return;
      }

      const nextErrors = validate(values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      const assigned = admins.find((admin) => admin.uid === values.assigneeId);
      const followUpDays = values.followUpPreset ? Number.parseInt(values.followUpPreset, 10) : NaN;
      const followUpAt =
        Number.isFinite(followUpDays) && followUpDays > 0 ? addDaysFromToday(followUpDays) : '';

      setIsSaving(true);
      setFormError('');

      try {
        const lead = await createLead({
          appId: 'marketing',
          source: 'email-outreach',
          name: values.name.trim(),
          email: values.email.trim(),
          summary: values.summary.trim(),
          status: leadStatusFromMailMessage(message),
          followUpAt,
          assigneeId: assigned?.uid,
          assigneeName: assigned?.name.trim(),
          metadata: { mailMessageId: message.id },
        });

        onCreated(lead);
        onClose();
      } catch (saveError) {
        setFormError(saveError instanceof Error ? saveError.message : 'Could not create this lead.');
      } finally {
        setIsSaving(false);
      }
    },
    [admins, existingLead, message, onClose, onCreated, values],
  );

  if (!message) {
    return null;
  }

  return (
    <AdminDialog
      isOpen={isOpen}
      title="Create lead from email"
      description="Add this contact to Leads monitoring and link it to this thread."
      onClose={onClose}
    >
      {isCheckingExisting ? (
        <p className="text-sm text-ink-muted">Checking for existing leads…</p>
      ) : existingLead ? (
        <div className="w-full min-w-0 space-y-4">
          <div className="rounded-xl border border-line bg-base/50 px-4 py-3 text-sm text-ink">
            <p className="font-medium">Lead already exists</p>
            <p className="mt-1 text-ink-muted">
              {existingLead.name} ({existingLead.email}) is already in your leads list.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
              Close
            </Button>
            <Button to="/admin/leads" variant="cta" className="w-full sm:w-auto">
              <ExternalLink className="size-4" aria-hidden="true" />
              View leads
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="w-full min-w-0 space-y-4">
          <div>
            <label htmlFor={`${fieldId}-name`} className="mb-2 block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id={`${fieldId}-name`}
              name="name"
              value={values.name}
              onChange={handleChange}
              className={cn(fieldClasses, errors.name && 'border-danger')}
            />
            {errors.name ? <p className="mt-1.5 text-sm text-danger">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor={`${fieldId}-email`} className="mb-2 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id={`${fieldId}-email`}
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              className={cn(fieldClasses, errors.email && 'border-danger')}
            />
            {errors.email ? <p className="mt-1.5 text-sm text-danger">{errors.email}</p> : null}
          </div>

          <div>
            <label htmlFor={`${fieldId}-summary`} className="mb-2 block text-sm font-medium text-ink">
              Summary
            </label>
            <textarea
              id={`${fieldId}-summary`}
              name="summary"
              rows={4}
              value={values.summary}
              onChange={handleChange}
              className={cn(fieldClasses, errors.summary && 'border-danger')}
            />
            {errors.summary ? <p className="mt-1.5 text-sm text-danger">{errors.summary}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${fieldId}-assigneeId`} className="mb-2 block text-sm font-medium text-ink">
                Assignee
              </label>
              <select
                id={`${fieldId}-assigneeId`}
                name="assigneeId"
                value={values.assigneeId}
                onChange={handleChange}
                className={fieldClasses}
              >
                <option value="">Unassigned</option>
                {admins.map((admin) => (
                  <option key={admin.uid} value={admin.uid}>
                    {admin.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${fieldId}-followUpPreset`} className="mb-2 block text-sm font-medium text-ink">
                Reach out
              </label>
              <select
                id={`${fieldId}-followUpPreset`}
                name="followUpPreset"
                value={values.followUpPreset}
                onChange={handleChange}
                className={fieldClasses}
              >
                <option value="">No follow-up</option>
                {REACH_OUT_PRESETS.map((preset) => (
                  <option key={preset.days} value={String(preset.days)}>
                    {presetOptionLabel(preset.days)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Source: Email outreach · Status:{' '}
            <span className="capitalize">{leadStatusFromMailMessage(message)}</span>
          </p>

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" className="w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? 'Creating…' : 'Create lead'}
            </Button>
          </div>
        </form>
      )}
    </AdminDialog>
  );
}
