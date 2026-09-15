import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface InventoryPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function InventoryPanel({ children, className, ...props }: InventoryPanelProps) {
  return (
    <div className={cn('inventory-panel', className)} {...props}>
      {children}
    </div>
  );
}
