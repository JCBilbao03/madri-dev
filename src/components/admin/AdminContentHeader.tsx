import { Bell, Menu, Search, X } from 'lucide-react';
import { useCallback, useId, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import { AdminAvatar } from '@/components/admin/AdminAvatar';
import { useAdminChromeContext } from '@/components/admin/AdminChromeContext';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

interface AdminContentHeaderProps {
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export function AdminContentHeader({ mobileOpen, onToggleMobile }: AdminContentHeaderProps) {
  const searchId = useId();
  const { chrome } = useAdminChromeContext();
  const user = useAuthStore((state) => state.user);

  const name = user?.name?.trim() || 'Admin';
  const notificationCount = chrome.notificationCount ?? 0;

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      chrome.onSearchChange?.(event.target.value);
    },
    [chrome],
  );

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-line bg-base/90 backdrop-blur-xl">
      <div className="flex min-h-14 items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted transition hover:bg-surface hover:text-ink lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar-panel"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={onToggleMobile}
        >
          {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
          {chrome.breadcrumbs.map((crumb, index) => {
            const isLast = index === chrome.breadcrumbs.length - 1;

            return (
              <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 ? (
                  <span className="text-ink-muted/50" aria-hidden="true">
                    /
                  </span>
                ) : null}
                <span
                  className={cn(
                    'truncate',
                    isLast ? 'font-display font-medium text-ink' : 'font-sans text-ink-muted',
                  )}
                >
                  {crumb.label}
                </span>
              </span>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {chrome.showSearch ? (
            <div className="relative hidden sm:block">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                id={searchId}
                type="search"
                value={chrome.searchQuery ?? ''}
                onChange={handleSearchChange}
                placeholder={chrome.searchPlaceholder ?? 'Search…'}
                className="h-9 w-44 rounded-lg border border-line bg-surface py-1.5 pr-3 pl-9 text-sm text-ink transition placeholder:text-ink-muted/70 focus:border-accent focus:outline-none lg:w-56"
              />
            </div>
          ) : null}

          {notificationCount > 0 ? (
            <Link
              to="/admin/leads?followUp=due"
              className="relative inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink-muted transition hover:bg-surface hover:text-ink"
              aria-label={`${notificationCount} follow-ups due`}
            >
              <Bell className="size-4" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            </Link>
          ) : null}

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface py-1 pl-1 pr-2.5">
            <AdminAvatar name={name} size="sm" />
            <span className="hidden max-w-[8rem] truncate text-sm text-ink md:inline">
              {name}
            </span>
          </div>
        </div>
      </div>

      {chrome.toolbar ? (
        <div className="flex items-center justify-end gap-2 border-t border-line/60 px-4 py-2 sm:px-6 lg:px-8">
          {chrome.toolbar}
        </div>
      ) : null}

      {chrome.showSearch ? (
        <div className="border-t border-line/60 px-4 py-2 sm:hidden">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={chrome.searchQuery ?? ''}
              onChange={handleSearchChange}
              placeholder={chrome.searchPlaceholder ?? 'Search…'}
              className="h-10 w-full rounded-lg border border-line bg-surface py-2 pr-3 pl-9 text-sm text-ink"
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
