import { collection, getDocs } from 'firebase/firestore';

import { asUserProfile } from '@/lib/auth';
import { db } from '@/lib/firebase';
import {
  createLead,
  deleteLead,
  addLeadNote,
  fetchLeads,
  updateLead,
  updateLeadAssignee,
  updateLeadFollowUp,
  updateLeadStatus,
} from '@/lib/leads';
import type { UserProfile } from '@/types/rental';

export {
  fetchLeads,
  updateLeadStatus,
  updateLeadAssignee,
  updateLeadFollowUp,
  updateLead,
  deleteLead,
  addLeadNote,
  createLead,
};

export async function fetchAdmins(): Promise<UserProfile[]> {
  const users = await fetchUsers();
  return users.filter((user) => user.role === 'admin');
}

export async function fetchUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  const users = snapshot.docs
    .map((item) => asUserProfile(item.id, item.data()))
    .filter((item): item is UserProfile => item !== null);

  return users.sort((left, right) => left.name.localeCompare(right.name));
}
