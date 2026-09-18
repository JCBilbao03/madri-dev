import { NavLink, Outlet } from 'react-router-dom';

import { DemoAppVisitTracker } from '@/components/analytics/DemoAppVisitTracker';
import { BookingModal } from '@/components/cleaning/BookingModal';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BRAND_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

const links = [
  { to: '/cleaning-app', label: 'Search', end: true },
  { to: '/cleaning-app/dashboard', label: 'Dashboard', end: false },
];

function navClassName({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
  );
}

export function CleaningNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-3 sm:h-18">
        <Logo to="/" />

        <nav aria-label="Cleaning app" className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClassName}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <ThemeToggle />
        </nav>
      </Container>
    </header>
  );
}

export function CleaningLayout() {
  usePageMeta({
    title: `Cleaning app — ${BRAND_NAME}`,
    description: `${BRAND_NAME} cleaning services demo.`,
    robots: 'noindex, nofollow',
  });

  return (
    <>
      <DemoAppVisitTracker appId="cleaning" />
      <CleaningNavbar />
      <Outlet />
      <BookingModal />
    </>
  );
}
