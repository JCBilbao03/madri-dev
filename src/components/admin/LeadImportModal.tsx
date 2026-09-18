import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { AdminDialog } from '@/components/admin/AdminDialog';
import { Button } from '@/components/ui/Button';
import {
  buildImportPreview,
  downloadLeadExcelTemplate,
  importLeadRows,
  isAcceptedExcelFile,
  LEAD_IMPORT_COLUMNS,
  parseLeadExcelFile,
  type ImportLeadPreviewRow,
} from '@/lib/leadImport';
import { showErrorAlert, showSuccessToast } from '@/lib/sweetAlert';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types/admin';

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (leads: Lead[]) => void;
}

export function LeadImportModal({ isOpen, onClose, onImported }: LeadImportModalProps) {
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ImportLeadPreviewRow[]>([]);
  const [formError, setFormError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const resetState = useCallback(() => {
    setFileName(null);
    setPreviewRows([]);
    setFormError('');
    setIsParsing(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resetState();
  }, [isOpen, resetState]);

  const readyCount = useMemo(
    () => previewRows.filter((row) => row.issue === null).length,
    [previewRows],
  );

  const issueCount = useMemo(
    () => previewRows.filter((row) => row.issue !== null).length,
    [previewRows],
  );

  const handlePickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearFile = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFormError('');

    if (!file) {
      return;
    }

    if (!isAcceptedExcelFile(file)) {
      setFormError('Upload an Excel file (.xlsx or .xls).');
      event.target.value = '';
      return;
    }

    setIsParsing(true);
    setFileName(file.name);

    try {
      const rows = await parseLeadExcelFile(file);
      const preview = buildImportPreview(rows);
      setPreviewRows(preview);

      if (preview.length === 0) {
        setFormError('No rows found. Use the template and include name and email columns.');
      }
    } catch (parseError) {
      setPreviewRows([]);
      setFormError(parseError instanceof Error ? parseError.message : 'Could not read that Excel file.');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError('');

      const rows = previewRows.filter((row) => row.issue === null);
      if (rows.length === 0) {
        setFormError('Upload a file with at least one valid row (name + email).');
        return;
      }

      setIsImporting(true);
      try {
        const result = await importLeadRows(rows);
        onImported(result.created);

        const skippedSummary =
          result.skipped.length > 0
            ? `Skipped ${result.skipped.length} duplicate or invalid row(s).`
            : undefined;

        showSuccessToast(
          `Imported ${result.created.length} lead${result.created.length === 1 ? '' : 's'}`,
          skippedSummary,
        );

        if (result.created.length > 0) {
          onClose();
        }
      } catch (importError) {
        showErrorAlert(
          'Import failed',
          importError instanceof Error ? importError.message : 'Could not import those leads.',
        );
      } finally {
        setIsImporting(false);
      }
    },
    [onClose, onImported, previewRows],
  );

  return (
    <AdminDialog
      isOpen={isOpen}
      title="Import leads from Excel"
      description="Upload a spreadsheet, review the preview, then import. Duplicate emails are skipped automatically."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-5">
        <div className="rounded-xl border border-line bg-surface-raised/60 p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-base text-accent-soft">
              <FileSpreadsheet className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-medium text-ink">Excel format</h3>
              <p className="mt-1 text-xs text-ink-muted">
                First row must be the header. Required columns: name, email.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-base">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-3 py-2 font-medium text-ink-muted">Column</th>
                  <th className="px-3 py-2 font-medium text-ink-muted">Required</th>
                  <th className="px-3 py-2 font-medium text-ink-muted">Description</th>
                  <th className="px-3 py-2 font-medium text-ink-muted">Example</th>
                </tr>
              </thead>
              <tbody>
                {LEAD_IMPORT_COLUMNS.map((column) => (
                  <tr key={column.key} className="border-b border-line/80 last:border-0">
                    <td className="px-3 py-2 font-mono text-ink">{column.label}</td>
                    <td className="px-3 py-2 text-ink-muted">{column.required ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2 text-ink-muted">{column.description}</td>
                    <td className="px-3 py-2 break-all text-ink-muted">{column.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <Button type="button" variant="secondary" size="sm" onClick={downloadLeadExcelTemplate}>
              <Download className="size-4" aria-hidden="true" />
              Download Excel template
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor={`${fieldId}-excel`} className="mb-2 block text-sm font-medium text-ink">
            Upload Excel file
          </label>
          <input
            ref={fileInputRef}
            id={`${fieldId}-excel`}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="sr-only"
          />

          {!fileName ? (
            <button
              type="button"
              onClick={handlePickFile}
              disabled={isParsing}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line',
                'bg-base px-4 py-8 text-center transition hover:border-accent/40 hover:bg-surface-raised/40',
              )}
            >
              <Upload className="size-5 text-accent-soft" aria-hidden="true" />
              <span className="text-sm font-medium text-ink">
                {isParsing ? 'Reading file…' : 'Choose .xlsx or .xls file'}
              </span>
              <span className="text-xs text-ink-muted">Click to browse from your computer</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-base px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{fileName}</p>
                <p className="text-xs text-ink-muted">
                  {isParsing
                    ? 'Parsing rows…'
                    : `${previewRows.length} row${previewRows.length === 1 ? '' : 's'} detected`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={handlePickFile} disabled={isParsing}>
                  Replace
                </Button>
                <button
                  type="button"
                  onClick={handleClearFile}
                  aria-label="Remove file"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink-muted transition hover:bg-surface-raised hover:text-ink"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {previewRows.length > 0 ? (
          <div className="rounded-xl border border-line bg-base/50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
              <p className="text-sm font-medium text-ink">Preview before import</p>
              <p className="text-xs text-ink-muted">
                {readyCount} ready
                {issueCount > 0 ? ` · ${issueCount} with issues` : ''}
              </p>
            </div>

            <div className="max-h-64 overflow-auto overscroll-contain [scrollbar-width:thin]">
              <table className="admin-data-table w-full min-w-[36rem] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-surface">
                    <th className="sticky top-0 z-10 bg-surface px-3 py-2 font-medium text-ink-muted">#</th>
                    <th className="sticky top-0 z-10 bg-surface px-3 py-2 font-medium text-ink-muted">Name</th>
                    <th className="sticky top-0 z-10 bg-surface px-3 py-2 font-medium text-ink-muted">Email</th>
                    <th className="sticky top-0 z-10 bg-surface px-3 py-2 font-medium text-ink-muted">Summary</th>
                    <th className="sticky top-0 z-10 bg-surface px-3 py-2 font-medium text-ink-muted">Industry</th>
                    <th className="sticky top-0 z-10 bg-surface px-3 py-2 font-medium text-ink-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={`${row.rowNumber}-${row.email}`} className="border-b border-line/80 last:border-0">
                      <td className="px-3 py-2 text-ink-muted">{row.rowNumber}</td>
                      <td className="max-w-[10rem] px-3 py-2 truncate text-ink">{row.name || '—'}</td>
                      <td className="max-w-[12rem] px-3 py-2 break-all text-ink-muted">{row.email || '—'}</td>
                      <td className="max-w-[14rem] px-3 py-2 truncate text-ink-muted">{row.summary || '—'}</td>
                      <td className="px-3 py-2 text-ink-muted">{row.industry || '—'}</td>
                      <td className="px-3 py-2">
                        {row.issue ? (
                          <span className="text-danger">{row.issue}</span>
                        ) : (
                          <span className="text-accent-soft">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Upload a file to preview rows before importing.</p>
        )}

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
          <Button
            type="submit"
            variant="cta"
            className="w-full sm:w-auto"
            disabled={isImporting || isParsing || readyCount === 0}
          >
            {isImporting ? 'Importing…' : `Import ${readyCount > 0 ? readyCount : ''} lead${readyCount === 1 ? '' : 's'}`}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}
