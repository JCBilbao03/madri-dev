import { AppLogo } from '@/components/brand/AppLogo';
import type { WorkPreviewVariant } from '@/data/works';
import { cn } from '@/lib/utils';

interface WorkPreviewProps {
  variant: WorkPreviewVariant;
  category: string;
  appSlug: string;
  className?: string;
}

const previewTone: Record<WorkPreviewVariant, string> = {
  rental: 'from-[#F26A3A]/10 via-transparent to-transparent',
  cleaning: 'from-[#6BA3F7]/10 via-transparent to-transparent',
  inventory: 'from-[#3DD6C6]/10 via-transparent to-transparent',
};

export function WorkPreview({ variant, category, appSlug, className }: WorkPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative aspect-[4/3] overflow-hidden border-b border-line bg-surface transition-colors duration-300 group-hover:bg-surface-raised/40',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-300 group-hover:opacity-100',
          previewTone[variant],
        )}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-between p-5 sm:p-6">
        <AppLogo variant={variant} size={72} className="mt-2 transition-transform duration-300 group-hover:scale-105" />

        <div className="w-full text-center">
          <p className="text-xs font-medium tracking-[0.16em] text-ink-muted uppercase transition-colors duration-300 group-hover:text-ink">
            {category}
          </p>
          <p className="mt-2 font-display text-lg font-medium tracking-tight text-ink transition-colors duration-300 group-hover:text-accent-soft sm:text-xl">
            {appSlug}
            <span className="text-accent transition-colors duration-300 group-hover:text-ink">_</span>
            app
          </p>
        </div>
      </div>
    </div>
  );
}
