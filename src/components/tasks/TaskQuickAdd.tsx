import { Plus } from 'lucide-react';
import { useCallback, useState, type FormEvent } from 'react';

import { cn } from '@/lib/utils';
import type { TaskPriority, TaskProject } from '@/types/tasks';
import { TASK_PROJECT_LABELS } from '@/types/tasks';

interface TaskQuickAddProps {
  defaultDueDate?: string;
  defaultProject?: TaskProject;
  isSaving?: boolean;
  onAdd: (input: {
    title: string;
    dueDate?: string;
    priority?: TaskPriority;
    project?: TaskProject;
  }) => Promise<void>;
}

export function TaskQuickAdd({
  defaultDueDate = '',
  defaultProject = 'inbox',
  isSaving = false,
  onAdd,
}: TaskQuickAddProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(4);
  const [project, setProject] = useState<TaskProject>(defaultProject);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) {
        return;
      }

      await onAdd({
        title: trimmed,
        dueDate,
        priority,
        project,
      });

      setTitle('');
      setPriority(4);
      setDueDate(defaultDueDate);
      setProject(defaultProject);
    },
    [defaultDueDate, defaultProject, dueDate, onAdd, priority, project, title],
  );

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="inventory-panel space-y-3 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Plus className="mt-3 size-4 shrink-0 text-[color:var(--inv-scan)]" aria-hidden="true" />
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task…"
          disabled={isSaving}
          className="inventory-input flex-1 border-transparent bg-transparent px-0 focus:border-line focus:bg-base/80 focus:px-3"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-ink-muted">
          <span className="shrink-0 font-display tracking-[0.12em] uppercase">Due</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={isSaving}
            className="inventory-input h-10 min-w-0 flex-1 text-sm"
          />
        </label>

        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-ink-muted">
          <span className="shrink-0 font-display tracking-[0.12em] uppercase">Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(Number(event.target.value) as TaskPriority)}
            disabled={isSaving}
            className="inventory-input h-10 min-w-0 flex-1 text-sm"
          >
            <option value={1}>P1 — Urgent</option>
            <option value={2}>P2 — High</option>
            <option value={3}>P3 — Medium</option>
            <option value={4}>P4 — Normal</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-ink-muted">
          <span className="shrink-0 font-display tracking-[0.12em] uppercase">Project</span>
          <select
            value={project}
            onChange={(event) => setProject(event.target.value as TaskProject)}
            disabled={isSaving}
            className="inventory-input h-10 min-w-0 flex-1 text-sm"
          >
            {(Object.keys(TASK_PROJECT_LABELS) as TaskProject[]).map((key) => (
              <option key={key} value={key}>
                {TASK_PROJECT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isSaving || !title.trim()}
          className={cn(
            'inline-flex min-h-10 items-center justify-center rounded-md border px-4 font-display text-[11px] tracking-[0.14em] uppercase transition-colors',
            'border-[color:var(--inv-scan)]/45 bg-[color:var(--inv-scan)]/12 text-[color:var(--inv-scan)]',
            'hover:bg-[color:var(--inv-scan)]/20 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          Add task
        </button>
      </div>
    </form>
  );
}
