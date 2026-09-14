import type { WorkPreviewVariant } from '@/data/works';
import { cn } from '@/lib/utils';

interface WorkPreviewProps {
  variant: WorkPreviewVariant;
  category: string;
  appSlug: string;
  className?: string;
}

const accentShape: Record<WorkPreviewVariant, string> = {
  rental:
    'absolute -right-6 -bottom-8 size-40 rounded-full bg-[#F26A3A]/25 dark:bg-[#F26A3A]/15 sm:-right-4 sm:-bottom-6 sm:size-48 transition-all duration-500 ease-out-soft group-hover:scale-110 group-hover:translate-x-2 group-hover:-translate-y-2',
  cleaning:
    'absolute -left-4 top-1/2 size-32 -translate-y-1/2 rotate-[18deg] rounded-md bg-[#6BA3F7]/25 dark:bg-[#6BA3F7]/15 sm:-left-2 sm:size-40 transition-all duration-500 ease-out-soft group-hover:scale-115 group-hover:-translate-x-2 group-hover:rotate-[28deg]',
};

export function WorkPreview({ variant, category, appSlug, className }: WorkPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative aspect-[2/1] overflow-hidden border-b border-line bg-surface transition-colors duration-300 group-hover:bg-surface-raised/40',
        className,
      )}
    >
      <span className={cn(accentShape[variant], 'z-0')} />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-ink-muted uppercase transition-colors duration-300 group-hover:text-ink">{category}</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight text-ink sm:text-2xl transition-colors duration-300 group-hover:text-accent-soft">
            {appSlug}
            <span className="text-accent transition-colors duration-300 group-hover:text-ink">_</span>
            app
          </p>
        </div>
      </div>
    </div>
  );
}
