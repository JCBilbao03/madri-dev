import { InventoryPanel } from '@/components/inventory/InventoryPanel';

export function InventoryLoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan-muted)] uppercase">
        Syncing catalog // firestore
      </p>
      <ul className="grid gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index}>
            <InventoryPanel className="flex items-center gap-4 px-4 py-4">
              <span className="size-14 shrink-0 bg-surface-raised" />
              <span className="flex-1 space-y-2">
                <span className="block h-3 w-2/5 bg-surface-raised" />
                <span className="block h-3 w-1/4 bg-surface-raised/70" />
              </span>
            </InventoryPanel>
          </li>
        ))}
      </ul>
    </div>
  );
}
