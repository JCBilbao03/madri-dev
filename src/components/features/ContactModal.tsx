import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useId, useRef } from 'react';

import { ContactForm } from '@/components/features/ContactForm';
import { useDismissableLayer } from '@/hooks/useDismissableLayer';
import { useUIStore } from '@/store/useUIStore';

export function ContactModal() {
  const isOpen = useUIStore((state) => state.isContactModalOpen);
  const closeContactModal = useUIStore((state) => state.closeContactModal);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDismissableLayer({
    isOpen,
    onDismiss: closeContactModal,
    containerRef: dialogRef,
  });

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeContactModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-line bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-xl sm:p-8"
          >
            <button
              type="button"
              onClick={closeContactModal}
              aria-label="Close contact form"
              className="absolute top-4 right-4 grid size-11 place-items-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <h2 id={titleId} className="pr-10 font-display text-2xl font-semibold tracking-tight text-ink">
              Start a project
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              A few lines is plenty. We will follow up with questions if we need them.
            </p>

            <ContactForm className="mt-6" />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
