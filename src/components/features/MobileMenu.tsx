import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { CONTACT_EMAIL, navLinks } from '@/data/navigation';
import { useDismissableLayer } from '@/hooks/useDismissableLayer';
import { useUIStore } from '@/store/useUIStore';

export function MobileMenu() {
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu);
  const openContactModal = useUIStore((state) => state.openContactModal);
  const panelRef = useRef<HTMLDivElement>(null);

  useDismissableLayer({
    isOpen: isMobileMenuOpen,
    onDismiss: closeMobileMenu,
    containerRef: panelRef,
  });

  const handleStartProject = useCallback(() => {
    openContactModal();
  }, [openContactModal]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen ? (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-line bg-base/95 backdrop-blur-xl md:hidden"
        >
          <nav aria-label="Mobile" className="px-5 pt-2 pb-6 sm:px-8">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block border-b border-line py-4 font-display text-lg text-ink transition hover:text-accent-soft"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <Button size="lg" variant="secondary" to="/login" className="mt-6 w-full" onClick={closeMobileMenu}>
              Browse rentals
            </Button>

            <Button size="lg" className="mt-3 w-full" onClick={handleStartProject}>
              Start a Project
            </Button>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 block text-center text-sm text-ink-muted transition hover:text-ink"
            >
              {CONTACT_EMAIL}
            </a>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
