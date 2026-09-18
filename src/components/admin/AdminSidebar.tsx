import {
  AppWindow,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  PanelLeft,
  PanelLeftClose,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';

import { Logo } from '@/components/ui/Logo';
import { useDismissableLayer } from '@/hooks/useDismissableLayer';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

export interface AdminNavLink {
  to: string;
  label: string;
  end: boolean;
  icon: LucideIcon;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { to: '/admin', label: 'Overview', end: true, icon: LayoutDashboard },
  { to: '/admin/leads', label: 'Leads', end: false, icon: Inbox },
  { to: '/admin/email', label: 'Email', end: false, icon: Mail },
  { to: '/admin/apps', label: 'Apps', end: false, icon: AppWindow },
  { to: '/admin/users', label: 'Users', end: false, icon: Users },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  isDesktop: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
}

interface SidebarNavLinkProps {
  link: AdminNavLink;
  collapsed: boolean;
  onNavigate?: () => void;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (!first) {
    return 'MB';
  }

  if (!last || parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }

  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function SidebarNavLink({ link, collapsed, onNavigate }: SidebarNavLinkProps) {
  return (
    <div className="group relative">
      <NavLink
        to={link.to}
        end={link.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'relative flex min-h-10 w-full items-center overflow-hidden rounded-full text-sm font-medium transition-colors duration-150',
            collapsed ? 'justify-center px-2' : 'gap-3 px-3.5',
            isActive
              ? 'bg-surface-raised text-ink shadow-sm ring-1 ring-line/80'
              : 'text-ink-muted hover:bg-surface hover:text-ink',
          )
        }
      >
        <link.icon className={cn('size-[1.125rem] shrink-0', collapsed && 'size-5')} aria-hidden="true" />
        {collapsed ? <span className="sr-only">{link.label}</span> : <span className="truncate">{link.label}</span>}
      </NavLink>

      {collapsed ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute top-1/2 left-[calc(100%+0.625rem)] z-50 -translate-y-1/2',
            'rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-ink whitespace-nowrap',
            'opacity-0 shadow-sm transition-opacity duration-150',
            'group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        >
          {link.label}
        </span>
      ) : null}
    </div>
  );
}

function SidebarSectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  return (
    <p
      className={cn(
        'mb-2 px-3.5 font-display text-[11px] font-medium tracking-[0.14em] text-ink-muted uppercase transition-opacity duration-150',
        collapsed ? 'sr-only' : 'opacity-100',
      )}
    >
      {children}
    </p>
  );
}

interface SidebarHeaderProps {
  collapsed: boolean;
  showMobileClose: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
}

function SidebarHeader({ collapsed, showMobileClose, onClose, onToggleCollapsed }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-3 pb-5',
        collapsed ? 'flex-col justify-center gap-2' : 'px-1',
      )}
    >
      {collapsed ? (
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/35 bg-accent/10 font-display text-[11px] tracking-tight text-accent-soft"
          aria-hidden="true"
        >
          M
        </div>
      ) : (
        <Logo to="/admin" className="min-w-0 flex-1" />
      )}

      {showMobileClose ? (
        <button
          type="button"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors duration-150 hover:border-ink-muted/30 hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {!showMobileClose ? (
        <button
          type="button"
          className={cn(
            'hidden size-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors duration-150 lg:inline-flex',
            'hover:border-ink-muted/30 hover:bg-surface hover:text-ink',
            collapsed ? '' : 'ml-auto',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={onToggleCollapsed}
        >
          {collapsed ? (
            <PanelLeft className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
        </button>
      ) : null}
    </div>
  );
}

interface SidebarAccountProps {
  collapsed: boolean;
}

function SidebarAccount({ collapsed }: SidebarAccountProps) {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  const name = user?.name?.trim() || 'Admin';
  const email = user?.email ?? '';
  const initials = initialsFromName(name);

  return (
    <div className={cn('mt-4 shrink-0 border-t border-line pt-4', collapsed && 'flex flex-col items-center')}>
      <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : 'px-1')}>
        <div
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-raised font-sans text-[11px] font-medium tracking-wide text-accent-soft"
          aria-hidden="true"
        >
          {initials}
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{name}</p>
            {email ? <p className="truncate text-xs text-ink-muted">{email}</p> : null}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className={cn(
          'mt-3 flex min-h-10 w-full items-center rounded-full text-sm font-medium text-ink-muted transition-colors duration-150',
          'hover:bg-surface hover:text-ink',
          collapsed ? 'justify-center px-2' : 'gap-2 px-3',
        )}
        aria-label="Sign out"
      >
        <LogOut className="size-[1.125rem] shrink-0" aria-hidden="true" />
        <span className={cn('whitespace-nowrap', collapsed && 'sr-only')}>Sign out</span>
      </button>
    </div>
  );
}

export function AdminSidebar({
  mobileOpen,
  collapsed,
  isDesktop,
  onClose,
  onToggleCollapsed,
}: AdminSidebarProps) {
  const panelRef = useRef<HTMLElement>(null);
  const desktopCollapsed = collapsed && isDesktop;
  const drawerHidden = !isDesktop && !mobileOpen;

  useDismissableLayer({
    isOpen: mobileOpen,
    onDismiss: onClose,
    containerRef: panelRef,
  });

  return (
    <>
      <div
        className={cn(
          'admin-dismiss-overlay fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />

      <aside
        id="admin-sidebar-panel"
        ref={panelRef}
        tabIndex={-1}
        inert={drawerHidden ? true : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex min-h-svh flex-col border-r border-line bg-surface',
          'w-[min(100%,18rem)] px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4',
          'transition-[width,transform] duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          drawerHidden && 'max-lg:invisible max-lg:pointer-events-none',
          'lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:min-h-svh lg:translate-x-0 lg:visible lg:bg-base',
          desktopCollapsed ? 'lg:w-[4.75rem] lg:px-2' : 'lg:w-60 lg:px-4',
        )}
        aria-label="Admin navigation"
      >
        <SidebarHeader
          collapsed={desktopCollapsed}
          showMobileClose={mobileOpen}
          onClose={onClose}
          onToggleCollapsed={onToggleCollapsed}
        />

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
          <SidebarSectionLabel collapsed={desktopCollapsed}>Workspace</SidebarSectionLabel>
          <nav aria-label="Admin pages" className="flex flex-col gap-1">
            {ADMIN_NAV_LINKS.map((link) => (
              <SidebarNavLink key={link.to} link={link} collapsed={desktopCollapsed} onNavigate={onClose} />
            ))}
          </nav>
        </div>

        <SidebarAccount collapsed={desktopCollapsed} />
      </aside>
    </>
  );
}
