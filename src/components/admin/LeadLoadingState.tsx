import { Loader2 } from 'lucide-react';

export function LeadLoadingState() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface py-16 text-ink-muted shadow-sm"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <p className="text-sm">Loading leads…</p>
    </div>
  );
}
