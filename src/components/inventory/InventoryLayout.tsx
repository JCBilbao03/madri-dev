import { Boxes, LayoutDashboard, Package, Plus, Ship, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/components/features/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BRAND_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

const links = [
  { to: '/inventory-app', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/inventory-app/products', label: 'Products', end: false, icon: Package },
  { to: '/inventory-app/asn', label: 'ASN', end: false, icon: Ship },
  { to: '/inventory-app/claims', label: 'Claims', end: false, icon: ShieldAlert },
  { to: '/inventory-app/products/items/new', label: 'New SKU', end: false, icon: Plus },
];

function navClassName({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2 font-display text-[11px] tracking-[0.16em] uppercase transition-colors duration-150',
    isActive
      ? 'border border-[color:var(--inv-scan)]/50 text-[color:var(--inv-scan)]'
      : 'border border-transparent text-ink-muted hover:border-line hover:text-ink',
  );
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time
      dateTime={now.toISOString()}
      className="hidden font-display text-[11px] tracking-[0.14em] text-ink-muted tabular-nums sm:block"
    >
      {now.toLocaleTimeString('en-GB', { hour12: false })}
    </time>
  );
}

export function InventoryNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/85 backdrop-blur-xl print:hidden">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-5 sm:h-18 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Logo to="/" />
          <span className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
          <p className="hidden items-center gap-2 font-display text-[11px] tracking-[0.2em] text-ink-muted uppercase sm:flex">
            <Boxes className="size-3.5 text-[color:var(--inv-scan)]" aria-hidden="true" />
            Dang Lifestyle Operations
          </p>
        </div>

        <nav aria-label="Operations hub" className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <div className="flex min-w-0 items-center justify-end gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClassName}>
                {link.icon ? <link.icon className="size-3.5" aria-hidden="true" /> : null}
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="ml-1 hidden items-center gap-3 border-l border-line pl-3 md:flex">
            <span className="flex items-center gap-1.5 font-display text-[10px] tracking-[0.18em] text-[color:var(--inv-scan)] uppercase">
              <span className="inventory-live-dot size-1.5 rounded-full bg-[color:var(--inv-scan)]" aria-hidden="true" />
              Live
            </span>
            <LiveClock />
          </div>

          <ThemeToggle className="ml-1 rounded-md" />
        </nav>
      </div>
    </header>
  );
}

export function InventoryLayout() {
  usePageMeta({
    title: `Dang Lifestyle Operations — ${BRAND_NAME}`,
    description: `${BRAND_NAME} operations hub for barcodes, ASNs, damage claims, and refunds.`,
    robots: 'noindex, nofollow',
  });

  return (
    <div className="inventory-shell flex min-h-svh flex-col">
      <InventoryNavbar />
      <div className="flex min-h-0 flex-1 flex-col pt-16 sm:pt-18">
        <Outlet />
      </div>
    </div>
  );
}
