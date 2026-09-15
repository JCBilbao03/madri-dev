import { useCallback } from 'react';

import { DEMO_TENANT_NAME } from '@/lib/rentalDemo';
import { useAuthStore } from '@/store/useAuthStore';
import { useRentalDemoStore } from '@/store/useRentalDemoStore';
import {
  savedIdsFromProfile,
  type ApplicationAnswer,
  type ApplicationStatus,
  type RentalApplication,
  type ScreeningQuestion,
  type SignupRole,
  type UserRole,
} from '@/types/rental';

export function useRentalIsDemo(): boolean {
  const user = useAuthStore((state) => state.user);
  return !user;
}

export function useRentalActiveRole(): UserRole | SignupRole {
  const user = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const demoRole = useRentalDemoStore((state) => state.demoRole);

  if (user && authRole) {
    return authRole;
  }

  return demoRole;
}

export function useRentalDisplayName(): string {
  const user = useAuthStore((state) => state.user);
  return user?.name ?? DEMO_TENANT_NAME;
}

export function useRentalSavedIds(): string[] {
  const user = useAuthStore((state) => state.user);
  const profileData = useAuthStore((state) => state.user?.profileData);
  const demoSavedIds = useRentalDemoStore((state) => state.savedPropertyIds);

  if (user) {
    return savedIdsFromProfile(profileData ?? {});
  }

  return demoSavedIds;
}

export function useRentalToggleSaved() {
  const user = useAuthStore((state) => state.user);
  const toggleAuthSaved = useAuthStore((state) => state.toggleSavedProperty);
  const toggleDemoSaved = useRentalDemoStore((state) => state.toggleSavedProperty);

  return useCallback(
    (propertyId: string) => {
      if (user) {
        void toggleAuthSaved(propertyId);
        return;
      }

      toggleDemoSaved(propertyId);
    },
    [toggleAuthSaved, toggleDemoSaved, user],
  );
}

export function useRentalScreeningOverrides(): Record<string, ScreeningQuestion[]> {
  const isDemo = useRentalIsDemo();
  const overrides = useRentalDemoStore((state) => state.screeningOverrides);
  return isDemo ? overrides : {};
}

export function useRentalDemoApplications(): RentalApplication[] {
  return useRentalDemoStore((state) => state.applications);
}

export function useRentalSubmitApplication() {
  const user = useAuthStore((state) => state.user);
  const submitDemoApplication = useRentalDemoStore((state) => state.submitApplication);

  return useCallback(
    async (propertyId: string, answers: ApplicationAnswer[]) => {
      if (user) {
        const { submitApplication } = await import('@/lib/rentalData');
        return submitApplication(user.uid, propertyId, answers);
      }

      return submitDemoApplication(propertyId, answers);
    },
    [submitDemoApplication, user],
  );
}

export function useRentalUpdateApplicationStatus() {
  const user = useAuthStore((state) => state.user);
  const updateDemoStatus = useRentalDemoStore((state) => state.updateApplicationStatus);

  return useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      if (user) {
        const { updateApplicationStatus } = await import('@/lib/rentalData');
        await updateApplicationStatus(applicationId, status);
        return;
      }

      updateDemoStatus(applicationId, status);
    },
    [updateDemoStatus, user],
  );
}

export function useRentalUpdateScreeningQuestions() {
  const user = useAuthStore((state) => state.user);
  const updateDemoQuestions = useRentalDemoStore((state) => state.updateScreeningQuestions);

  return useCallback(
    async (propertyId: string, screeningQuestions: ScreeningQuestion[]) => {
      if (user) {
        const { updateScreeningQuestions } = await import('@/lib/rentalData');
        await updateScreeningQuestions(propertyId, screeningQuestions);
        return;
      }

      updateDemoQuestions(propertyId, screeningQuestions);
    },
    [updateDemoQuestions, user],
  );
}
