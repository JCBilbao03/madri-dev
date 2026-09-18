import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminPageProps {
  children: ReactNode;
  className?: string;
}

export function AdminPage({ children, className }: AdminPageProps) {
  return (
    <main
      id="main"
      className={cn(
        'flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-width:thin] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </main>
  );
}
