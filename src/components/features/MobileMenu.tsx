import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef } from 'react';

import { StartProjectButton } from '@/components/features/StartProjectButton';
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
    closeMobileMenu();
    openContactModal();
  }, [closeMobileMenu, openContactModal]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen ? (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-16 z-50 h-[calc(100dvh-4rem)] overflow-y-auto bg-base lg:hidden sm:top-18 sm:h-[calc(100dvh-4.5rem)]"
        >
          <nav aria-label="Mobile" className="px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block border-b border-line py-4 font-display text-lg text-ink transition-colors duration-150 hover:text-accent-soft"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <StartProjectButton size="lg" className="mt-6 w-full" onClick={handleStartProject} />

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 block break-all text-center text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              {CONTACT_EMAIL}
            </a>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
