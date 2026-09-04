import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { isUserRole, type UserProfile, type UserRole } from '@/types/rental';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

function asUserProfile(uid: string, data: Record<string, unknown>): UserProfile | null {
  if (
    data.uid !== uid ||
    !isUserRole(data.role) ||
    typeof data.name !== 'string' ||
    typeof data.email !== 'string'
  ) {
    return null;
  }

  return {
    uid,
    role: data.role,
    name: data.name,
    email: data.email,
    profileData:
      data.profileData && typeof data.profileData === 'object' && !Array.isArray(data.profileData)
        ? (data.profileData as Record<string, unknown>)
        : {},
  };
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }

  return asUserProfile(uid, snapshot.data());
}

/**
 * onAuthStateChanged can fire after createUser and before the Firestore profile
 * write lands. Retry briefly so the session does not look logged-out.
 */
export async function waitForUserProfile(uid: string, attempts = 8): Promise<UserProfile | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const profile = await fetchUserProfile(uid);
    if (profile) {
      return profile;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 150);
    });
  }

  return null;
}

export async function signUpWithEmail({
  name,
  email,
  password,
  role,
}: SignUpInput): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const profile: UserProfile = {
    uid,
    role,
    name: name.trim(),
    email: credential.user.email ?? email.trim(),
    profileData: {},
  };

  await setDoc(doc(db, 'users', uid), profile);
  return profile;
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await waitForUserProfile(credential.user.uid);

  if (!profile) {
    await signOut(auth);
    throw new Error('Your account is missing a profile. Please sign up again.');
  }

  return profile;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function updateUserName(uid: string, name: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { name });
}

export async function updateSavedPropertyIds(uid: string, savedPropertyIds: string[]): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    profileData: { savedPropertyIds },
  });
}

export function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with that email already exists.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email or password is incorrect.';
      case 'auth/invalid-email':
        return 'That email address does not look right.';
      case 'auth/weak-password':
        return 'Use at least six characters for the password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'permission-denied':
        return 'You do not have permission to do that.';
      default:
        return 'Could not complete that request. Please try again.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not complete that request. Please try again.';
}
