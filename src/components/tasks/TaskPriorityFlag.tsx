import { Flag } from 'lucide-react';

import { cn } from '@/lib/utils';
import { TASK_PRIORITY_LABELS, type TaskPriority } from '@/types/tasks';

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  1: 'text-danger',
  2: 'text-accent-soft',
  3: 'text-[color:var(--inv-scan)]',
  4: 'text-ink-muted',
};

interface TaskPriorityFlagProps {
  priority: TaskPriority;
  className?: string;
}

export function TaskPriorityFlag({ priority, className }: TaskPriorityFlagProps) {
  return (
    <Flag
      className={cn('size-3.5 shrink-0 fill-current', PRIORITY_STYLES[priority], className)}
      aria-label={`Priority ${TASK_PRIORITY_LABELS[priority]}`}
    />
  );
}
