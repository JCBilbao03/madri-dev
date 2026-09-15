import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  createDemoApplication,
  updateDemoApplicationStatus,
} from '@/lib/rentalDemo';
import type {
  ApplicationAnswer,
  ApplicationStatus,
  RentalApplication,
  ScreeningQuestion,
  SignupRole,
} from '@/types/rental';

interface RentalDemoState {
  demoRole: SignupRole;
  savedPropertyIds: string[];
  applications: RentalApplication[];
  screeningOverrides: Record<string, ScreeningQuestion[]>;
  setDemoRole: (role: SignupRole) => void;
  toggleSavedProperty: (propertyId: string) => void;
  submitApplication: (propertyId: string, answers: ApplicationAnswer[]) => RentalApplication;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  updateScreeningQuestions: (propertyId: string, screeningQuestions: ScreeningQuestion[]) => void;
}

/**
 * Guest rental demo state — persisted locally so visitors can explore tenant and landlord flows.
 */
export const useRentalDemoStore = create<RentalDemoState>()(
  persist(
    (set) => ({
      demoRole: 'tenant',
      savedPropertyIds: [],
      applications: [],
      screeningOverrides: {},

      setDemoRole: (role) => set({ demoRole: role }),

      toggleSavedProperty: (propertyId) => {
        set((state) => ({
          savedPropertyIds: state.savedPropertyIds.includes(propertyId)
            ? state.savedPropertyIds.filter((id) => id !== propertyId)
            : [...state.savedPropertyIds, propertyId],
        }));
      },

      submitApplication: (propertyId, answers) => {
        const application = createDemoApplication(propertyId, answers);
        set((state) => ({
          applications: [
            application,
            ...state.applications.filter((entry) => entry.applicationId !== application.applicationId),
          ],
        }));
        return application;
      },

      updateApplicationStatus: (applicationId, status) => {
        set((state) => ({
          applications: updateDemoApplicationStatus(state.applications, applicationId, status),
        }));
      },

      updateScreeningQuestions: (propertyId, screeningQuestions) => {
        set((state) => ({
          screeningOverrides: {
            ...state.screeningOverrides,
            [propertyId]: screeningQuestions,
          },
        }));
      },
    }),
    {
      name: 'madribuild-rental-demo',
      partialize: (state) => ({
        demoRole: state.demoRole,
        savedPropertyIds: state.savedPropertyIds,
        applications: state.applications,
        screeningOverrides: state.screeningOverrides,
      }),
    },
  ),
);
