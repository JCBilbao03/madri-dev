import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';

import { AdminDialog } from '@/components/admin/AdminDialog';
import { Button } from '@/components/ui/Button';
import { addDaysFromToday, presetOptionLabel, REACH_OUT_PRESETS } from '@/lib/leadFollowUp';
import { cn } from '@/lib/utils';
import {
  APP_IDS,
  APP_LABELS,
  isAppId,
  isLeadSource,
  isLeadStatus,
  LEAD_SOURCE_GROUPS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  OTHER_LEAD_SOURCE,
  SOURCE_BY_APP,
  type AppId,
  type Lead,
  type LeadAdminOption,
  type LeadSource,
  type LeadStatus,
  type LeadUpdateInput,
} from '@/types/admin';

const fieldClasses =
  'w-full rounded-xl border border-line bg-base px-4 py-3 text-base text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

interface LeadFormValues {
  name: string;
  email: string;
  summary: string;
  serviceType: string;
  appId: AppId;
  source: LeadSource;
  sourceDetail: string;
  status: LeadStatus;
  assigneeId: string;
  followUpPreset: string;
}

type FieldName = keyof LeadFormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMPTY: LeadFormValues = {
  name: '',
  email: '',
  summary: '',
  serviceType: '',
  appId: 'marketing',
  source: 'contact-form',
  sourceDetail: '',
  status: 'new',
  assigneeId: '',
  followUpPreset: '',
};

function valuesFromLead(lead: Lead): LeadFormValues {
  return {
    name: lead.name,
    email: lead.email,
    summary: lead.summary,
    serviceType: lead.metadata.serviceType ?? '',
    appId: lead.appId,
    source: lead.source,
    sourceDetail: lead.sourceDetail,
    status: lead.status,
    assigneeId: lead.assigneeId,
    followUpPreset: '',
  };
}

function validate(values: LeadFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Add a name.';
  }

  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'That email address does not look right.';
  }

  if (values.source === OTHER_LEAD_SOURCE && !values.sourceDetail.trim()) {
    errors.sourceDetail = 'Describe where this lead came from.';
  }

  if (values.summary.trim().length < 8) {
    errors.summary = 'Add a short summary of this lead.';
  }

  return errors;
}

interface LeadEditorModalProps {
  isOpen: boolean;
  lead: Lead | null;
  admins: LeadAdminOption[];
  onClose: () => void;
  onCreate: (values: LeadUpdateInput) => Promise<void>;
  onUpdate: (leadId: string, values: LeadUpdateInput) => Promise<void>;
}

export function LeadEditorModal({ isOpen, lead, admins, onClose, onCreate, onUpdate }: LeadEditorModalProps) {
  const fieldId = useId();
  const [values, setValues] = useState<LeadFormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = lead !== null;
  const isOtherSource = values.source === OTHER_LEAD_SOURCE;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(lead ? valuesFromLead(lead) : EMPTY);
    setErrors({});
    setFormError('');
  }, [isOpen, lead]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setValues((current) => {
      if (name === 'appId' && isAppId(value)) {
        return { ...current, appId: value, source: SOURCE_BY_APP[value], sourceDetail: '' };
      }

      if (name === 'source' && isLeadSource(value)) {
        return {
          ...current,
          source: value,
          sourceDetail: value === OTHER_LEAD_SOURCE ? current.sourceDetail : '',
        };
      }

      return { ...current, [name]: value };
    });
    setErrors((current) => ({ ...current, [name as FieldName]: undefined }));
    setFormError('');
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = validate(values);
      setErrors(nextErrors);
      if (
        Object.keys(nextErrors).length > 0 ||
        !isAppId(values.appId) ||
        !isLeadSource(values.source) ||
        !isLeadStatus(values.status)
      ) {
        return;
      }

      const assigned = admins.find((admin) => admin.uid === values.assigneeId);
      const followUpDays = values.followUpPreset ? Number.parseInt(values.followUpPreset, 10) : NaN;
      const followUpAt =
        Number.isFinite(followUpDays) && followUpDays > 0
          ? addDaysFromToday(followUpDays)
          : lead?.followUpAt ?? '';

      const payload: LeadUpdateInput = {
        name: values.name.trim(),
        email: values.email.trim(),
        summary: values.summary.trim(),
        appId: values.appId,
        source: values.source,
        sourceDetail: values.source === OTHER_LEAD_SOURCE ? values.sourceDetail.trim() : '',
        status: values.status,
        followUpAt,
        assigneeId: assigned?.uid ?? '',
        assigneeName: assigned?.name.trim() ?? '',
        serviceType: values.serviceType.trim(),
      };

      setIsSaving(true);
      setFormError('');
      try {
        if (lead) {
          await onUpdate(lead.leadId, payload);
        } else {
          await onCreate(payload);
        }
        onClose();
      } catch (saveError) {
        setFormError(saveError instanceof Error ? saveError.message : 'Could not save this lead.');
      } finally {
        setIsSaving(false);
      }
    },
    [admins, lead, onClose, onCreate, onUpdate, values],
  );

  return (
    <AdminDialog
      isOpen={isOpen}
      title={isEdit ? 'Edit lead' : 'Add lead'}
      description={isEdit ? 'Update the details for this lead.' : 'Create a lead that is not coming from an app form.'}
      onClose={onClose}
      size="lg"
    >
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
            Email <span className="font-normal text-ink-muted">(optional)</span>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor={`${fieldId}-appId`} className="mb-2 block text-sm font-medium text-ink">
              App
            </label>
            <select id={`${fieldId}-appId`} name="appId" value={values.appId} onChange={handleChange} className={fieldClasses}>
              {APP_IDS.map((id) => (
                <option key={id} value={id}>
                  {APP_LABELS[id]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${fieldId}-source`} className="mb-2 block text-sm font-medium text-ink">
              Source
            </label>
            <select id={`${fieldId}-source`} name="source" value={values.source} onChange={handleChange} className={fieldClasses}>
              {LEAD_SOURCE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.sources.map((source) => (
                    <option key={source} value={source}>
                      {LEAD_SOURCE_LABELS[source]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${fieldId}-status`} className="mb-2 block text-sm font-medium text-ink">
              Status
            </label>
            <select
              id={`${fieldId}-status`}
              name="status"
              value={values.status}
              onChange={handleChange}
              className={cn(fieldClasses, 'capitalize')}
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isOtherSource ? (
          <div>
            <label htmlFor={`${fieldId}-sourceDetail`} className="mb-2 block text-sm font-medium text-ink">
              Source details
            </label>
            <input
              id={`${fieldId}-sourceDetail`}
              name="sourceDetail"
              value={values.sourceDetail}
              onChange={handleChange}
              placeholder="e.g. Referral from a partner, trade show, cold call"
              className={cn(fieldClasses, errors.sourceDetail && 'border-danger')}
            />
            {errors.sourceDetail ? <p className="mt-1.5 text-sm text-danger">{errors.sourceDetail}</p> : null}
          </div>
        ) : null}

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
            {values.assigneeId && !admins.some((admin) => admin.uid === values.assigneeId) ? (
              <option value={values.assigneeId}>{lead?.assigneeName.trim() || 'Assigned'}</option>
            ) : null}
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
            <option value="">
              {lead?.followUpAt ? `Keep scheduled · ${lead.followUpAt}` : 'No follow-up scheduled'}
            </option>
            {REACH_OUT_PRESETS.map((preset) => (
              <option key={preset.days} value={String(preset.days)}>
                {presetOptionLabel(preset.days)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${fieldId}-serviceType`} className="mb-2 block text-sm font-medium text-ink">
            Industry <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id={`${fieldId}-serviceType`}
            name="serviceType"
            value={values.serviceType}
            onChange={handleChange}
            placeholder="e.g. dental, startup, restaurant"
            className={fieldClasses}
          />
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

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="cta" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Add lead'}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}
