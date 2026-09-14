import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

const MARK_ON_LIGHT_SRC = '/brand/madribuild-mark-on-light.png?v=5';
const MARK_ON_DARK_SRC = '/brand/madribuild-mark-on-dark.png?v=5';

/** Intrinsic 3× asset size (127×66). Displayed at 24px tall in the header. */
const MARK_WIDTH = 127;
const MARK_HEIGHT = 66;

interface LogoProps {
  className?: string;
  /** In-app route. Defaults to an in-page jump back to the top of the landing page. */
  to?: string;
  /** Header uses the MB mark only; full shows the complete lockup. */
  variant?: 'header' | 'full';
}

function HeaderMark() {
  const theme = useUIStore((state) => state.theme);
  const src = theme === 'dark' ? MARK_ON_DARK_SRC : MARK_ON_LIGHT_SRC;

  return (
    <img
      src={src}
      alt=""
      className="logo-mark"
      width={MARK_WIDTH}
      height={MARK_HEIGHT}
      decoding="async"
    />
  );
}

function FullLockupMark({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      className={cn('logo-mark-full', className)}
      width={MARK_WIDTH}
      height={MARK_HEIGHT}
      decoding="async"
    />
  );
}

function FullLockup() {
  return (
    <div className="flex flex-col items-start gap-3">
      <FullLockupMark src={MARK_ON_LIGHT_SRC} className="dark:hidden" />
      <FullLockupMark src={MARK_ON_DARK_SRC} className="hidden dark:block" />

      <p className="font-display text-base font-medium tracking-tight text-ink sm:text-lg">
        madri<span className="text-accent">_</span>build
      </p>
      <p className="max-w-[16rem] text-[10px] font-medium leading-relaxed tracking-[0.12em] text-ink-muted uppercase sm:text-[11px]">
        Your business shouldn&apos;t fight its <span className="text-accent-soft">tools.</span>
      </p>
    </div>
  );
}

function LogoImage({ variant }: { variant: 'header' | 'full' }) {
  if (variant === 'full') {
    return <FullLockup />;
  }

  return (
    <>
      <HeaderMark />
      <span className="font-display hidden text-[15px] font-medium tracking-tight text-ink sm:inline">
        madri<span className="text-accent">_</span>build
      </span>
    </>
  );
}

export function Logo({ className, to, variant = 'header' }: LogoProps) {
  const classes = cn(
    'inline-flex shrink-0',
    variant === 'full' ? 'flex-col items-start' : 'items-center gap-2',
    className,
  );
  const mark = <LogoImage variant={variant} />;

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
