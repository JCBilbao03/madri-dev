import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { db, waitForFirestore } from '@/lib/firebase';
import {
  asOperationsTask,
  type OperationsTask,
  type OperationsTaskInput,
  type TaskPriority,
  type TaskProject,
} from '@/types/tasks';

function buildTaskDocument(
  id: string,
  input: OperationsTaskInput,
  existing?: OperationsTask,
  overrides?: Partial<OperationsTask>,
): OperationsTask {
  const now = new Date().toISOString();

  return {
    id,
    title: input.title.trim(),
    description: (input.description ?? existing?.description ?? '').trim(),
    completed: existing?.completed ?? false,
    priority: input.priority ?? existing?.priority ?? 4,
    dueDate: input.dueDate ?? existing?.dueDate ?? '',
    project: input.project ?? existing?.project ?? 'inbox',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...overrides,
  };
}

export function parseTaskDoc(id: string, data: Record<string, unknown>): OperationsTask | null {
  const normalized = {
    ...data,
    id: typeof data.id === 'string' ? data.id : id,
  };
  return asOperationsTask(normalized);
}

export async function fetchTasks(): Promise<OperationsTask[]> {
  await waitForFirestore();
  const snapshot = await getDocs(collection(db, 'operationsTasks'));
  return snapshot.docs
    .map((entry) => parseTaskDoc(entry.id, entry.data()))
    .filter((task): task is OperationsTask => task !== null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function fetchTask(taskId: string): Promise<OperationsTask | null> {
  await waitForFirestore();
  const snapshot = await getDoc(doc(db, 'operationsTasks', taskId));
  if (!snapshot.exists()) {
    return null;
  }
  return parseTaskDoc(snapshot.id, snapshot.data());
}

export async function createTask(input: OperationsTaskInput): Promise<OperationsTask> {
  await waitForFirestore();
  // UUID is 36 chars; rules allow id length 8–40 (`task-` + UUID would be 41).
  const id = crypto.randomUUID();
  const task = buildTaskDocument(id, input);
  await setDoc(doc(db, 'operationsTasks', id), task);
  return task;
}

export async function updateTask(
  taskId: string,
  input: OperationsTaskInput,
  existing: OperationsTask,
): Promise<OperationsTask> {
  await waitForFirestore();
  const task = buildTaskDocument(taskId, input, existing);
  await setDoc(doc(db, 'operationsTasks', taskId), task);
  return task;
}

export async function patchTask(
  taskId: string,
  existing: OperationsTask,
  patch: Partial<OperationsTask>,
): Promise<OperationsTask> {
  await waitForFirestore();
  const task = buildTaskDocument(
    taskId,
    {
      title: existing.title,
      description: existing.description,
      priority: existing.priority,
      dueDate: existing.dueDate,
      project: existing.project,
    },
    existing,
    patch,
  );
  await setDoc(doc(db, 'operationsTasks', taskId), task);
  return task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await waitForFirestore();
  await deleteDoc(doc(db, 'operationsTasks', taskId));
}

export function isValidTaskPriority(value: number): value is TaskPriority {
  return [1, 2, 3, 4].includes(value);
}

export function isValidTaskProject(value: string): value is TaskProject {
  return ['inbox', 'barcodes', 'asn', 'claims', 'refunds'].includes(value);
}
