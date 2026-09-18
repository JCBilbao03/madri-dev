import { FileText, Loader2, MailPlus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmailComposeModal, type ComposeSeed } from '@/components/admin/email/EmailComposeModal';
import { EmailCreateLeadModal } from '@/components/admin/email/EmailCreateLeadModal';
import { EmailMessageView } from '@/components/admin/email/EmailMessageView';
import { EmailThreadList } from '@/components/admin/email/EmailThreadList';
import { AdminPage } from '@/components/admin/AdminPage';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { Button } from '@/components/ui/Button';
import { useAdminChrome } from '@/hooks/useAdminChrome';
import { useInboxMessages } from '@/hooks/useInboxMessages';
import { fetchAdmins } from '@/lib/adminData';
import { getMailMessage, sendMail, syncMail } from '@/lib/adminEmail';
import { authErrorMessage } from '@/lib/auth';
import { leadEmailFromMailMessage } from '@/lib/emailLead';
import { findLeadByEmail } from '@/lib/leads';
import { cn } from '@/lib/utils';
import type { LeadAdminOption } from '@/types/admin';
import { addDaysFromToday } from '@/lib/leadFollowUp';
import { updateLeadFollowUp, updateLeadStatus } from '@/lib/leads';
import type { MailComposePayload, MailMessage } from '@/types/email';

const DESKTOP_MEDIA = '(min-width: 1024px)';
const STALE_SYNC_MS = 10 * 60 * 1000;

function readIsDesktop(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(DESKTOP_MEDIA).matches;
}

export function AdminEmailPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    messages,
    totalCount,
    unreadCount,
    loadedCount,
    hasMore,
    isLoading: isLoadingInbox,
    isLoadingMore,
    error: inboxError,
    lastSyncedAt,
    loadMore,
    resetWindow,
  } = useInboxMessages();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
  const [isDesktop, setIsDesktop] = useState(readIsDesktop);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<'compose' | 'reply'>('compose');
  const [replyTo, setReplyTo] = useState<MailMessage | null>(null);
  const [createLeadMessage, setCreateLeadMessage] = useState<MailMessage | null>(null);
  const [admins, setAdmins] = useState<LeadAdminOption[]>([]);
  const [linkedLeadId, setLinkedLeadId] = useState<string | null>(null);
  const autoSyncAttemptedRef = useRef(false);
  const outreachLeadIdRef = useRef<string | null>(null);

  const composeSeed = useMemo((): ComposeSeed | null => {
    if (searchParams.get('compose') !== '1') {
      return null;
    }

    return {
      to: searchParams.get('to') ?? undefined,
      subject: searchParams.get('subject') ?? undefined,
      body: searchParams.get('body') ?? undefined,
    };
  }, [searchParams]);

  const showMobileDetail = !isDesktop && selectedId !== null;
  const error = actionError || inboxError;

  const openCompose = useCallback(() => {
    setComposeMode('compose');
    setReplyTo(null);
    setComposeOpen(true);
  }, []);

  const runSync = useCallback(async () => {
    setIsSyncing(true);
    setActionError('');

    try {
      await syncMail();
      resetWindow();
    } catch (syncError) {
      setActionError(authErrorMessage(syncError));
    } finally {
      setIsSyncing(false);
    }
  }, [resetWindow]);

  const syncLabel = useMemo(() => {
    if (isSyncing) {
      return 'Syncing…';
    }

    if (!lastSyncedAt) {
      return 'Refresh';
    }

    const syncedDate = new Date(lastSyncedAt);
    if (Number.isNaN(syncedDate.getTime())) {
      return 'Refresh';
    }

    return `Synced ${syncedDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  }, [isSyncing, lastSyncedAt]);

  const toolbar = useMemo(
    () => (
      <AdminPageToolbar>
        <Button to="/admin/email/templates" variant="secondary" size="sm" className="min-h-9">
          <FileText className="size-4" aria-hidden="true" />
          Templates
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void runSync()}
          disabled={isSyncing}
          className="min-h-9"
        >
          {isSyncing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          {syncLabel}
        </Button>
        <Button size="sm" onClick={openCompose} className="min-h-9">
          <MailPlus className="size-4" aria-hidden="true" />
          Compose
        </Button>
      </AdminPageToolbar>
    ),
    [isSyncing, openCompose, runSync, syncLabel],
  );

  useAdminChrome(
    () => ({
      breadcrumbs: [{ label: 'Email' }, { label: 'Inbox' }],
      toolbar,
    }),
    [toolbar],
  );

  useEffect(() => {
    const compose = searchParams.get('compose');
    const threadId = searchParams.get('thread');
    const leadId = searchParams.get('leadId');

    if (compose === '1') {
      setComposeMode('compose');
      setReplyTo(null);
      setComposeOpen(true);
      outreachLeadIdRef.current = leadId;
    }

    if (threadId) {
      setSelectedId(threadId);
    }
  }, [searchParams]);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MEDIA);
    const onChange = () => setIsDesktop(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    void fetchAdmins().then((nextAdmins) => {
      setAdmins(nextAdmins.map((admin) => ({ uid: admin.uid, name: admin.name })));
    });
  }, []);

  useEffect(() => {
    if (!selectedMessage) {
      setLinkedLeadId(null);
      return;
    }

    const email = leadEmailFromMailMessage(selectedMessage);
    if (!email) {
      setLinkedLeadId(null);
      return;
    }

    let active = true;

    void findLeadByEmail(email).then((lead) => {
      if (active) {
        setLinkedLeadId(lead?.leadId ?? null);
      }
    });

    return () => {
      active = false;
    };
  }, [selectedMessage]);

  useEffect(() => {
    if (isLoadingInbox || isSyncing || autoSyncAttemptedRef.current) {
      return;
    }

    const isEmpty = loadedCount === 0 && totalCount === 0;
    const isStale =
      !lastSyncedAt || Date.now() - new Date(lastSyncedAt).getTime() > STALE_SYNC_MS;

    if (isEmpty || (loadedCount === 0 && isStale)) {
      autoSyncAttemptedRef.current = true;
      void runSync();
    }
  }, [isLoadingInbox, isSyncing, lastSyncedAt, loadedCount, totalCount, runSync]);

  const loadMessage = useCallback(async (message: MailMessage) => {
    setSelectedId(message.id);
    setSelectedMessage(message);

    if (message.bodyText.trim().length > 0 || message.bodyHtml?.trim()) {
      return;
    }

    setIsLoadingMessage(true);
    setActionError('');

    try {
      const fullMessage = await getMailMessage(message.id);
      setSelectedMessage(fullMessage);
    } catch (loadError) {
      setActionError(authErrorMessage(loadError));
    } finally {
      setIsLoadingMessage(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedMessage(null);
      return;
    }

    const cached = messages.find((message) => message.id === selectedId);
    if (cached) {
      setSelectedMessage(cached);

      if (!cached.bodyText.trim() && !cached.bodyHtml?.trim()) {
        void loadMessage(cached);
      }
    }
  }, [loadMessage, messages, selectedId]);

  const handleSelect = useCallback(
    (message: MailMessage) => {
      void loadMessage(message);
    },
    [loadMessage],
  );

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setSelectedMessage(null);
  }, []);

  const openReply = useCallback((message: MailMessage) => {
    setComposeMode('reply');
    setReplyTo(message);
    setComposeOpen(true);
  }, []);

  const clearComposeParams = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('compose');
        next.delete('to');
        next.delete('subject');
        next.delete('body');
        next.delete('leadId');
        return next;
      },
      { replace: true },
    );
    outreachLeadIdRef.current = null;
  }, [setSearchParams]);

  const closeCompose = useCallback(() => {
    setComposeOpen(false);
    setReplyTo(null);
    clearComposeParams();
  }, [clearComposeParams]);

  const openCreateLead = useCallback((message: MailMessage) => {
    setCreateLeadMessage(message);
  }, []);

  const closeCreateLead = useCallback(() => {
    setCreateLeadMessage(null);
  }, []);

  const handleLeadCreated = useCallback((leadId: string) => {
    setLinkedLeadId(leadId);
  }, []);

  const handleSend = useCallback(
    async (payload: MailComposePayload) => {
      await sendMail(payload);

      const leadId = outreachLeadIdRef.current;
      if (leadId) {
        await Promise.all([
          updateLeadStatus(leadId, 'contacted'),
          updateLeadFollowUp(leadId, addDaysFromToday(7)),
        ]);
      }

      await runSync();
      clearComposeParams();
    },
    [clearComposeParams, runSync],
  );

  return (
    <AdminPage className="flex min-h-0 flex-1 flex-col overflow-hidden pb-4">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div
          className={cn(
            'flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-line/80 bg-surface',
            'lg:flex-row',
          )}
        >
          <section
            className={cn(
              'flex min-h-0 w-full flex-col overflow-hidden border-line lg:w-[22rem] lg:shrink-0 lg:border-r xl:w-96',
              showMobileDetail ? 'hidden lg:flex' : 'flex',
            )}
            aria-label="Inbox list"
          >
            <EmailThreadList
              messages={messages}
              selectedId={selectedId}
              isLoading={isLoadingInbox}
              isSyncing={isSyncing}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              totalCount={totalCount}
              loadedCount={loadedCount}
              unreadCount={unreadCount}
              onLoadMore={loadMore}
              onSelect={handleSelect}
              className="min-h-0"
            />
          </section>

          <section
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
              !showMobileDetail && !isDesktop ? 'hidden lg:flex' : 'flex',
            )}
            aria-label="Message detail"
          >
            <EmailMessageView
              message={selectedMessage}
              isLoading={isLoadingMessage}
              showBackButton={showMobileDetail}
              linkedLeadId={linkedLeadId}
              onBack={handleBack}
              onReply={openReply}
              onCreateLead={openCreateLead}
              className="min-h-0"
            />
          </section>
        </div>

        {error ? <p className="mt-3 shrink-0 text-sm text-danger">{error}</p> : null}
      </div>

      <EmailComposeModal
        isOpen={composeOpen}
        mode={composeMode}
        replyTo={replyTo}
        seed={composeSeed}
        onClose={closeCompose}
        onSend={handleSend}
      />

      <EmailCreateLeadModal
        isOpen={createLeadMessage !== null}
        message={createLeadMessage}
        admins={admins}
        onClose={closeCreateLead}
        onCreated={(lead) => handleLeadCreated(lead.leadId)}
      />
    </AdminPage>
  );
}
