import type { Founder, FounderBackdrop } from '@/data/founders';
import { cn } from '@/lib/utils';

interface FounderPortraitProps {
  founder: Founder;
}

const backdropClass: Record<FounderBackdrop, string> = {
  quarter:
    'right-0 bottom-2 size-24 rounded-full bg-[#F26A3A]/25 dark:bg-[#F26A3A]/15 sm:right-0 sm:bottom-4 sm:size-40 transition-all duration-500 ease-out-soft group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1',
  diamond:
    'right-1 top-6 size-20 rotate-[18deg] rounded-md bg-[#6BA3F7]/25 dark:bg-[#6BA3F7]/15 sm:right-2 sm:top-8 sm:size-32 transition-all duration-500 ease-out-soft group-hover:scale-115 group-hover:rotate-[28deg]',
  circle:
    '-left-2 top-4 size-28 rounded-full bg-[#F4A07A]/30 dark:bg-[#F4A07A]/20 sm:-left-3 sm:top-6 sm:size-44 transition-all duration-500 ease-out-soft group-hover:scale-110 group-hover:-translate-x-1 group-hover:translate-y-1',
  triangle:
    'right-0 top-4 size-24 bg-[#FDB813]/25 dark:bg-[#FDB813]/15 [clip-path:polygon(0_0,100%_0,50%_100%)] sm:right-1 sm:top-6 sm:size-40 transition-all duration-500 ease-out-soft group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-6',
};

function founderInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function FounderPortrait({ founder }: FounderPortraitProps) {
  const { name, role, bio, photo, photoAlt, photoPosition, backdrop } = founder;

  return (
    <article className="group flex flex-col items-center text-center">
      <div className="relative mx-auto size-32 min-[360px]:size-36 sm:size-52">
        <span
          aria-hidden="true"
          className={cn('absolute z-0', backdropClass[backdrop])}
        />

        {photo ? (
          <img
            src={photo}
            alt={photoAlt}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: photoPosition ?? 'top' }}
            className="absolute top-1/2 left-1/2 z-10 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover min-[360px]:size-28 sm:size-40 transition-transform duration-500 ease-out-soft group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface-raised min-[360px]:size-28 sm:size-40 transition-transform duration-500 ease-out-soft group-hover:scale-105"
          >
            <span className="font-display text-2xl font-medium tracking-tight text-ink-muted">
              {founderInitials(name)}
            </span>
          </div>
        )}
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink sm:mt-5">
        {name}
      </h3>
      <p className="mt-1 text-xs font-medium tracking-[0.16em] text-accent-soft uppercase">
        {role}
      </p>
      <p className="sr-only">{bio}</p>
    </article>
  );
}
