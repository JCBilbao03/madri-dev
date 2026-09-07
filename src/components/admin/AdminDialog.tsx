import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useId, useRef, type ReactNode } from 'react';

import { useDismissableLayer } from '@/hooks/useDismissableLayer';

interface AdminDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function AdminDialog({ isOpen, title, description, onClose, children }: AdminDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDismissableLayer({
    isOpen,
    onDismiss: onClose,
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
            onClick={onClose}
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
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-ink-muted transition hover:bg-surface-raised hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <h2 id={titleId} className="pr-10 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {title}
            </h2>
            {description ? <p className="mt-2 text-sm text-ink-muted">{description}</p> : null}
            <div className="mt-6">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
