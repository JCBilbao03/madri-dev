import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';

import { AdminDialog } from '@/components/admin/AdminDialog';
import { Button } from '@/components/ui/Button';
import type { EmailTemplate } from '@/data/emailTemplates';
import type { EmailTemplateInput } from '@/lib/emailTemplateStore';
import { cn } from '@/lib/utils';

const fieldClasses =
  'w-full rounded-xl border border-line bg-base px-4 py-3 text-base text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

interface EmailTemplateEditorModalProps {
  isOpen: boolean;
  template: EmailTemplate | null;
  onClose: () => void;
  onSave: (input: EmailTemplateInput) => Promise<void>;
}

interface FormValues {
  label: string;
  subject: string;
  body: string;
}

interface FieldErrors {
  label?: string;
  subject?: string;
  body?: string;
}

const EMPTY: FormValues = {
  label: '',
  subject: '',
  body: '',
};

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.label.trim()) {
    errors.label = 'Name is required.';
  }

  if (!values.subject.trim()) {
    errors.subject = 'Subject is required.';
  }

  if (!values.body.trim()) {
    errors.body = 'Body is required.';
  }

  return errors;
}

export function EmailTemplateEditorModal({
  isOpen,
  template,
  onClose,
  onSave,
}: EmailTemplateEditorModalProps) {
  const fieldId = useId();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(
      template
        ? {
            label: template.label,
            subject: template.subject,
            body: template.body,
          }
        : EMPTY,
    );
    setErrors({});
    setFormError('');
    setIsSaving(false);
  }, [isOpen, template]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError('');

      const nextErrors = validate(values);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      setIsSaving(true);
      try {
        await onSave({
          label: values.label.trim(),
          subject: values.subject.trim(),
          body: values.body.trim(),
        });
        onClose();
      } catch (saveError) {
        setFormError(saveError instanceof Error ? saveError.message : 'Could not save template.');
      } finally {
        setIsSaving(false);
      }
    },
    [onClose, onSave, values],
  );

  return (
    <AdminDialog
      isOpen={isOpen}
      title={template ? 'Edit template' : 'New template'}
      description="Use {{company}} in the subject or body — it is replaced with the lead or recipient name when inserted."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Template name</span>
          <input
            id={`${fieldId}-label`}
            name="label"
            value={values.label}
            onChange={handleChange}
            placeholder="Cold intro"
            className={cn(fieldClasses, errors.label && 'border-danger')}
          />
          {errors.label ? <p className="mt-1 text-sm text-danger">{errors.label}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Subject</span>
          <input
            id={`${fieldId}-subject`}
            name="subject"
            value={values.subject}
            onChange={handleChange}
            placeholder="Quick idea for {{company}}"
            className={cn(fieldClasses, errors.subject && 'border-danger')}
          />
          {errors.subject ? <p className="mt-1 text-sm text-danger">{errors.subject}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Body</span>
          <textarea
            id={`${fieldId}-body`}
            name="body"
            value={values.body}
            onChange={handleChange}
            rows={12}
            placeholder={'Hello,\n\nYour message…\n\nBest,\nMadriBuild'}
            className={cn(fieldClasses, 'min-h-[14rem] resize-y font-mono text-sm', errors.body && 'border-danger')}
          />
          {errors.body ? <p className="mt-1 text-sm text-danger">{errors.body}</p> : null}
        </label>

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="cta" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? 'Saving…' : template ? 'Save changes' : 'Create template'}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}
