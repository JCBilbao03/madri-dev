import {
  CheckSquare,
  LayoutDashboard,
  Package,
  PanelLeft,
  PanelLeftClose,
  Plus,
  ShieldAlert,
  Ship,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface InventoryNavLink {
  to: string;
  label: string;
  shortLabel?: string;
  end: boolean;
  icon: LucideIcon;
}

export const INVENTORY_NAV_LINKS: InventoryNavLink[] = [
  { to: '/inventory-app', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/inventory-app/products', label: 'Products', end: false, icon: Package },
  { to: '/inventory-app/asn', label: 'ASN Builder', shortLabel: 'ASN', end: false, icon: Ship },
  { to: '/inventory-app/claims', label: 'Claims', end: false, icon: ShieldAlert },
  { to: '/inventory-app/tasks', label: 'Tasks', end: false, icon: CheckSquare },
];

export const INVENTORY_ACTION_LINK: InventoryNavLink = {
  to: '/inventory-app/products/items/new',
  label: 'New SKU',
  end: false,
  icon: Plus,
};

interface InventorySidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
}

interface SidebarNavLinkProps {
  link: InventoryNavLink;
  collapsed: boolean;
  variant?: 'default' | 'cta';
  onNavigate?: () => void;
}

function SidebarNavLink({ link, collapsed, variant = 'default', onNavigate }: SidebarNavLinkProps) {
  const isCta = variant === 'cta';

  return (
    <div className="group relative">
      <NavLink
        to={link.to}
        end={link.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'relative flex min-h-11 items-center rounded-lg text-sm transition-[color,background-color,box-shadow] duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--inv-scan)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base',
            collapsed ? 'justify-center px-2' : 'gap-3 px-3',
            isCta
              ? cn(
                  'border border-[color:var(--inv-scan)]/45 bg-[color:var(--inv-scan)]/12 font-medium text-[color:var(--inv-scan)]',
                  'hover:border-[color:var(--inv-scan)]/65 hover:bg-[color:var(--inv-scan)]/20',
                  isActive &&
                    'bg-[color:var(--inv-scan)]/25 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--inv-scan)_35%,transparent)]',
                  collapsed && isActive && 'ring-1 ring-[color:var(--inv-scan)]/45',
                )
              : cn(
                  'text-ink-muted hover:bg-surface/80 hover:text-ink',
                  isActive &&
                    !collapsed &&
                    'bg-[color:var(--inv-scan)]/10 font-medium text-[color:var(--inv-scan)] shadow-[inset_3px_0_0_0_var(--inv-scan)]',
                  isActive &&
                    collapsed &&
                    'bg-[color:var(--inv-scan)]/12 font-medium text-[color:var(--inv-scan)] ring-1 ring-[color:var(--inv-scan)]/40',
                ),
          )
        }
      >
        <link.icon
          className={cn('size-[1.125rem] shrink-0', collapsed && 'size-5')}
          aria-hidden="true"
        />
        <span
          className={cn(
            'truncate font-display text-[11px] tracking-[0.12em] uppercase transition-[opacity,max-width] duration-200',
            collapsed ? 'pointer-events-none max-w-0 opacity-0' : 'max-w-[11rem] opacity-100',
          )}
        >
          {link.label}
        </span>
      </NavLink>

      {collapsed ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute top-1/2 left-[calc(100%+0.625rem)] z-50 -translate-y-1/2',
            'rounded-md border border-line bg-surface px-2.5 py-1.5 font-display text-[10px] tracking-[0.14em] text-ink uppercase whitespace-nowrap',
            'opacity-0 shadow-sm transition-opacity duration-150',
            'group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        >
          {link.shortLabel ?? link.label}
        </span>
      ) : null}
    </div>
  );
}

function SidebarSectionLabel({
  children,
  collapsed,
}: {
  children: string;
  collapsed: boolean;
}) {
  return (
    <p
      className={cn(
        'mb-2 px-3 font-display text-[10px] tracking-[0.22em] text-ink-muted uppercase transition-opacity duration-200',
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

function SidebarHeader({
  collapsed,
  showMobileClose,
  onClose,
  onToggleCollapsed,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-3 border-b border-line/80 pb-4',
        collapsed ? 'flex-col justify-center gap-2' : 'px-1',
      )}
    >
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--inv-scan)]/35 bg-[color:var(--inv-scan)]/10',
          'font-display text-[10px] tracking-[0.24em] text-[color:var(--inv-scan)]',
        )}
        aria-hidden="true"
      >
        DL
      </div>

      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-medium tracking-tight text-ink">Operations</p>
          <p className="truncate text-xs text-ink-muted">Dang Lifestyle Hub</p>
        </div>
      ) : null}

      {showMobileClose ? (
        <button
          type="button"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-[color:var(--inv-scan)]/40 hover:text-ink lg:hidden"
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
            'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors',
            'hover:border-[color:var(--inv-scan)]/40 hover:bg-surface/80 hover:text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--inv-scan)]/50',
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

export function InventorySidebar({
  mobileOpen,
  collapsed,
  onClose,
  onToggleCollapsed,
}: InventorySidebarProps) {
  const desktopCollapsed = collapsed && !mobileOpen;

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-250 print:hidden lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />

      <aside
        id="inventory-sidebar-panel"
        className={cn(
          'inventory-panel fixed top-16 bottom-0 z-50 flex flex-col border-r border-line bg-base/96 backdrop-blur-xl print:hidden sm:top-18',
          'transition-[width,transform] duration-250 ease-out',
          'w-[min(100%,18rem)] px-3 py-4 sm:px-4',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:sticky lg:top-18 lg:z-auto lg:h-[calc(100svh-4.5rem)] lg:translate-x-0 lg:self-start lg:bg-base/75 lg:py-5',
          desktopCollapsed ? 'lg:w-[4.75rem] lg:px-2' : 'lg:w-60 lg:px-4',
        )}
        aria-label="Operations navigation"
      >
        <SidebarHeader
          collapsed={desktopCollapsed}
          showMobileClose={mobileOpen}
          onClose={onClose}
          onToggleCollapsed={onToggleCollapsed}
        />

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
          <SidebarSectionLabel collapsed={desktopCollapsed}>Modules</SidebarSectionLabel>
          <nav aria-label="Operations modules" className="flex flex-col gap-0.5">
            {INVENTORY_NAV_LINKS.map((link) => (
              <SidebarNavLink
                key={link.to}
                link={link}
                collapsed={desktopCollapsed}
                onNavigate={onClose}
              />
            ))}
          </nav>

          <div className={cn('my-4 border-t border-line/80', desktopCollapsed && 'mx-1')} />

          <SidebarSectionLabel collapsed={desktopCollapsed}>Quick action</SidebarSectionLabel>
          <nav aria-label="Quick actions">
            <SidebarNavLink
              link={INVENTORY_ACTION_LINK}
              collapsed={desktopCollapsed}
              variant="cta"
              onNavigate={onClose}
            />
          </nav>
        </div>

        {!desktopCollapsed ? (
          <p className="mt-4 hidden shrink-0 px-3 text-[10px] leading-relaxed text-ink-muted lg:block">
            Barcodes, ASNs, and claims in one workflow.
          </p>
        ) : null}
      </aside>
    </>
  );
}
