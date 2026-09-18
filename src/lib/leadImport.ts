import * as XLSX from 'xlsx';

import { createLead, findLeadByEmail } from '@/lib/leads';
import type { Lead, NewLeadInput } from '@/types/admin';

export interface ImportLeadRow {
  name: string;
  email: string;
  summary: string;
  industry: string;
}

export interface LeadImportColumn {
  key: keyof ImportLeadRow;
  label: string;
  required: boolean;
  description: string;
  example: string;
}

export const LEAD_IMPORT_COLUMNS: LeadImportColumn[] = [
  {
    key: 'name',
    label: 'name',
    required: true,
    description: 'Contact or company name',
    example: 'Smile Dental',
  },
  {
    key: 'email',
    label: 'email',
    required: true,
    description: 'Valid email address',
    example: 'hello@smiledental.com',
  },
  {
    key: 'summary',
    label: 'summary',
    required: false,
    description: 'Short note about the prospect',
    example: 'Clinic in Cebu — no website yet',
  },
  {
    key: 'industry',
    label: 'industry',
    required: false,
    description: 'Segment tag for filtering (e.g. dental, startup)',
    example: 'dental',
  },
];

export interface ImportLeadPreviewRow extends ImportLeadRow {
  rowNumber: number;
  issue: string | null;
}

export interface LeadImportResult {
  created: Lead[];
  skipped: Array<{ row: number; email: string; reason: string }>;
}

const ACCEPTED_EXCEL_EXTENSIONS = ['.xlsx', '.xls'] as const;

function clipField(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function cellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase();
}

/** Maps a sheet grid to lead rows using name, email, summary, industry columns. */
export function parseLeadSheetRows(rows: unknown[][]): ImportLeadRow[] {
  if (rows.length === 0) {
    return [];
  }

  const header = (rows[0] ?? []).map((cell) => normalizeHeader(cellValue(cell)));
  const hasHeader = header.includes('name') || header.includes('email');
  const startIndex = hasHeader ? 1 : 0;

  const nameIndex = header.indexOf('name');
  const emailIndex = header.indexOf('email');
  const summaryIndex = header.indexOf('summary');
  const industryIndex = header.indexOf('industry');

  const parsed: ImportLeadRow[] = [];

  for (let index = startIndex; index < rows.length; index += 1) {
    const cells = rows[index] ?? [];
    const values = cells.map(cellValue);

    if (values.every((value) => !value)) {
      continue;
    }

    const name = nameIndex >= 0 ? values[nameIndex] ?? '' : values[0] ?? '';
    const email = emailIndex >= 0 ? values[emailIndex] ?? '' : values[1] ?? '';
    const summary = summaryIndex >= 0 ? values[summaryIndex] ?? '' : values[2] ?? '';
    const industry = industryIndex >= 0 ? values[industryIndex] ?? '' : values[3] ?? '';

    parsed.push({
      name: name.trim(),
      email: email.trim(),
      summary: summary.trim(),
      industry: industry.trim(),
    });
  }

  return parsed;
}

export function validateImportRow(row: ImportLeadRow): string | null {
  if (!row.name.trim()) {
    return 'Missing name';
  }

  if (!row.email.trim()) {
    return 'Missing email';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email.trim())) {
    return 'Invalid email';
  }

  return null;
}

export function buildImportPreview(rows: ImportLeadRow[]): ImportLeadPreviewRow[] {
  return rows.map((row, index) => ({
    ...row,
    rowNumber: index + 1,
    issue: validateImportRow(row),
  }));
}

export function isAcceptedExcelFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return ACCEPTED_EXCEL_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

export async function parseLeadExcelFile(file: File): Promise<ImportLeadRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return [];
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  return parseLeadSheetRows(rows);
}

export function downloadLeadExcelTemplate(): void {
  const headers = LEAD_IMPORT_COLUMNS.map((column) => column.label);
  const examples = LEAD_IMPORT_COLUMNS.map((column) => column.example);
  const sample = ['Bright Labs', 'team@brightlabs.io', 'SaaS team needs marketing site', 'startup'];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, examples, sample]);
  worksheet['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 36 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, 'madribuild-leads-template.xlsx');
}

function rowToLeadInput(row: ImportLeadRow): NewLeadInput | null {
  if (validateImportRow(row)) {
    return null;
  }

  const summary =
    row.summary.trim().length >= 8
      ? row.summary.trim()
      : `Imported prospect${row.industry ? ` · ${row.industry}` : ''}.`;

  return {
    appId: 'marketing',
    source: 'email-outreach',
    name: clipField(row.name, 80),
    email: clipField(row.email, 120),
    summary: clipField(summary, 400),
    status: 'new',
    metadata: row.industry.trim() ? { serviceType: clipField(row.industry, 80) } : {},
  };
}

export async function importLeadRows(rows: ImportLeadRow[]): Promise<LeadImportResult> {
  const created: Lead[] = [];
  const skipped: LeadImportResult['skipped'] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row) {
      continue;
    }

    const input = rowToLeadInput(row);

    if (!input) {
      skipped.push({
        row: index + 1,
        email: row.email || '—',
        reason: validateImportRow(row) ?? 'Missing or invalid name/email.',
      });
      continue;
    }

    const existing = await findLeadByEmail(input.email);
    if (existing) {
      skipped.push({
        row: index + 1,
        email: input.email,
        reason: 'Lead with this email already exists.',
      });
      continue;
    }

    const lead = await createLead(input);
    created.push(lead);
  }

  return { created, skipped };
}
