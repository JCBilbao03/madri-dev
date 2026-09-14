import { useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/components/features/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/leads', label: 'Leads', end: false },
  { to: '/admin/apps', label: 'Apps', end: false },
  { to: '/admin/users', label: 'Users', end: false },
];

function navClassName({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
  );
}

export function AdminNavbar() {
  const signOut = useAuthStore((state) => state.signOut);
  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur-xl">
      <Container className="flex flex-col gap-3 py-3 lg:h-18 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:py-0">
        <div className="flex items-center justify-between gap-3">
          <Logo to="/admin" />
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <Button size="sm" variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>

        <nav aria-label="Admin" className="min-w-0 lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-1">
          <div className="-mx-5 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-1 lg:justify-end lg:px-0 [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClassName}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-1">
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

export function AdminLayout() {
  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  );
}
