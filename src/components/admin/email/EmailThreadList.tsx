import { useVirtualizer } from '@tanstack/react-virtual';
import { Inbox, Loader2, Mail } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { INBOX_ROW_ESTIMATE_PX } from '@/components/admin/email/emailInbox';
import { EmailThreadRow } from '@/components/admin/email/EmailThreadRow';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { MailMessage } from '@/types/email';

const SCROLL_LOAD_THRESHOLD_PX = 120;

interface EmailThreadListProps {
  messages: MailMessage[];
  selectedId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number | null;
  loadedCount: number;
  unreadCount: number;
  onLoadMore: () => void;
  onSelect: (message: MailMessage) => void;
  className?: string;
}

export function EmailThreadList({
  messages,
  selectedId,
  isLoading,
  isSyncing,
  isLoadingMore,
  hasMore,
  totalCount,
  loadedCount,
  unreadCount,
  onLoadMore,
  onSelect,
  className,
}: EmailThreadListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => INBOX_ROW_ESTIMATE_PX,
    overscan: 4,
  });

  const updateScrollState = useCallback(() => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }

    setCanScroll(root.scrollHeight > root.clientHeight + 1);
  }, []);

  const handleScroll = useCallback(() => {
    const root = scrollRef.current;
    if (!root || !hasMore || isLoadingMore) {
      return;
    }

    if (root.scrollHeight <= root.clientHeight + 1) {
      return;
    }

    const distanceFromBottom = root.scrollHeight - root.scrollTop - root.clientHeight;
    if (distanceFromBottom <= SCROLL_LOAD_THRESHOLD_PX) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(root);
    return () => observer.disconnect();
  }, [messages.length, updateScrollState, rowVirtualizer.getTotalSize()]);

  const countLabel =
    totalCount !== null
      ? `${loadedCount} of ${totalCount} loaded`
      : `${loadedCount} loaded`;

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line/60 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Inbox className="size-4 shrink-0 text-accent-soft" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="font-display text-sm font-medium text-ink">Inbox</h2>
            <p className="text-xs text-ink-muted">
              {countLabel}
              {unreadCount > 0 ? ` · ${unreadCount} unread in view` : ''}
            </p>
          </div>
        </div>
        {isSyncing ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-ink-muted" aria-label="Syncing" />
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-ink-muted">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          <p className="text-sm">Loading inbox…</p>
        </div>
      ) : loadedCount === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="grid size-12 place-items-center rounded-xl border border-line bg-surface-raised text-ink-muted">
            <Mail className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-sm font-medium text-ink">No messages yet</h3>
            <p className="mt-1 text-sm text-ink-muted">
              {isSyncing ? 'Syncing mailbox…' : 'Refresh to pull mail from hello@madribuild.com.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
            aria-label="Inbox messages"
          >
            <ul
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const message = messages[virtualRow.index];
                if (!message) {
                  return null;
                }

                return (
                  <li
                    key={message.id}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    className="absolute top-0 left-0 w-full"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <EmailThreadRow
                      message={message}
                      isSelected={message.id === selectedId}
                      onSelect={onSelect}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="shrink-0 border-t border-line/80 bg-surface/80">
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-ink-muted">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Loading more…
              </div>
            ) : hasMore && canScroll ? (
              <p className="py-3 text-center text-xs text-ink-muted">Scroll for more</p>
            ) : hasMore && !canScroll ? (
              <div className="flex justify-center py-3">
                <Button variant="secondary" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
                  Load more
                </Button>
              </div>
            ) : totalCount !== null && loadedCount >= totalCount ? (
              <p className="py-3 text-center text-xs text-ink-muted">End of inbox</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
