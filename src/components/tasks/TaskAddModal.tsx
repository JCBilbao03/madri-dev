import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { InventoryDialog } from '@/components/inventory/InventoryDialog';
import { InventoryField } from '@/components/inventory/InventoryField';
import { TaskPriorityFlag } from '@/components/tasks/TaskPriorityFlag';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  TASK_PROJECT_LABELS,
  TASK_PRIORITY_LABELS,
  type TaskPriority,
  type TaskProject,
} from '@/types/tasks';

const PRIORITY_OPTIONS: TaskPriority[] = [1, 2, 3, 4];

const PROJECT_OPTIONS = Object.keys(TASK_PROJECT_LABELS) as TaskProject[];

interface TaskAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDueDate?: string;
  defaultProject?: TaskProject;
  isSaving?: boolean;
  error?: string;
  onAdd: (input: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    project?: TaskProject;
  }) => Promise<void>;
}

export function TaskAddModal({
  isOpen,
  onClose,
  defaultDueDate = '',
  defaultProject = 'inbox',
  isSaving = false,
  error = '',
  onAdd,
}: TaskAddModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(4);
  const [project, setProject] = useState<TaskProject>(defaultProject);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle('');
    setDescription('');
    setPriority(4);
    setProject(defaultProject);
    setDueDate(defaultDueDate);
  }, [defaultDueDate, defaultProject, isOpen]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const trimmed = title.trim();
      if (!trimmed || isSaving) {
        return;
      }

      await onAdd({
        title: trimmed,
        description: description.trim(),
        dueDate,
        priority,
        project,
      });
    },
    [description, dueDate, isSaving, onAdd, priority, project, title],
  );

  return (
    <InventoryDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add a task"
      description="Capture follow-ups for barcodes, ASNs, claims, or refunds."
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="space-y-6"
      >
        {error ? (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <InventoryField
          label="Title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          disabled={isSaving}
          autoFocus
          required
        />

        <label htmlFor="task-description" className="block space-y-2">
          <span className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">
            Description
            <span className="ml-1.5 font-sans normal-case tracking-normal text-ink-muted/70">(optional)</span>
          </span>
          <textarea
            id="task-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add context, links, or next steps…"
            disabled={isSaving}
            rows={3}
            className="inventory-input min-h-[5.5rem] resize-y py-2.5 text-base sm:text-sm"
          />
        </label>

        <InventoryField
          label="Due date"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={isSaving}
          hint="Leave blank for no due date."
        />

        <fieldset className="space-y-2.5">
          <legend className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">
            Priority
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORITY_OPTIONS.map((value) => {
              const selected = priority === value;

              return (
                <button
                  key={value}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setPriority(value)}
                  aria-pressed={selected}
                  className={cn(
                    'flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors',
                    selected
                      ? 'border-[color:var(--inv-scan)]/50 bg-[color:var(--inv-scan)]/12 text-[color:var(--inv-scan)]'
                      : 'border-line bg-surface text-ink-muted hover:border-line/80 hover:bg-surface-raised hover:text-ink',
                  )}
                >
                  <TaskPriorityFlag priority={value} />
                  {TASK_PRIORITY_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2.5">
          <legend className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">
            Project
          </legend>
          <div className="flex flex-wrap gap-2">
            {PROJECT_OPTIONS.map((key) => {
              const selected = project === key;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setProject(key)}
                  aria-pressed={selected}
                  className={cn(
                    'min-h-10 rounded-full border px-3.5 text-sm transition-colors',
                    selected
                      ? 'border-[color:var(--inv-scan)]/50 bg-[color:var(--inv-scan)]/12 font-medium text-[color:var(--inv-scan)]'
                      : 'border-line bg-surface text-ink-muted hover:border-line/80 hover:bg-surface-raised hover:text-ink',
                  )}
                >
                  {TASK_PROJECT_LABELS[key]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 border-t border-line/70 pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving || !title.trim()} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              'Add task'
            )}
          </Button>
        </div>
      </form>
    </InventoryDialog>
  );
}
