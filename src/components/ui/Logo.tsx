import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** In-app route. Defaults to an in-page jump back to the top of the landing page. */
  to?: string;
}

export function Logo({ className, to }: LogoProps) {
  const classes = cn(
    'inline-flex items-center gap-2.5 rounded-full text-lg font-semibold tracking-tight',
    className,
  );

  const mark = (
    <>
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent-soft via-accent to-accent-alt font-display text-sm font-bold text-base"
      >
        M
      </span>
      <span className="font-display text-ink">MadriBuild</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label="MadriBuild — home">
        {mark}
      </Link>
    );
  }

  return (
    <a href="#top" className={classes} aria-label="MadriBuild — back to top">
      {mark}
    </a>
  );
}
