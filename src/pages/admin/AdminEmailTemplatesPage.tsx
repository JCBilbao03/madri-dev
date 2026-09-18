import { FileText, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AdminPage } from '@/components/admin/AdminPage';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { EmailTemplateEditorModal } from '@/components/admin/email/EmailTemplateEditorModal';
import { Button } from '@/components/ui/Button';
import type { EmailTemplate } from '@/data/emailTemplates';
import { useAdminChrome } from '@/hooks/useAdminChrome';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { authErrorMessage } from '@/lib/auth';
import { confirmAction, confirmDelete, showErrorAlert, showSuccessToast } from '@/lib/sweetAlert';

export function AdminEmailTemplatesPage() {
  const {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    removeTemplate,
    resetToDefaults,
  } = useEmailTemplates();

  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return templates;
    }

    return templates.filter(
      (template) =>
        template.label.toLowerCase().includes(needle) ||
        template.subject.toLowerCase().includes(needle) ||
        template.body.toLowerCase().includes(needle),
    );
  }, [query, templates]);

  const openCreate = useCallback(() => {
    setEditingTemplate(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingTemplate(null);
  }, []);

  const handleSave = useCallback(
    async (input: { label: string; subject: string; body: string }) => {
      try {
        if (editingTemplate) {
          await updateTemplate(editingTemplate.id, input);
          showSuccessToast('Template updated', editingTemplate.label);
          return;
        }

        const created = await createTemplate(input);
        showSuccessToast('Template created', created.label);
      } catch (saveError) {
        throw new Error(authErrorMessage(saveError));
      }
    },
    [createTemplate, editingTemplate, updateTemplate],
  );

  const handleDelete = useCallback(
    async (template: EmailTemplate) => {
      const confirmed = await confirmDelete({
        title: 'Delete template?',
        text: `Delete "${template.label}"? This cannot be undone.`,
      });

      if (!confirmed) {
        return;
      }

      try {
        await removeTemplate(template.id);
        showSuccessToast('Template deleted', template.label);
      } catch (deleteError) {
        showErrorAlert('Could not delete template', authErrorMessage(deleteError));
      }
    },
    [removeTemplate],
  );

  const handleResetDefaults = useCallback(async () => {
    const confirmed = await confirmAction({
      title: 'Reset templates?',
      text: 'Replace all templates with the built-in defaults? Custom templates will be removed.',
      confirmText: 'Reset to defaults',
      icon: 'warning',
    });

    if (!confirmed) {
      return;
    }

    try {
      await resetToDefaults();
      showSuccessToast('Templates reset', 'Built-in defaults were restored.');
    } catch (resetError) {
      showErrorAlert('Could not reset templates', authErrorMessage(resetError));
    }
  }, [resetToDefaults]);

  const toolbar = useMemo(
    () => (
      <AdminPageToolbar>
        <Button variant="secondary" size="sm" onClick={() => void handleResetDefaults()} className="min-h-9">
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset defaults
        </Button>
        <Button size="sm" onClick={openCreate} className="min-h-9">
          <Plus className="size-4" aria-hidden="true" />
          New template
        </Button>
      </AdminPageToolbar>
    ),
    [handleResetDefaults, openCreate],
  );

  useAdminChrome(
    () => ({
      breadcrumbs: [{ label: 'Email' }, { label: 'Templates' }],
      toolbar,
      showSearch: true,
      searchQuery: query,
      searchPlaceholder: 'Search templates…',
      onSearchChange: setQuery,
    }),
    [query, toolbar],
  );

  return (
    <AdminPage>
      <div className="rounded-2xl border border-line/80 bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">Outreach templates</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Edit the templates available when composing email from the inbox or leads table.
            </p>
          </div>
          <Button to="/admin/email" variant="secondary" size="sm" className="min-h-9 shrink-0">
            Back to inbox
          </Button>
        </div>

        {isLoading ? (
          <p className="px-5 py-8 text-sm text-ink-muted">Loading templates…</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <FileText className="size-8 text-ink-muted" aria-hidden="true" />
            <p className="text-sm text-ink-muted">
              {query.trim() ? 'No templates match your search.' : 'No templates yet.'}
            </p>
            {!query.trim() ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" aria-hidden="true" />
                Create template
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="admin-table-scroll overflow-x-auto">
            <table className="admin-data-table w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-raised/50">
                  <th className="px-4 py-3 font-medium text-ink-muted sm:px-5">Name</th>
                  <th className="px-4 py-3 font-medium text-ink-muted sm:px-5">Subject</th>
                  <th className="px-4 py-3 font-medium text-ink-muted sm:px-5">Preview</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-muted sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((template) => (
                  <tr key={template.id} className="border-b border-line/80 last:border-0">
                    <td className="px-4 py-3 font-medium text-ink sm:px-5">{template.label}</td>
                    <td className="max-w-[14rem] px-4 py-3 truncate text-ink-muted sm:px-5">{template.subject}</td>
                    <td className="max-w-[20rem] px-4 py-3 truncate text-ink-muted sm:px-5">
                      {template.body.replace(/\s+/g, ' ').trim()}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${template.label}`}
                          title={`Edit ${template.label}`}
                          onClick={() => openEdit(template)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-raised hover:text-ink"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${template.label}`}
                          title={`Delete ${template.label}`}
                          onClick={() => void handleDelete(template)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-danger transition hover:bg-danger/10"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        Placeholder tip: use{' '}
        <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[11px]">{'{{company}}'}</code>{' '}
        in subject or body.{' '}
        <Link to="/admin/email" className="text-accent-soft underline-offset-2 hover:underline">
          Open inbox
        </Link>{' '}
        to test templates when composing.
      </p>

      <EmailTemplateEditorModal
        isOpen={editorOpen}
        template={editingTemplate}
        onClose={closeEditor}
        onSave={handleSave}
      />
    </AdminPage>
  );
}
