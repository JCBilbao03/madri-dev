import { ArrowRight } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

interface StartProjectButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  size?: 'sm' | 'md' | 'lg';
}

export function StartProjectButton({ className, onClick, size, ...props }: StartProjectButtonProps) {
  const openContactModal = useUIStore((state) => state.openContactModal);

  return (
    <Button
      type="button"
      variant="cta"
      size={size}
      className={cn('group', className)}
      onClick={onClick ?? openContactModal}
      {...props}
    >
      Start a Project
      <ArrowRight
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Button>
  );
}
