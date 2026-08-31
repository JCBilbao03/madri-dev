import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <a
      href="#top"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full text-lg font-semibold tracking-tight',
        className,
      )}
      aria-label="MadriDev — back to top"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent-soft via-accent to-accent-alt font-display text-sm font-bold text-base"
      >
        M
      </span>
      <span className="font-display text-ink">MadriDev</span>
    </a>
  );
}
