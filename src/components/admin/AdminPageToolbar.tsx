import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminPageToolbarProps {
  children: ReactNode;
  className?: string;
}

export function AdminPageToolbar({ children, className }: AdminPageToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  );
}
