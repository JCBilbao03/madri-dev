import type { WorkPreviewVariant } from '@/data/works';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  variant: WorkPreviewVariant;
  className?: string;
  /** Icon size inside the badge. Defaults to 64. */
  size?: number;
}

const accent: Record<WorkPreviewVariant, { badge: string; icon: string; glow: string }> = {
  rental: {
    badge: 'bg-[#F26A3A]/12 text-[#F26A3A] ring-[#F26A3A]/25',
    icon: '#F26A3A',
    glow: 'bg-[#F26A3A]/20',
  },
  cleaning: {
    badge: 'bg-[#6BA3F7]/12 text-[#6BA3F7] ring-[#6BA3F7]/25',
    icon: '#6BA3F7',
    glow: 'bg-[#6BA3F7]/20',
  },
  inventory: {
    badge: 'bg-[#3DD6C6]/12 text-[#3DD6C6] ring-[#3DD6C6]/25',
    icon: '#3DD6C6',
    glow: 'bg-[#3DD6C6]/20',
  },
};

function RentalMark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="size-full">
      <path
        d="M32 14L50 28V48H14V28L32 14Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M24 48V34H40V48" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="29" y="38" width="6" height="10" rx="1" fill={color} />
      <circle cx="46" cy="22" r="5" stroke={color} strokeWidth="2" />
      <path d="M49.5 25.5L54 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CleaningMark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="size-full">
      <path
        d="M24 18C24 18 26 14 32 14C38 14 40 18 40 18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="22" y="18" width="20" height="28" rx="4" stroke={color} strokeWidth="2.5" />
      <path d="M28 26H36M28 32H36M28 38H33" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M14 24L16 20L18 24L16 28L14 24Z M46 34L48 30L50 34L48 38L46 34Z M50 16L51.5 14L53 16L51.5 18L50 16Z"
        fill={color}
      />
      <circle cx="32" cy="46" r="3" fill={color} />
    </svg>
  );
}

function InventoryMark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="size-full">
      <path
        d="M14 24L32 14L50 24V44L32 54L14 44V24Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M32 14V54M14 24L32 34L50 24M32 34V54" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 40H28M20 44H26M36 40H44M36 44H42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="20" y="36" width="24" height="12" rx="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

const marks: Record<WorkPreviewVariant, typeof RentalMark> = {
  rental: RentalMark,
  cleaning: CleaningMark,
  inventory: InventoryMark,
};

export function AppLogo({ variant, className, size = 64 }: AppLogoProps) {
  const styles = accent[variant];
  const Mark = marks[variant];

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <span
        aria-hidden="true"
        className={cn('absolute inset-0 scale-125 rounded-2xl blur-xl', styles.glow)}
      />
      <span
        className={cn(
          'relative grid place-items-center rounded-2xl p-3 ring-1 ring-inset',
          styles.badge,
        )}
        style={{ width: size, height: size }}
      >
        <span className="size-[70%]">
          <Mark color={styles.icon} />
        </span>
      </span>
    </div>
  );
}
