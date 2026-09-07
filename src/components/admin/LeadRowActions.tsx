import { Pencil, StickyNote, Trash2 } from 'lucide-react';
import { useCallback, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { Lead } from '@/types/admin';

interface LeadRowActionsProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onNotes: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  labeled?: boolean;
}

interface ActionButtonProps {
  label: string;
  text?: string;
  onClick: () => void;
  danger?: boolean;
  labeled?: boolean;
  children: ReactNode;
}

function ActionButton({ label, text, onClick, danger = false, labeled = false, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'touch-manipulation transition',
        labeled
          ? 'flex h-11 min-w-0 items-center justify-center gap-1 rounded-xl border border-line bg-base px-1.5 text-xs font-medium sm:gap-1.5 sm:px-2'
          : 'grid size-9 place-items-center rounded-md lg:size-8',
        danger ? 'text-danger hover:bg-danger/10' : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
      )}
    >
      {children}
      {labeled ? <span className="truncate">{text ?? label}</span> : null}
    </button>
  );
}

export function LeadRowActions({ lead, onEdit, onNotes, onDelete, labeled = false }: LeadRowActionsProps) {
  const handleNotes = useCallback(() => {
    onNotes(lead);
  }, [lead, onNotes]);

  const handleEdit = useCallback(() => {
    onEdit(lead);
  }, [lead, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(lead);
  }, [lead, onDelete]);

  const noteCount = lead.notes.length;
  const notesLabel = noteCount === 0 ? 'Notes' : noteCount === 1 ? '1 note' : `${noteCount} notes`;

  return (
    <div className={labeled ? 'grid grid-cols-3 gap-2' : 'flex items-center gap-0.5'}>
      <ActionButton
        label={notesLabel}
        text="Notes"
        onClick={handleNotes}
        labeled={labeled}
      >
        <span className="relative">
          <StickyNote className="size-4" aria-hidden="true" />
          {noteCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 min-w-3.5 rounded-full bg-accent px-1 text-[10px] leading-4 font-semibold text-base">
              {noteCount}
            </span>
          ) : null}
        </span>
      </ActionButton>
      <ActionButton label="Edit" onClick={handleEdit} labeled={labeled}>
        <Pencil className="size-4" aria-hidden="true" />
      </ActionButton>
      <ActionButton label="Delete" onClick={handleDelete} labeled={labeled} danger>
        <Trash2 className="size-4" aria-hidden="true" />
      </ActionButton>
    </div>
  );
}
