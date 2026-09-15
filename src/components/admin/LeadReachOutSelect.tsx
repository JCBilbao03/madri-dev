import { useCallback } from 'react';

import { addDaysFromToday, presetOptionLabel, REACH_OUT_PRESETS } from '@/lib/leadFollowUp';
import { cn } from '@/lib/utils';

interface LeadReachOutSelectProps {
  leadId: string;
  name: string;
  followUpAt: string;
  onFollowUp: (leadId: string, followUpAt: string) => void | Promise<void>;
  className?: string;
}

export function LeadReachOutSelect({
  leadId,
  name,
  followUpAt,
  onFollowUp,
  className,
}: LeadReachOutSelectProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      if (value === '') {
        void onFollowUp(leadId, '');
        return;
      }

      const days = Number.parseInt(value, 10);
      if (!Number.isFinite(days)) {
        return;
      }

      void onFollowUp(leadId, addDaysFromToday(days));
    },
    [leadId, onFollowUp],
  );

  return (
    <select
      key={`${leadId}-${followUpAt}`}
      aria-label={`Schedule follow-up for ${name}`}
      defaultValue=""
      onChange={handleChange}
      className={cn(
        'h-9 min-w-[10rem] rounded-lg border border-line bg-base px-3 text-sm text-ink focus:border-ink-muted focus:outline-none',
        className,
      )}
    >
      <option value="" disabled hidden>
        {followUpAt ? `Scheduled · ${followUpAt}` : 'Reach out…'}
      </option>
      <option value="">Clear follow-up</option>
      {REACH_OUT_PRESETS.map((preset) => (
        <option key={preset.days} value={preset.days}>
          {presetOptionLabel(preset.days)}
        </option>
      ))}
    </select>
  );
}
