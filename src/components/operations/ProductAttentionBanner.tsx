import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface ProductAttentionBannerProps {
  count: number;
  className?: string;
}

export function ProductAttentionBanner({ count, className }: ProductAttentionBannerProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'inventory-panel flex flex-col gap-2 border-amber-500/30 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm text-ink">
        <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        Products requiring attention: <strong>{count}</strong>
      </p>
      <Link
        to="/inventory-app/products?filter=missing"
        className="font-display text-[11px] tracking-[0.14em] text-[color:var(--inv-scan)] uppercase hover:underline"
      >
        View missing barcodes
      </Link>
    </div>
  );
}
