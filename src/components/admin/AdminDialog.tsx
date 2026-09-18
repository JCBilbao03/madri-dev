import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useId, useRef, type ReactNode } from 'react';

import { useDismissableLayer } from '@/hooks/useDismissableLayer';
import { cn } from '@/lib/utils';

type AdminDialogSize = 'md' | 'lg';

interface AdminDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: AdminDialogSize;
  className?: string;
}

const sizeClasses: Record<AdminDialogSize, string> = {
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
};

export function AdminDialog({
  isOpen,
  title,
  description,
  onClose,
  children,
  size = 'md',
  className,
}: AdminDialogProps) {
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
            className="admin-dismiss-overlay absolute inset-0 bg-black/70 backdrop-blur-sm"
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
              'admin-ui relative flex w-full max-h-[min(92dvh,100dvh)] flex-col overflow-hidden',
              'rounded-t-2xl border border-line bg-surface font-sans shadow-xl sm:rounded-2xl',
              sizeClasses[size],
              className,
            )}
          >
            <header className="relative shrink-0 border-b border-line/60 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 grid size-10 place-items-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink sm:top-5 sm:right-5"
              >
                <X className="size-4" aria-hidden="true" />
              </button>

              <h2
                id={titleId}
                className="pr-11 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl"
              >
                {title}
              </h2>
              {description ? <p className="mt-1.5 max-w-prose text-sm text-ink-muted">{description}</p> : null}
            </header>

            <div className="admin-dialog-body min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6 [scrollbar-width:thin]">
              <div className="w-full min-w-0">{children}</div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
