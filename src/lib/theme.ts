export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'madribuild-theme';
export const LEGACY_THEME_STORAGE_KEY = 'madridev-theme';

/**
 * Copies a saved theme from the pre-rebrand key so existing visitors keep their preference.
 */
function migrateLegacyTheme(): void {
  if (typeof window === 'undefined') return;

  try {
    const legacy = window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (legacy && !window.localStorage.getItem(THEME_STORAGE_KEY)) {
      window.localStorage.setItem(THEME_STORAGE_KEY, legacy);
      window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    }
  } catch {
    // Private mode or blocked storage — migration is best-effort.
  }
}

/**
 * Resolves the visitor's theme before first paint. The same logic runs as an
 * inline script in `index.html`, so the two must stay in sync to avoid a flash
 * of the wrong theme on load.
 *
 * The brand is dark-first, so dark is the default for a first-time visitor
 * regardless of their OS setting. Only an explicit toggle switches it.
 */
export function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  migrateLegacyTheme();

  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
}

/**
 * Only ever called from an explicit toggle. Persisting on mount instead would
 * bake the current default into every visitor's browser permanently.
 */
export function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage — the choice just won't survive a reload.
  }
}
