import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Short label rendered above the title, e.g. "Services". */
  eyebrow: string;
  title: string;
  /** Trailing fragment of the title rendered in the accent color. */
  titleAccent?: string;
  description?: string;
  align?: 'left' | 'center';
  /** Ties the section's `aria-labelledby` to this heading. */
  headingId?: string;
  className?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  align = 'center',
  headingId,
  className,
  descriptionClassName,
}: SectionHeaderProps) {
  const isCentered = align === 'center';

  return (
    <div className={cn('max-w-2xl', isCentered && 'mx-auto text-center', className)}>
      <p className="text-xs font-medium tracking-[0.16em] text-ink-muted uppercase">{eyebrow}</p>
      <h2
        id={headingId}
        className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl"
      >
        {title}
        {titleAccent ? <span className="text-accent-soft"> {titleAccent}</span> : null}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed text-pretty text-ink-muted',
            isCentered && 'mx-auto',
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
