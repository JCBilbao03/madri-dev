import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';

import { AdminDialog } from '@/components/admin/AdminDialog';
import { Button } from '@/components/ui/Button';
import { formatLeadDate, MAX_LEAD_NOTES, MAX_NOTE_TEXT, type Lead } from '@/types/admin';

interface LeadNotesModalProps {
  lead: Lead | null;
  onClose: () => void;
  onAddNote: (lead: Lead, text: string) => Promise<void>;
}

function formatNoteTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function LeadNotesModal({ lead, onClose, onAddNote }: LeadNotesModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isOpen = lead !== null;
  const atLimit = (lead?.notes.length ?? 0) >= MAX_LEAD_NOTES;

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!lead) {
        return;
      }

      if (!text.trim()) {
        setError('Write a note before saving.');
        return;
      }

      setIsSaving(true);
      setError('');
      try {
        await onAddNote(lead, text);
        setText('');
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Could not save that note.');
      } finally {
        setIsSaving(false);
      }
    },
    [lead, onAddNote, text],
  );

  const notes = lead ? [...lead.notes].sort((left, right) => right.createdAt.localeCompare(left.createdAt)) : [];

  return (
    <AdminDialog
      isOpen={isOpen}
      title={lead ? `Notes · ${lead.name}` : 'Notes'}
      description={lead ? `Follow-up notes for this ${formatLeadDate(lead.createdAt)} lead.` : undefined}
      onClose={onClose}
    >
      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-base p-4 text-sm text-ink-muted">
          No notes yet.
        </p>
      ) : (
        <ul className="max-h-48 space-y-3 overflow-y-auto sm:max-h-64">
          {notes.map((note) => (
            <li key={note.id} className="rounded-xl border border-line bg-base px-4 py-3">
              <p className="text-sm text-ink">{note.text}</p>
              <p className="mt-2 text-xs text-ink-muted">
                {note.authorName} · {formatNoteTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-5 w-full min-w-0">
        <label htmlFor="lead-note" className="mb-2 block text-sm font-medium text-ink">
          Add a note
        </label>
        <textarea
          id="lead-note"
          value={text}
          onChange={handleChange}
          rows={3}
          maxLength={MAX_NOTE_TEXT}
          disabled={atLimit}
          placeholder={atLimit ? 'This lead already has the maximum number of notes.' : 'What did you hear back?'}
          className="w-full rounded-xl border border-line bg-base px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none disabled:opacity-60"
        />
        {error ? <p className="mt-1.5 text-sm text-danger">{error}</p> : null}
        <div className="mt-3 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={isSaving || atLimit}>
            {isSaving ? 'Saving…' : 'Add note'}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}
