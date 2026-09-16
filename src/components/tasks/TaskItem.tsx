import { Calendar, Check, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

import { TaskPriorityFlag } from '@/components/tasks/TaskPriorityFlag';
import { isDueToday, isOverdue } from '@/lib/taskFilters';
import { cn } from '@/lib/utils';
import {
  TASK_PROJECT_LABELS,
  type OperationsTask,
  type TaskPriority,
  type TaskProject,
} from '@/types/tasks';

interface TaskItemProps {
  task: OperationsTask;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onProjectChange: (taskId: string, project: TaskProject) => void;
}

function formatDueLabel(dueDate: string): string {
  const date = new Date(`${dueDate}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onPriorityChange,
  onProjectChange,
}: TaskItemProps) {
  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);

  const handleToggle = useCallback(() => {
    onToggle(task.id);
  }, [onToggle, task.id]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [onDelete, task.id]);

  return (
    <div
      className={cn(
        'group flex items-start gap-3 border-b border-line/70 px-4 py-3 transition-colors last:border-b-0 hover:bg-surface/50 sm:px-5',
        task.completed && 'opacity-70',
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
        className={cn(
          'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--inv-scan)]/50',
          task.completed
            ? 'border-[color:var(--inv-scan)] bg-[color:var(--inv-scan)] text-base'
            : 'border-line hover:border-[color:var(--inv-scan)]/50',
        )}
      >
        {task.completed ? <Check className="size-3" strokeWidth={3} aria-hidden="true" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <TaskPriorityFlag priority={task.priority} />
          <p
            className={cn(
              'min-w-0 flex-1 text-sm text-ink',
              task.completed && 'text-ink-muted line-through',
            )}
          >
            {task.title}
          </p>
        </div>

        {task.description ? (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{task.description}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {task.dueDate ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                overdue && 'border-danger/40 bg-danger/10 text-danger',
                dueToday && !overdue && 'border-[color:var(--inv-scan)]/40 bg-[color:var(--inv-scan)]/10 text-[color:var(--inv-scan)]',
                !overdue && !dueToday && 'border-line bg-surface text-ink-muted',
              )}
            >
              <Calendar className="size-3" aria-hidden="true" />
              {overdue ? 'Overdue · ' : dueToday ? 'Today · ' : ''}
              {formatDueLabel(task.dueDate)}
            </span>
          ) : null}

          <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-[10px] tracking-wide text-ink-muted uppercase">
            {TASK_PROJECT_LABELS[task.project]}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <select
          value={task.priority}
          onChange={(event) => onPriorityChange(task.id, Number(event.target.value) as TaskPriority)}
          aria-label={`Priority for ${task.title}`}
          className="inventory-input h-9 w-[4.5rem] px-2 text-xs"
        >
          <option value={1}>P1</option>
          <option value={2}>P2</option>
          <option value={3}>P3</option>
          <option value={4}>P4</option>
        </select>

        <select
          value={task.project}
          onChange={(event) => onProjectChange(task.id, event.target.value as TaskProject)}
          aria-label={`Project for ${task.title}`}
          className="inventory-input hidden h-9 min-w-[5.5rem] px-2 text-xs sm:block"
        >
          {(Object.keys(TASK_PROJECT_LABELS) as TaskProject[]).map((key) => (
            <option key={key} value={key}>
              {TASK_PROJECT_LABELS[key]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${task.title}`}
          className="inline-flex size-9 items-center justify-center rounded-md border border-transparent text-ink-muted transition-colors hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
