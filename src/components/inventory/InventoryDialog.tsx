import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useId, useRef, type ReactNode } from 'react';

import { useDismissableLayer } from '@/hooks/useDismissableLayer';
import { cn } from '@/lib/utils';

interface InventoryDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function InventoryDialog({
  isOpen,
  title,
  description,
  onClose,
  children,
  className,
}: InventoryDialogProps) {
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
            className={cn(
              'relative max-h-[90dvh] w-full overflow-y-auto rounded-t-xl border border-line bg-base shadow-2xl',
              'pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-lg sm:rounded-xl',
              className,
            )}
          >
            <div className="sticky top-0 z-10 border-b border-line/70 bg-base/95 px-5 py-4 backdrop-blur-sm sm:px-6">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 grid size-11 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <X className="size-4" aria-hidden="true" />
              </button>

              <p className="font-display text-[10px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
                New task
              </p>
              <h2
                id={titleId}
                className="mt-1 pr-10 font-display text-xl font-medium tracking-tight text-ink sm:text-2xl"
              >
                {title}
              </h2>
              {description ? <p className="mt-1.5 text-sm text-ink-muted">{description}</p> : null}
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
