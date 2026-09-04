import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';

import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  updateSavedPropertyIds,
  updateUserName,
  waitForUserProfile,
  type SignUpInput,
} from '@/lib/auth';
import { auth } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types/rental';

interface AuthState {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  subscribeAuth: () => () => void;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (input: SignUpInput) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  toggleSavedProperty: (propertyId: string) => Promise<void>;
}

/**
 * Rental-app session. Firebase Auth is the source of truth; Firestore holds the
 * role. Always read with an atomic selector, e.g. `useAuthStore((s) => s.user)`.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,

  subscribeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, role: null, isLoading: false });
        return;
      }

      const profile = await waitForUserProfile(firebaseUser.uid);
      if (profile) {
        set({ user: profile, role: profile.role, isLoading: false });
        return;
      }

      // Signup writes the profile after createUser; avoid wiping a store
      // update that already landed for this uid.
      set((state) => {
        if (state.user?.uid === firebaseUser.uid) {
          return { isLoading: false };
        }

        return { user: null, role: null, isLoading: false };
      });
    });

    return unsubscribe;
  },

  signIn: async (email, password) => {
    const profile = await signInWithEmail(email, password);
    set({ user: profile, role: profile.role, isLoading: false });
    return profile;
  },

  signUp: async (input) => {
    const profile = await signUpWithEmail(input);
    set({ user: profile, role: profile.role, isLoading: false });
    return profile;
  },

  signOut: async () => {
    await signOutUser();
    set({ user: null, role: null, isLoading: false });
  },

  updateName: async (name) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('You need to be signed in.');
    }

    const nextName = name.trim();
    await updateUserName(user.uid, nextName);
    set({ user: { ...user, name: nextName } });
  },

  toggleSavedProperty: async (propertyId) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('You need to be signed in.');
    }

    const current = Array.isArray(user.profileData.savedPropertyIds)
      ? user.profileData.savedPropertyIds.filter((item): item is string => typeof item === 'string')
      : [];
    const savedPropertyIds = current.includes(propertyId)
      ? current.filter((id) => id !== propertyId)
      : [...current, propertyId];

    await updateSavedPropertyIds(user.uid, savedPropertyIds);
    set({
      user: {
        ...user,
        profileData: { ...user.profileData, savedPropertyIds },
      },
    });
  },
}));
