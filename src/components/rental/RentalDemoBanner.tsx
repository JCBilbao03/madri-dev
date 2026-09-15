import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';
import { useRentalDemoStore } from '@/store/useRentalDemoStore';

function roleButtonClassName(isActive: boolean): string {
  return cn(
    'inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
    isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
  );
}

export function RentalDemoBanner() {
  const demoRole = useRentalDemoStore((state) => state.demoRole);
  const setDemoRole = useRentalDemoStore((state) => state.setDemoRole);

  return (
    <div className="border-t border-accent/20 bg-accent/10">
      <Container className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink">
          <span className="font-medium text-accent-soft">Demo mode</span>
          {' — '}
          Browse listings, save homes, apply, and switch to the landlord view. Progress is stored on this device.
        </p>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="flex flex-1 items-center gap-1 rounded-lg border border-line bg-base/60 p-1 sm:hidden">
            <button type="button" className={roleButtonClassName(demoRole === 'tenant')} onClick={() => setDemoRole('tenant')}>
              Tenant
            </button>
            <button type="button" className={roleButtonClassName(demoRole === 'landlord')} onClick={() => setDemoRole('landlord')}>
              Landlord
            </button>
          </div>
          <Button size="sm" variant="secondary" to="/signup" className="shrink-0">
            Create account
          </Button>
        </div>
      </Container>
    </div>
  );
}
