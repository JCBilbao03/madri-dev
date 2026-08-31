import { create } from 'zustand';

import { persistTheme, readStoredTheme, type Theme } from '@/lib/theme';

export type { Theme };

interface UIState {
  isMobileMenuOpen: boolean;
  isContactModalOpen: boolean;
  theme: Theme;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openContactModal: () => void;
  closeContactModal: () => void;
  toggleTheme: () => void;
}

/**
 * Global UI state only. Anything scoped to a single component — form fields,
 * validation errors, submission status — stays in that component's local state.
 *
 * Always read from this store with an atomic selector:
 * `useUIStore((state) => state.isMobileMenuOpen)`.
 */
export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isContactModalOpen: false,
  theme: readStoredTheme(),

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Opening the contact modal from the mobile menu must also dismiss the menu,
  // otherwise two overlays stack and both trap focus.
  openContactModal: () => set({ isContactModalOpen: true, isMobileMenuOpen: false }),
  closeContactModal: () => set({ isContactModalOpen: false }),

  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'dark' ? 'light' : 'dark';
      persistTheme(theme);
      return { theme };
    }),
}));
