import { Barcode, ChevronDown, QrCode, ScanLine } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type CodePrintScope = 'both' | 'barcode' | 'qr';

interface PrintCodesMenuProps {
  disabled?: boolean;
  className?: string;
}

const options: { value: CodePrintScope; label: string; icon: typeof Barcode }[] = [
  { value: 'both', label: 'Barcode + QR', icon: ScanLine },
  { value: 'barcode', label: 'Barcode only', icon: Barcode },
  { value: 'qr', label: 'QR only', icon: QrCode },
];

export function PrintCodesMenu({ disabled = false, className }: PrintCodesMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback((scope: CodePrintScope) => {
    document.body.dataset.printMode = `codes-${scope}`;
    window.print();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Barcode className="size-4" aria-hidden="true" />
        Print codes
        <ChevronDown className={cn('size-4 transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </Button>

      {open ? (
        <div role="menu" className="inventory-panel absolute top-full right-0 z-20 mt-2 min-w-48 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full items-center gap-2 px-4 py-2.5 text-left font-display text-xs tracking-wide text-ink uppercase transition-colors hover:bg-surface-raised"
              onClick={() => handlePrint(option.value)}
            >
              <option.icon className="size-3.5 shrink-0" aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
