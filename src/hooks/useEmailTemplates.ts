import { useCallback, useEffect, useState } from 'react';

import type { EmailTemplate } from '@/data/emailTemplates';
import {
  createEmailTemplate,
  deleteEmailTemplate,
  fetchEmailTemplates,
  resetEmailTemplatesToDefaults,
  updateEmailTemplate,
  type EmailTemplateInput,
  type StoredEmailTemplate,
} from '@/lib/emailTemplateStore';

interface UseEmailTemplatesResult {
  templates: StoredEmailTemplate[];
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
  createTemplate: (input: EmailTemplateInput) => Promise<StoredEmailTemplate>;
  updateTemplate: (templateId: string, input: EmailTemplateInput) => Promise<StoredEmailTemplate>;
  removeTemplate: (templateId: string) => Promise<void>;
  resetToDefaults: () => Promise<StoredEmailTemplate[]>;
}

export function useEmailTemplates(): UseEmailTemplatesResult {
  const [templates, setTemplates] = useState<StoredEmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextTemplates = await fetchEmailTemplates();
      setTemplates(nextTemplates);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load templates.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createTemplate = useCallback(async (input: EmailTemplateInput) => {
    const created = await createEmailTemplate(input);
    setTemplates((current) => [...current, created]);
    return created;
  }, []);

  const updateTemplate = useCallback(async (templateId: string, input: EmailTemplateInput) => {
    const updated = await updateEmailTemplate(templateId, input);
    setTemplates((current) => current.map((entry) => (entry.id === templateId ? updated : entry)));
    return updated;
  }, []);

  const removeTemplate = useCallback(async (templateId: string) => {
    await deleteEmailTemplate(templateId);
    setTemplates((current) => current.filter((entry) => entry.id !== templateId));
  }, []);

  const resetToDefaults = useCallback(async () => {
    const nextTemplates = await resetEmailTemplatesToDefaults();
    setTemplates(nextTemplates);
    return nextTemplates;
  }, []);

  return {
    templates,
    isLoading,
    error,
    reload,
    createTemplate,
    updateTemplate,
    removeTemplate,
    resetToDefaults,
  };
}

export function toEmailTemplates(stored: StoredEmailTemplate[]): EmailTemplate[] {
  return stored.map(({ id, label, subject, body }) => ({ id, label, subject, body }));
}
