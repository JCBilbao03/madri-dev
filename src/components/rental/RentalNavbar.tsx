import { useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { DemoAppVisitTracker } from '@/components/analytics/DemoAppVisitTracker';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { AuthLoading } from '@/components/rental/AuthLoading';
import { RentalDemoBanner } from '@/components/rental/RentalDemoBanner';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BRAND_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useRentalDemoStore } from '@/store/useRentalDemoStore';
import type { SignupRole, UserRole } from '@/types/rental';

const tenantLinks = [
  { to: '/tenant', label: 'Listings' },
  { to: '/tenant/saved', label: 'Saved' },
  { to: '/tenant/applications', label: 'Applications' },
  { to: '/account', label: 'Account' },
];

const landlordLinks = [
  { to: '/landlord', label: 'Dashboard' },
  { to: '/account', label: 'Account' },
];

const adminLinks = [
  { to: '/admin', label: 'Admin' },
  { to: '/account', label: 'Account' },
];

function linksForRole(role: UserRole | SignupRole | null): { to: string; label: string }[] {
  if (role === 'admin') {
    return adminLinks;
  }

  if (role === 'landlord') {
    return landlordLinks;
  }

  return tenantLinks;
}

function navClassName({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
  );
}

function roleButtonClassName(isActive: boolean): string {
  return cn(
    'inline-flex min-h-9 items-center rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
    isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
  );
}

function RentalNavbarContent() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const signOut = useAuthStore((state) => state.signOut);
  const demoRole = useRentalDemoStore((state) => state.demoRole);
  const setDemoRole = useRentalDemoStore((state) => state.setDemoRole);
  const activeRole = user ? role : demoRole;
  const links = linksForRole(activeRole);

  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  const handleSetTenant = useCallback(() => {
    setDemoRole('tenant');
  }, [setDemoRole]);

  const handleSetLandlord = useCallback(() => {
    setDemoRole('landlord');
  }, [setDemoRole]);

  return (
    <Container className="flex flex-col gap-2 py-3 sm:h-18 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-0">
      <div className="flex items-center justify-between gap-3">
        <Logo to="/" />
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          {user ? (
            <Button size="sm" variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <Button size="sm" variant="secondary" to="/login">
              Sign in
            </Button>
          )}
        </div>
      </div>

      <nav aria-label="Rental app" className="flex min-w-0 flex-1 items-center sm:justify-end sm:gap-1">
        {!user ? (
          <div className="mr-2 hidden items-center gap-1 rounded-lg border border-line bg-base/60 p-1 sm:flex">
            <button type="button" className={roleButtonClassName(demoRole === 'tenant')} onClick={handleSetTenant}>
              Tenant
            </button>
            <button type="button" className={roleButtonClassName(demoRole === 'landlord')} onClick={handleSetLandlord}>
              Landlord
            </button>
          </div>
        ) : null}

        <div className="-mx-5 flex min-w-0 flex-1 gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:justify-end sm:px-0 [&::-webkit-scrollbar]:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={navClassName}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden sm:flex sm:items-center sm:gap-1">
          <ThemeToggle />
          {user ? (
            <Button size="sm" variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <Button size="sm" variant="secondary" to="/login">
              Sign in
            </Button>
          )}
        </div>
      </nav>
    </Container>
  );
}

export function RentalLayout() {
  usePageMeta({
    title: `Rental app — ${BRAND_NAME}`,
    description: `${BRAND_NAME} rental marketplace demo.`,
    robots: 'noindex, nofollow',
  });

  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return <AuthLoading />;
  }

  return (
    <>
      <DemoAppVisitTracker appId="rental" />
      <div className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur-xl">
        <RentalNavbarContent />
        {!user ? <RentalDemoBanner /> : null}
      </div>
      <div className={cn('min-h-svh', user ? 'pt-18' : 'pt-[8.75rem]')}>
        <Outlet />
      </div>
    </>
  );
}
