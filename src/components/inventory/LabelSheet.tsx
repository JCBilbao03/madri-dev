import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import type { InventoryItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface LabelSheetProps {
  items: InventoryItem[];
  className?: string;
  /** Hides on-screen controls — for direct print from the catalog. */
  embedded?: boolean;
}

interface WarehouseLabelProps {
  item: InventoryItem;
}

function WarehouseLabel({ item }: WarehouseLabelProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!barcodeRef.current || !item.barcodeValue) {
      return;
    }

    try {
      JsBarcode(barcodeRef.current, item.barcodeValue, {
        format: 'CODE128',
        displayValue: false,
        height: 36,
        width: 1.4,
        margin: 0,
        background: 'transparent',
        lineColor: '#111111',
      });
    } catch {
      barcodeRef.current.innerHTML = '';
    }
  }, [item.barcodeValue]);

  useEffect(() => {
    if (!item.barcodeValue) {
      setQrDataUrl('');
      return;
    }

    void QRCode.toDataURL(item.barcodeValue, {
      margin: 0,
      width: 72,
      color: { dark: '#111111', light: '#00000000' },
    }).then(setQrDataUrl);
  }, [item.barcodeValue]);

  return (
    <article className="label-card flex h-[2in] flex-col justify-between rounded-md border border-dashed border-line bg-white p-2 text-black print:h-[2in] print:break-inside-avoid print:rounded-none print:border print:border-neutral-400 print:p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold leading-tight">{item.name}</p>
          <p className="mt-0.5 font-mono text-[9px] text-neutral-600">{item.sku}</p>
          <p className="mt-0.5 text-[8px] text-neutral-500">Stock: {item.stock}</p>
        </div>
        {item.photoUrl ? (
          <img src={item.photoUrl} alt="" className="size-10 shrink-0 rounded object-cover" />
        ) : null}
      </div>

      <div className="mt-1 flex items-end justify-between gap-2">
        <svg ref={barcodeRef} role="img" aria-label={`Barcode for ${item.barcodeValue}`} className="max-h-10 w-full" />
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR for ${item.barcodeValue}`} className="size-12 shrink-0" />
        ) : null}
      </div>

      <p className="mt-0.5 text-center font-mono text-[8px] text-neutral-600">{item.barcodeValue}</p>
    </article>
  );
}

export function LabelSheet({ items, className, embedded = false }: LabelSheetProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn('label-sheet', className)}>
      {!embedded ? (
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-medium tracking-tight text-ink">Print deck</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {items.length} label{items.length === 1 ? '' : 's'} · US Letter · 3 × 5
            </p>
          </div>
          <Button type="button" variant="primary" onClick={handlePrint}>
            Print labels
          </Button>
        </div>
      ) : null}

      <div className="label-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-2">
        {items.map((item) => (
          <WarehouseLabel key={item.id} item={item} />
        ))}
      </div>

      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.35in;
          }

          body {
            background: white !important;
          }

          header,
          nav,
          .no-print {
            display: none !important;
          }

          main {
            padding: 0 !important;
          }

          .label-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.12in !important;
          }

          .label-card {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
