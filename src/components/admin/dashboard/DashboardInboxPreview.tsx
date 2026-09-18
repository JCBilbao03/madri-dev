import { Link } from 'react-router-dom';

import {
  displaySender,
  formatThreadDate,
  initialsFromAddress,
} from '@/components/admin/email/emailFormat';
import { cn } from '@/lib/utils';
import type { InboxSnapshot } from '@/lib/adminDashboard';
import type { MailMessage } from '@/types/email';

interface DashboardInboxPreviewProps {
  snapshot: InboxSnapshot | null;
  isLoading: boolean;
}

function InboxPreviewRow({ message }: { message: MailMessage }) {
  return (
    <Link
      to={`/admin/email?thread=${encodeURIComponent(message.id)}`}
      className="flex gap-3 px-4 py-3 transition hover:bg-surface-raised/40 sm:px-5"
    >
      <div
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-lg border text-[11px] font-medium',
          message.isRead
            ? 'border-line bg-surface-raised text-ink-muted'
            : 'border-accent/30 bg-accent/10 text-accent-soft',
        )}
        aria-hidden="true"
      >
        {initialsFromAddress(message.from)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('truncate text-sm', message.isRead ? 'text-ink-muted' : 'font-medium text-ink')}>
            {displaySender(message.from)}
          </p>
          <span className="shrink-0 text-[11px] text-ink-muted tabular-nums">
            {formatThreadDate(message.date)}
          </span>
        </div>
        <p className={cn('mt-0.5 truncate text-xs', message.isRead ? 'text-ink-muted' : 'text-ink')}>
          {message.subject.trim() || '(No subject)'}
        </p>
        {message.snippet ? (
          <p className="mt-0.5 truncate text-xs text-ink-muted">{message.snippet}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function DashboardInboxPreview({ snapshot, isLoading }: DashboardInboxPreviewProps) {
  const unreadLabel = (() => {
    if (!snapshot) {
      return 'Synced inbox';
    }

    if (snapshot.unreadCount > 0) {
      return `${snapshot.unreadCount} unread in recent`;
    }

    if (snapshot.totalCount !== null) {
      return `${snapshot.totalCount} in inbox`;
    }

    return 'Synced inbox';
  })();

  return (
    <section className="rounded-2xl border border-line/80 bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Inbox</h2>
          <p className="mt-0.5 text-xs text-ink-muted">{isLoading ? 'Loading…' : unreadLabel}</p>
        </div>
        <Link
          to="/admin/email"
          className="shrink-0 font-display text-sm font-medium text-accent-soft transition hover:text-ink"
        >
          Open inbox →
        </Link>
      </div>

      {isLoading ? (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">Loading inbox…</p>
      ) : !snapshot || snapshot.recent.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-ink-muted">No messages synced yet.</p>
          <Link
            to="/admin/email"
            className="mt-2 inline-block text-sm font-medium text-accent-soft transition hover:text-ink"
          >
            Sync inbox →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-line/80">
          {snapshot.recent.map((message) => (
            <InboxPreviewRow key={message.id} message={message} />
          ))}
        </div>
      )}
    </section>
  );
}
