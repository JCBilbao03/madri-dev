import { useCallback } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/components/features/ThemeToggle';
import { AuthLoading } from '@/components/rental/AuthLoading';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

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

function navClassName({ isActive }: { isActive: boolean }): string {
  return cn(
    'shrink-0 rounded-full px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
  );
}

export function RentalNavbar() {
  const role = useAuthStore((state) => state.role);
  const signOut = useAuthStore((state) => state.signOut);
  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);
  const links = role === 'landlord' ? landlordLinks : tenantLinks;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-3">
        <Logo to="/" />

        <nav aria-label="Rental app" className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end className={navClassName}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <ThemeToggle />
          <Button size="sm" variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </nav>
      </Container>
    </header>
  );
}

export function RentalLayout() {
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
