import type { OperationsTask, TaskView } from '@/types/tasks';

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(task: OperationsTask): boolean {
  if (task.completed || !task.dueDate) {
    return false;
  }
  return task.dueDate < todayIsoDate();
}

export function isDueToday(task: OperationsTask): boolean {
  return !task.completed && task.dueDate === todayIsoDate();
}

export function filterTasksByView(tasks: OperationsTask[], view: TaskView): OperationsTask[] {
  const today = todayIsoDate();

  switch (view) {
    case 'today':
      return tasks.filter(
        (task) => !task.completed && task.dueDate && task.dueDate <= today,
      );
    case 'upcoming':
      return tasks.filter(
        (task) => !task.completed && task.dueDate && task.dueDate > today,
      );
    case 'completed':
      return tasks.filter((task) => task.completed);
    case 'inbox':
    default:
      return tasks.filter((task) => !task.completed);
  }
}

export function sortTasks(tasks: OperationsTask[]): OperationsTask[] {
  return [...tasks].sort((left, right) => {
    if (left.completed !== right.completed) {
      return left.completed ? 1 : -1;
    }

    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    if (left.dueDate && right.dueDate) {
      return left.dueDate.localeCompare(right.dueDate);
    }

    if (left.dueDate) {
      return -1;
    }

    if (right.dueDate) {
      return 1;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function countTasksForView(tasks: OperationsTask[], view: TaskView): number {
  return filterTasksByView(tasks, view).length;
}
