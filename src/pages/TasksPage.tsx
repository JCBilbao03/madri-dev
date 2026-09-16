import { CalendarDays, CheckCircle2, Inbox, Plus, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { TaskAddModal } from '@/components/tasks/TaskAddModal';
import { TaskItem } from '@/components/tasks/TaskItem';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { countTasksForView, filterTasksByView, sortTasks, todayIsoDate } from '@/lib/taskFilters';
import { cn } from '@/lib/utils';
import { useTasksStore } from '@/store/useTasksStore';
import {
  TASK_VIEW_LABELS,
  type TaskPriority,
  type TaskProject,
  type TaskView,
} from '@/types/tasks';

const VIEW_OPTIONS: { id: TaskView; icon: typeof Inbox; description: string }[] = [
  { id: 'inbox', icon: Inbox, description: 'All open tasks' },
  { id: 'today', icon: Sun, description: 'Due today and overdue' },
  { id: 'upcoming', icon: CalendarDays, description: 'Scheduled ahead' },
  { id: 'completed', icon: CheckCircle2, description: 'Finished work' },
];

function parseView(value: string | null): TaskView {
  if (value === 'today' || value === 'upcoming' || value === 'completed') {
    return value;
  }
  return 'inbox';
}

export function TasksPage() {
  const [searchParams] = useSearchParams();
  const view = parseView(searchParams.get('view'));
  const [isAddOpen, setIsAddOpen] = useState(false);

  const tasks = useTasksStore((state) => state.tasks);
  const isLoading = useTasksStore((state) => state.isLoading);
  const isSaving = useTasksStore((state) => state.isSaving);
  const error = useTasksStore((state) => state.error);
  const hydrate = useTasksStore((state) => state.hydrate);
  const addTask = useTasksStore((state) => state.addTask);
  const toggleComplete = useTasksStore((state) => state.toggleComplete);
  const removeTask = useTasksStore((state) => state.removeTask);
  const setPriority = useTasksStore((state) => state.setPriority);
  const setProject = useTasksStore((state) => state.setProject);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const viewCounts = useMemo(
    () =>
      VIEW_OPTIONS.reduce(
        (counts, option) => {
          counts[option.id] = countTasksForView(tasks, option.id);
          return counts;
        },
        {} as Record<TaskView, number>,
      ),
    [tasks],
  );

  const visibleTasks = useMemo(
    () => sortTasks(filterTasksByView(tasks, view)),
    [tasks, view],
  );

  const defaultDueDate = view === 'today' ? todayIsoDate() : '';

  const handleOpenAdd = useCallback(() => {
    useTasksStore.setState({ error: '' });
    setIsAddOpen(true);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setIsAddOpen(false);
  }, []);

  const handleAddTask = useCallback(
    async (input: {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: TaskPriority;
      project?: TaskProject;
    }) => {
      try {
        await addTask(input);
        setIsAddOpen(false);
      } catch {
        // Error is stored in the tasks store and shown in the modal.
      }
    },
    [addTask],
  );

  const handleToggle = useCallback(
    (taskId: string) => {
      void toggleComplete(taskId);
    },
    [toggleComplete],
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      void removeTask(taskId);
    },
    [removeTask],
  );

  const handlePriorityChange = useCallback(
    (taskId: string, priority: TaskPriority) => {
      void setPriority(taskId, priority);
    },
    [setPriority],
  );

  const handleProjectChange = useCallback(
    (taskId: string, project: TaskProject) => {
      void setProject(taskId, project);
    },
    [setProject],
  );

  const canAddTasks = view !== 'completed';

  return (
    <InventoryPage className="min-h-full">
      <header className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
            Operations tasks
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {TASK_VIEW_LABELS[view]}
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch lg:ml-auto">
          {canAddTasks ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenAdd}
              className="w-full shrink-0 sm:w-auto"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add task
            </Button>
          ) : null}
          <div className="w-full max-w-sm rounded-lg border border-line bg-surface-raised px-4 py-3 shadow-sm sm:px-5 sm:py-4 lg:text-right">
            <p className="font-display text-[10px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
              About this view
            </p>
            <p className="mt-2 font-sans text-base font-medium leading-relaxed text-ink">
              {VIEW_OPTIONS.find((option) => option.id === view)?.description}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <InventoryPanel className="h-fit p-2 sm:p-3">
          <nav aria-label="Task views" className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = view === option.id;

              return (
                <Link
                  key={option.id}
                  to={`/inventory-app/tasks?view=${option.id}`}
                  className={cn(
                    'flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[color:var(--inv-scan)]/10 font-medium text-[color:var(--inv-scan)]'
                      : 'text-ink-muted hover:bg-surface/80 hover:text-ink',
                  )}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {TASK_VIEW_LABELS[option.id]}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] tabular-nums',
                      isActive ? 'bg-[color:var(--inv-scan)]/15' : 'bg-surface text-ink-muted',
                    )}
                  >
                    {viewCounts[option.id]}
                  </span>
                </Link>
              );
            })}
          </nav>
        </InventoryPanel>

        <div className="min-w-0 space-y-4">
          {canAddTasks ? (
            <button
              type="button"
              onClick={handleOpenAdd}
              className={cn(
                'inventory-panel flex w-full min-h-12 items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5',
                'text-ink-muted hover:border-[color:var(--inv-scan)]/30 hover:bg-[color:var(--inv-scan)]/5 hover:text-ink',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--inv-scan)]/50',
              )}
            >
              <Plus className="size-4 shrink-0 text-[color:var(--inv-scan)]" aria-hidden="true" />
              <span className="text-sm">Add a task…</span>
            </button>
          ) : null}

          {isLoading ? (
            <InventoryLoadingState />
          ) : error && !isAddOpen ? (
            <p className="inventory-panel px-4 py-4 text-sm text-danger">{error}</p>
          ) : visibleTasks.length === 0 ? (
            <InventoryPanel className="px-5 py-10 text-center">
              <p className="font-display text-lg text-ink">No tasks here</p>
              <p className="mt-2 text-sm text-ink-muted">
                {view === 'completed'
                  ? 'Completed tasks will appear in this list.'
                  : 'Add your first task to track ops follow-ups.'}
              </p>
              {canAddTasks ? (
                <Button type="button" variant="primary" onClick={handleOpenAdd} className="mt-6">
                  <Plus className="size-4" aria-hidden="true" />
                  Add task
                </Button>
              ) : null}
            </InventoryPanel>
          ) : (
            <InventoryPanel className="overflow-hidden p-0">
              <ul className="divide-y divide-line/70">
                {visibleTasks.map((task) => (
                  <li key={task.id}>
                    <TaskItem
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onPriorityChange={handlePriorityChange}
                      onProjectChange={handleProjectChange}
                    />
                  </li>
                ))}
              </ul>
            </InventoryPanel>
          )}
        </div>
      </div>

      <TaskAddModal
        isOpen={isAddOpen}
        onClose={handleCloseAdd}
        defaultDueDate={defaultDueDate}
        isSaving={isSaving}
        error={isAddOpen ? error : ''}
        onAdd={handleAddTask}
      />
    </InventoryPage>
  );
}
