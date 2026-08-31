import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Renders a different element so sections keep semantic markup. */
  as?: ElementType;
}

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return <Tag className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</Tag>;
}
