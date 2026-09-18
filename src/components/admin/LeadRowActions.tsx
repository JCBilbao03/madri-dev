import { Mail, Pencil, StickyNote, Trash2 } from 'lucide-react';
import { useCallback, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { buildLeadEmailPath } from '@/lib/leadOutreach';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types/admin';

interface LeadRowActionsProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onNotes: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  labeled?: boolean;
}

function stopRowActivation(event: ReactMouseEvent) {
  event.stopPropagation();
}

interface IconActionProps {
  label: string;
  onClick?: () => void;
  to?: string;
  danger?: boolean;
  children: ReactNode;
}

function IconAction({ label, onClick, to, danger = false, children }: IconActionProps) {
  const className = cn(
    'inline-flex size-8 items-center justify-center rounded-lg transition',
    danger
      ? 'text-danger hover:bg-danger/10'
      : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label={label}
        title={label}
        onClick={stopRowActivation}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        stopRowActivation(event);
        onClick?.();
      }}
      className={className}
    >
      {children}
    </button>
  );
}

export function LeadRowActions({ lead, onEdit, onNotes, onDelete, labeled = false }: LeadRowActionsProps) {
  const noteCount = lead.notes.length;
  const notesLabel = noteCount === 0 ? 'Notes' : noteCount === 1 ? '1 note' : `${noteCount} notes`;
  const emailPath = lead.email.trim() ? buildLeadEmailPath(lead) : null;

  const handleEdit = useCallback(() => {
    onEdit(lead);
  }, [lead, onEdit]);

  const handleNotes = useCallback(() => {
    onNotes(lead);
  }, [lead, onNotes]);

  const handleDelete = useCallback(() => {
    onDelete(lead);
  }, [lead, onDelete]);

  if (labeled) {
    return (
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        data-lead-row-actions
        onClick={stopRowActivation}
        onPointerDown={stopRowActivation}
      >
        {emailPath ? (
          <Button to={emailPath} variant="secondary" size="sm" className="h-11 min-w-0 px-2 text-xs">
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Email</span>
          </Button>
        ) : null}
        <button
          type="button"
          onClick={handleNotes}
          className="flex h-11 min-w-0 items-center justify-center gap-1 rounded-xl border border-line bg-base px-1.5 text-xs font-medium text-ink-muted sm:gap-1.5 sm:px-2"
        >
          <StickyNote className="size-4" aria-hidden="true" />
          <span className="truncate">{notesLabel}</span>
        </button>
        <button
          type="button"
          onClick={handleEdit}
          className="flex h-11 min-w-0 items-center justify-center gap-1 rounded-xl border border-line bg-base px-1.5 text-xs font-medium text-ink-muted sm:gap-1.5 sm:px-2"
        >
          <Pencil className="size-4" aria-hidden="true" />
          <span className="truncate">Edit</span>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex h-11 min-w-0 items-center justify-center gap-1 rounded-xl border border-line bg-base px-1.5 text-xs font-medium text-danger sm:gap-1.5 sm:px-2"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          <span className="truncate">Delete</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-0.5"
      data-lead-row-actions
      onClick={stopRowActivation}
      onPointerDown={stopRowActivation}
    >
      {emailPath ? (
        <IconAction label={`Email ${lead.name}`} to={emailPath}>
          <Mail className="size-4" aria-hidden="true" />
        </IconAction>
      ) : null}
      <IconAction label={notesLabel} onClick={handleNotes}>
        <StickyNote className="size-4" aria-hidden="true" />
      </IconAction>
      <IconAction label={`Edit ${lead.name}`} onClick={handleEdit}>
        <Pencil className="size-4" aria-hidden="true" />
      </IconAction>
      <IconAction label={`Delete ${lead.name}`} onClick={handleDelete} danger>
        <Trash2 className="size-4" aria-hidden="true" />
      </IconAction>
    </div>
  );
}
