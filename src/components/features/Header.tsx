import { Menu, X } from 'lucide-react';

import { MobileMenu } from '@/components/features/MobileMenu';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { navLinks } from '@/data/navigation';
import { useHasScrolled } from '@/hooks/useHasScrolled';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

export function Header() {
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const openContactModal = useUIStore((state) => state.openContactModal);
  const hasScrolled = useHasScrolled();

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        hasScrolled ? 'border-b border-line bg-base/80 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <Container className="flex h-18 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" variant="ghost" to="/cleaning-app" className="hidden md:inline-flex">
            Find cleaners
          </Button>
          <Button size="sm" variant="secondary" to="/login" className="hidden md:inline-flex">
            Browse rentals
          </Button>
          <Button size="sm" className="hidden md:inline-flex" onClick={openContactModal}>
            Start a Project
          </Button>

          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full border border-line text-ink transition hover:border-accent/60 md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      <MobileMenu />
    </header>
  );
}
