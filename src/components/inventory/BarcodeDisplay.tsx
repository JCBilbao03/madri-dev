import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { cn } from '@/lib/utils';

interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
  /** Renders without the outer panel — for embedding beside other controls. */
  embedded?: boolean;
  /** Smaller barcode + QR — for wide layouts like the item detail page. */
  compact?: boolean;
}

export function BarcodeDisplay({ value, label, className, embedded = false, compact = false }: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const svg = barcodeRef.current;
    if (!svg || !value.trim()) {
      return;
    }

    try {
      JsBarcode(svg, value, {
        format: 'CODE128',
        displayValue: true,
        fontSize: compact ? 10 : 11,
        height: compact ? 32 : 48,
        margin: 4,
        width: compact ? 1.1 : 1.5,
        background: 'transparent',
        lineColor: 'currentColor',
      });

      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    } catch {
      svg.innerHTML = '';
    }
  }, [compact, value]);

  useEffect(() => {
    if (!value.trim()) {
      setQrDataUrl('');
      return;
    }

    void QRCode.toDataURL(value, {
      margin: 1,
      width: compact ? 112 : 144,
      color: { dark: '#111318', light: '#f4f4f5' },
    }).then(setQrDataUrl);
  }, [compact, value]);

  if (!value.trim()) {
    return null;
  }

  const content = (
    <>
      {label ? (
        <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">{label}</p>
      ) : null}

      <div className={cn('space-y-4', label && 'mt-4')}>
        <div className="inventory-print-barcode min-w-0">
          <p className="font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">Barcode // CODE128</p>
          <div
            className={cn(
              'mt-2 min-w-0 overflow-hidden rounded-md bg-surface-raised/50 px-3 py-3',
              compact ? 'mx-auto max-w-[14rem]' : 'w-full',
            )}
          >
            <svg
              ref={barcodeRef}
              role="img"
              aria-label={`Barcode for ${value}`}
              className={cn(
                'mx-auto block h-auto text-ink',
                compact ? 'max-w-[12rem]' : 'w-full max-w-full',
              )}
            />
          </div>
        </div>

        <div className="inventory-print-qr flex flex-col items-center border-t border-line/60 pt-4">
          <p className="font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">QR // warehouse</p>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code for ${value}`}
              className={cn(
                'mt-2 border border-line bg-[#f4f4f5] p-2',
                compact ? 'size-24' : 'size-28 sm:size-32',
              )}
            />
          ) : null}
        </div>
      </div>

      <p className="mt-3 break-all text-center font-display text-xs tracking-wide text-ink-muted">{value}</p>
    </>
  );

  if (embedded) {
    return <div className={cn('min-w-0', className)}>{content}</div>;
  }

  return <InventoryPanel className={cn('p-5', className)}>{content}</InventoryPanel>;
}
