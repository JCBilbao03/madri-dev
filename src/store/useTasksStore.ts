import { create } from 'zustand';

import {
  createTask,
  deleteTask,
  fetchTasks,
  patchTask,
} from '@/lib/tasksData';
import type {
  OperationsTask,
  OperationsTaskInput,
  TaskPriority,
  TaskProject,
} from '@/types/tasks';

function formatTaskError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  if (/permission|insufficient/i.test(message)) {
    return 'Could not reach Firestore. Deploy the latest Firebase rules and refresh.';
  }
  return message;
}

interface TasksState {
  tasks: OperationsTask[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  hydrate: () => Promise<void>;
  addTask: (input: OperationsTaskInput) => Promise<OperationsTask>;
  toggleComplete: (taskId: string) => Promise<OperationsTask | null>;
  setPriority: (taskId: string, priority: TaskPriority) => Promise<OperationsTask | null>;
  setDueDate: (taskId: string, dueDate: string) => Promise<OperationsTask | null>;
  setProject: (taskId: string, project: TaskProject) => Promise<OperationsTask | null>;
  updateTitle: (taskId: string, title: string) => Promise<OperationsTask | null>;
  removeTask: (taskId: string) => Promise<void>;
  getTaskById: (taskId: string) => OperationsTask | undefined;
}

export const useTasksStore = create<TasksState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  isSaving: false,
  error: '',

  hydrate: async () => {
    set({ isLoading: true, error: '' });
    try {
      const tasks = await fetchTasks();
      set({ tasks, isLoading: false });
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isLoading: false });
    }
  },

  addTask: async (input) => {
    set({ isSaving: true, error: '' });
    try {
      const task = await createTask(input);
      set((state) => ({
        tasks: [task, ...state.tasks],
        isSaving: false,
      }));
      return task;
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isSaving: false });
      throw error;
    }
  },

  toggleComplete: async (taskId) => {
    const existing = get().tasks.find((task) => task.id === taskId);
    if (!existing) {
      return null;
    }

    set({ isSaving: true, error: '' });
    try {
      const task = await patchTask(taskId, existing, { completed: !existing.completed });
      set((state) => ({
        tasks: state.tasks.map((entry) => (entry.id === taskId ? task : entry)),
        isSaving: false,
      }));
      return task;
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isSaving: false });
      return null;
    }
  },

  setPriority: async (taskId, priority) => {
    const existing = get().tasks.find((task) => task.id === taskId);
    if (!existing) {
      return null;
    }

    set({ isSaving: true, error: '' });
    try {
      const task = await patchTask(taskId, existing, { priority });
      set((state) => ({
        tasks: state.tasks.map((entry) => (entry.id === taskId ? task : entry)),
        isSaving: false,
      }));
      return task;
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isSaving: false });
      return null;
    }
  },

  setDueDate: async (taskId, dueDate) => {
    const existing = get().tasks.find((task) => task.id === taskId);
    if (!existing) {
      return null;
    }

    set({ isSaving: true, error: '' });
    try {
      const task = await patchTask(taskId, existing, { dueDate });
      set((state) => ({
        tasks: state.tasks.map((entry) => (entry.id === taskId ? task : entry)),
        isSaving: false,
      }));
      return task;
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isSaving: false });
      return null;
    }
  },

  setProject: async (taskId, project) => {
    const existing = get().tasks.find((task) => task.id === taskId);
    if (!existing) {
      return null;
    }

    set({ isSaving: true, error: '' });
    try {
      const task = await patchTask(taskId, existing, { project });
      set((state) => ({
        tasks: state.tasks.map((entry) => (entry.id === taskId ? task : entry)),
        isSaving: false,
      }));
      return task;
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isSaving: false });
      return null;
    }
  },

  updateTitle: async (taskId, title) => {
    const existing = get().tasks.find((task) => task.id === taskId);
    if (!existing || !title.trim()) {
      return null;
    }

    set({ isSaving: true, error: '' });
    try {
      const task = await patchTask(taskId, existing, { title: title.trim() });
      set((state) => ({
        tasks: state.tasks.map((entry) => (entry.id === taskId ? task : entry)),
        isSaving: false,
      }));
      return task;
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isSaving: false });
      return null;
    }
  },

  removeTask: async (taskId) => {
    set({ isSaving: true, error: '' });
    try {
      await deleteTask(taskId);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
        isSaving: false,
      }));
    } catch (error: unknown) {
      set({ error: formatTaskError(error), isSaving: false });
    }
  },

  getTaskById: (taskId) => get().tasks.find((task) => task.id === taskId),
}));
