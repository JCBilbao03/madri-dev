import { useCallback } from 'react';

import { cn } from '@/lib/utils';

export type DashboardTab = 'user' | 'cleaner';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'user', label: 'User' },
  { id: 'cleaner', label: 'Cleaner' },
];

interface DashboardTabsProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

interface TabButtonProps {
  id: DashboardTab;
  label: string;
  isActive: boolean;
  onSelect: (tab: DashboardTab) => void;
}

function TabButton({ id, label, isActive, onSelect }: TabButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <button
      type="button"
      role="tab"
      id={`dashboard-tab-${id}`}
      aria-selected={isActive}
      aria-controls={`dashboard-panel-${id}`}
      onClick={handleClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-medium transition',
        isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}

export function DashboardTabs({ active, onChange }: DashboardTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Dashboard view"
      className="inline-flex rounded-full border border-line bg-base p-1"
    >
      {TABS.map((tab) => (
        <TabButton key={tab.id} id={tab.id} label={tab.label} isActive={active === tab.id} onSelect={onChange} />
      ))}
    </div>
  );
}
