import { Check, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SimulatedActionButtonProps {
  label: string;
  successLabel?: string;
  onAction: () => Promise<void>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function SimulatedActionButton({
  label,
  successLabel = 'Done',
  onAction,
  disabled = false,
  variant = 'secondary',
  className,
}: SimulatedActionButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = useCallback(async () => {
    setPhase('loading');
    try {
      await onAction();
      setPhase('success');
      window.setTimeout(() => setPhase('idle'), 2000);
    } catch {
      setPhase('idle');
    }
  }, [onAction]);

  const isLoading = phase === 'loading';
  const isSuccess = phase === 'success';

  return (
    <Button
      type="button"
      variant={variant}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn(isSuccess && 'border-[color:var(--inv-scan)]/50', className)}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : isSuccess ? (
        <Check className="size-4" aria-hidden="true" />
      ) : null}
      {isLoading ? 'Working…' : isSuccess ? successLabel : label}
    </Button>
  );
}
