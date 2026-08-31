import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Short label rendered above the title, e.g. "Services". */
  eyebrow: string;
  title: string;
  /** Trailing fragment of the title rendered in the accent gradient. */
  titleAccent?: string;
  description?: string;
  align?: 'left' | 'center';
  /** Ties the section's `aria-labelledby` to this heading. */
  headingId?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  align = 'center',
  headingId,
  className,
}: SectionHeaderProps) {
  const isCentered = align === 'center';

  return (
    <div className={cn('max-w-2xl', isCentered && 'mx-auto text-center', className)}>
      <p className="text-xs font-semibold tracking-[0.2em] text-accent-soft uppercase">{eyebrow}</p>
      <h2
        id={headingId}
        className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl"
      >
        {title}
        {titleAccent ? <span className="text-gradient"> {titleAccent}</span> : null}
      </h2>
      {description ? (
        <p className={cn('mt-4 text-base text-pretty text-ink-muted', isCentered && 'mx-auto')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
