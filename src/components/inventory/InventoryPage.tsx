import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface InventoryPageProps {
  children: ReactNode;
  className?: string;
}

export function InventoryPage({ children, className }: InventoryPageProps) {
  return (
    <main id="main" className={cn('flex w-full flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10', className)}>
      {children}
    </main>
  );
}
