import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className={cn(
        'grid size-11 place-items-center rounded-lg border border-line text-ink-muted transition-colors duration-150 hover:border-ink-muted/30 hover:bg-surface hover:text-ink',
        className,
      )}
    >
      {isDark ? <Moon className="size-4" aria-hidden="true" /> : <Sun className="size-4" aria-hidden="true" />}
    </button>
  );
}
