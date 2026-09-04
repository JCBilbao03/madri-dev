import { Loader } from 'lucide-react';

export function AuthLoading() {
  return (
    <div className="grid min-h-svh place-items-center bg-base text-ink-muted">
      <p className="flex items-center gap-2 text-sm">
        <Loader className="size-4 animate-spin" aria-hidden="true" />
        Loading session
      </p>
    </div>
  );
}
