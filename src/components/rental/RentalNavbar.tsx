import { useCallback } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/components/features/ThemeToggle';
import { AuthLoading } from '@/components/rental/AuthLoading';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BRAND_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types/rental';

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

function linksForRole(role: UserRole | null): { to: string; label: string }[] {
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

export function RentalNavbar() {
  const role = useAuthStore((state) => state.role);
  const signOut = useAuthStore((state) => state.signOut);
  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);
  const links = linksForRole(role);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur-xl">
      <Container className="flex flex-col gap-2 py-3 sm:h-18 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-0">
        <div className="flex items-center justify-between gap-3">
          <Logo to="/" />
          <div className="flex items-center gap-1 sm:hidden">
            <ThemeToggle />
            <Button size="sm" variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>

        <nav aria-label="Rental app" className="flex min-w-0 flex-1 items-center sm:justify-end sm:gap-1">
          <div className="-mx-5 flex min-w-0 flex-1 gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:justify-end sm:px-0 [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end className={navClassName}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-1">
            <ThemeToggle />
            <Button size="sm" variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}

export function RentalLayout() {
  usePageMeta({
    title: `Rental app — ${BRAND_NAME}`,
    description: `${BRAND_NAME} rental marketplace.`,
    robots: 'noindex, nofollow',
  });

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <RentalNavbar />
      <Outlet />
    </>
  );
}
