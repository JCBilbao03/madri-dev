import { memo } from 'react';

import {
  displaySender,
  formatThreadDate,
  initialsFromAddress,
} from '@/components/admin/email/emailFormat';
import { cn } from '@/lib/utils';
import type { MailMessage } from '@/types/email';

interface EmailThreadRowProps {
  message: MailMessage;
  isSelected: boolean;
  onSelect: (message: MailMessage) => void;
}

export const EmailThreadRow = memo(function EmailThreadRow({
  message,
  isSelected,
  onSelect,
}: EmailThreadRowProps) {
  const initials = initialsFromAddress(message.from);

  return (
    <button
      type="button"
      onClick={() => onSelect(message)}
      className={cn(
        'flex w-full gap-3 border-b border-line/60 px-4 py-3 text-left transition-colors duration-150',
        isSelected
          ? 'bg-surface-raised/80 ring-1 ring-inset ring-line/60'
          : 'hover:bg-surface-raised/40',
      )}
    >
      <div
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-lg border text-xs font-medium',
          message.isRead
            ? 'border-line bg-surface-raised text-ink-muted'
            : 'border-accent/30 bg-accent/10 text-accent-soft',
        )}
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'truncate text-sm',
              message.isRead ? 'text-ink-muted' : 'font-medium text-ink',
            )}
          >
            {displaySender(message.from)}
          </p>
          <span className="shrink-0 text-[11px] text-ink-muted tabular-nums">
            {formatThreadDate(message.date)}
          </span>
        </div>
        <p
          className={cn(
            'mt-0.5 truncate text-sm',
            message.isRead ? 'text-ink-muted' : 'font-medium text-ink',
          )}
        >
          {message.subject || '(No subject)'}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{message.snippet}</p>
      </div>

      {!message.isRead ? (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />
      ) : null}
    </button>
  );
});
