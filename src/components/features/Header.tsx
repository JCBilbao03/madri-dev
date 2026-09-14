import { Menu, X } from 'lucide-react';

import { MobileMenu } from '@/components/features/MobileMenu';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { StartProjectButton } from '@/components/features/StartProjectButton';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { navLinks } from '@/data/navigation';
import { useHasScrolled } from '@/hooks/useHasScrolled';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

export function Header() {
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const hasScrolled = useHasScrolled();

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 overflow-visible transition-colors duration-300',
        hasScrolled || isMobileMenuOpen
          ? 'border-b border-line bg-base/95 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-2 overflow-visible sm:h-18 sm:gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <StartProjectButton size="sm" className="hidden lg:inline-flex" />

          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="grid size-11 place-items-center rounded-lg border border-line text-ink transition-colors duration-150 hover:bg-surface hover:border-ink-muted/30 lg:hidden"
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
