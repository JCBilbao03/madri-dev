export type TaskPriority = 1 | 2 | 3 | 4;

export type TaskProject = 'inbox' | 'barcodes' | 'asn' | 'claims' | 'refunds';

export type TaskView = 'inbox' | 'today' | 'upcoming' | 'completed';

export interface OperationsTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
  project: TaskProject;
  createdAt: string;
  updatedAt: string;
}

export interface OperationsTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  project?: TaskProject;
}

export const TASK_PROJECT_LABELS: Record<TaskProject, string> = {
  inbox: 'Inbox',
  barcodes: 'Barcodes',
  asn: 'ASN',
  claims: 'Claims',
  refunds: 'Refunds',
};

export const TASK_VIEW_LABELS: Record<TaskView, string> = {
  inbox: 'Inbox',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
};

export function asOperationsTask(value: unknown): OperationsTask | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.id !== 'string' ||
    typeof item.title !== 'string' ||
    typeof item.description !== 'string' ||
    typeof item.completed !== 'boolean' ||
    typeof item.priority !== 'number' ||
    ![1, 2, 3, 4].includes(item.priority) ||
    typeof item.dueDate !== 'string' ||
    typeof item.project !== 'string' ||
    !['inbox', 'barcodes', 'asn', 'claims', 'refunds'].includes(item.project) ||
    typeof item.createdAt !== 'string' ||
    typeof item.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    completed: item.completed,
    priority: item.priority as TaskPriority,
    dueDate: item.dueDate,
    project: item.project as TaskProject,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
