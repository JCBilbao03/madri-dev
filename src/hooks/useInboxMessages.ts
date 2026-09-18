import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { INBOX_BATCH_SIZE } from '@/components/admin/email/emailInbox';
import { db } from '@/lib/firebase';
import { formatFirestoreError } from '@/lib/firestoreErrors';
import type { MailMessage } from '@/types/email';

const INBOX_BASE_QUERY = query(
  collection(db, 'mailMessages'),
  where('mailbox', '==', 'INBOX'),
  orderBy('date', 'desc'),
);

function asMailAddress(value: unknown): MailMessage['from'] {
  if (!value || typeof value !== 'object') {
    return { name: '', address: '' };
  }

  const record = value as Record<string, unknown>;
  return {
    name: typeof record.name === 'string' ? record.name : '',
    address: typeof record.address === 'string' ? record.address : '',
  };
}

function asMailAddressList(value: unknown): MailMessage['to'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => asMailAddress(item)).filter((item) => item.address.length > 0);
}

function parseMailMessage(id: string, data: DocumentData): MailMessage | null {
  if (typeof data.uid !== 'number' || data.mailbox !== 'INBOX') {
    return null;
  }

  return {
    id,
    uid: data.uid,
    mailbox: 'INBOX',
    messageId: typeof data.messageId === 'string' ? data.messageId : '',
    inReplyTo: typeof data.inReplyTo === 'string' ? data.inReplyTo : '',
    references: Array.isArray(data.references)
      ? data.references.filter((item): item is string => typeof item === 'string')
      : [],
    from: asMailAddress(data.from),
    to: asMailAddressList(data.to),
    cc: asMailAddressList(data.cc),
    subject: typeof data.subject === 'string' ? data.subject : '',
    snippet: typeof data.snippet === 'string' ? data.snippet : '',
    bodyText: typeof data.bodyText === 'string' ? data.bodyText : '',
    bodyHtml: typeof data.bodyHtml === 'string' ? data.bodyHtml : undefined,
    date: typeof data.date === 'string' ? data.date : '',
    isRead: data.isRead === true,
    direction: data.direction === 'outbound' ? 'outbound' : 'inbound',
    syncedAt: typeof data.syncedAt === 'string' ? data.syncedAt : '',
  };
}

interface UseInboxMessagesResult {
  messages: MailMessage[];
  totalCount: number | null;
  unreadCount: number;
  loadedCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string;
  lastSyncedAt: string | null;
  loadMore: () => void;
  resetWindow: () => void;
}

export function useInboxMessages(): UseInboxMessagesResult {
  const [fetchLimit, setFetchLimit] = useState(INBOX_BATCH_SIZE);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const totalCountRef = useRef<number | null>(null);
  totalCountRef.current = totalCount;

  useEffect(() => {
    let active = true;

    void getCountFromServer(INBOX_BASE_QUERY)
      .then((snapshot) => {
        if (active) {
          setTotalCount(snapshot.data().count);
        }
      })
      .catch(() => {
        // Count is optional — inbox still works without it.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const inboxQuery = query(INBOX_BASE_QUERY, limit(fetchLimit));

    const unsubscribe = onSnapshot(
      inboxQuery,
      (snapshot) => {
        const next = snapshot.docs
          .map((docSnap) => parseMailMessage(docSnap.id, docSnap.data()))
          .filter((item): item is MailMessage => item !== null);

        setMessages(next);
        const knownTotal = totalCountRef.current;
        setHasMore(
          knownTotal !== null
            ? next.length < knownTotal
            : snapshot.docs.length >= fetchLimit,
        );
        setIsLoading(false);
        setIsLoadingMore(false);
        setError('');

        const newestSync = next.reduce<string | null>((latest, message) => {
          if (!message.syncedAt) {
            return latest;
          }

          if (!latest || message.syncedAt > latest) {
            return message.syncedAt;
          }

          return latest;
        }, null);

        if (newestSync) {
          setLastSyncedAt(newestSync);
        }
      },
      (snapshotError) => {
        setError(formatFirestoreError(snapshotError, 'Inbox'));
        setIsLoading(false);
        setIsLoadingMore(false);
      },
    );

    return unsubscribe;
  }, [fetchLimit]);

  useEffect(() => {
    if (totalCount === null) {
      return;
    }

    setHasMore(messages.length < totalCount);
  }, [messages.length, totalCount]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setFetchLimit((current) => current + INBOX_BATCH_SIZE);
  }, [hasMore, isLoadingMore]);

  const resetWindow = useCallback(() => {
    setFetchLimit(INBOX_BATCH_SIZE);
  }, []);

  const unreadCount = useMemo(
    () => messages.filter((message) => !message.isRead).length,
    [messages],
  );

  return {
    messages,
    totalCount,
    unreadCount,
    loadedCount: messages.length,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    lastSyncedAt,
    loadMore,
    resetWindow,
  };
}
