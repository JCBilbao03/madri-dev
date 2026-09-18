import { ArrowLeft, Loader2, Mail, Reply, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  displaySender,
  formatAddressList,
  formatMessageDate,
  initialsFromAddress,
} from '@/components/admin/email/emailFormat';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import type { MailMessage } from '@/types/email';

interface EmailMessageViewProps {
  message: MailMessage | null;
  isLoading: boolean;
  showBackButton: boolean;
  linkedLeadId: string | null;
  onBack: () => void;
  onReply: (message: MailMessage) => void;
  onCreateLead: (message: MailMessage) => void;
  className?: string;
}

function buildHtmlSrcDoc(bodyHtml: string, isDark: boolean): string {
  const textColor = isDark ? '#f4f4f5' : '#1a1c22';
  const linkColor = isDark ? '#ffc94a' : '#c77700';
  const mutedColor = isDark ? '#a1a1aa' : '#6b7280';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank"><style>
    html,body{margin:0;padding:0;background:transparent;}
    body{font-family:Roboto,system-ui,-apple-system,sans-serif;line-height:1.65;color:${textColor};font-size:15px;}
    p{margin:0 0 1rem;} p:last-child{margin-bottom:0;}
    a{color:${linkColor};text-decoration:underline;text-underline-offset:2px;}
    img{max-width:100%;height:auto;border-radius:0.375rem;}
    blockquote{margin:0 0 1rem;padding-left:1rem;border-left:3px solid ${mutedColor};}
    ul,ol{margin:0 0 1rem 1.25rem;padding:0;}
  </style></head><body>${bodyHtml}</body></html>`;
}

function HtmlMessageBody({ message, isDark }: { message: MailMessage; isDark: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(240);

  const htmlSrcDoc = useMemo(() => {
    if (!message.bodyHtml?.trim()) {
      return null;
    }

    return buildHtmlSrcDoc(message.bodyHtml, isDark);
  }, [isDark, message.bodyHtml]);

  const syncFrameHeight = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.body) {
      return;
    }

    const nextHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
    setFrameHeight(nextHeight);

    doc.querySelectorAll('img').forEach((image) => {
      image.addEventListener('load', syncFrameHeight, { once: true });
    });
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !htmlSrcDoc) {
      return;
    }

    const handleLoad = () => {
      syncFrameHeight();
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [htmlSrcDoc, syncFrameHeight]);

  useEffect(() => {
    syncFrameHeight();
  }, [htmlSrcDoc, syncFrameHeight]);

  if (!htmlSrcDoc) {
    return null;
  }

  return (
    <iframe
      ref={iframeRef}
      title={`Email body: ${message.subject}`}
      sandbox=""
      srcDoc={htmlSrcDoc}
      scrolling="no"
      className="block w-full border-0 bg-transparent"
      style={{ height: `${frameHeight}px` }}
    />
  );
}

function MessageBody({ message, isDark }: { message: MailMessage; isDark: boolean }) {
  if (message.bodyHtml?.trim()) {
    return <HtmlMessageBody message={message} isDark={isDark} />;
  }

  const body = message.bodyText.trim() || message.snippet || 'No message body.';

  return (
    <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{body}</div>
  );
}

export function EmailMessageView({
  message,
  isLoading,
  showBackButton,
  linkedLeadId,
  onBack,
  onReply,
  onCreateLead,
  className,
}: EmailMessageViewProps) {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={cn('flex flex-1 flex-col items-center justify-center gap-3 text-ink-muted', className)}>
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <p className="text-sm">Loading message…</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className={cn('flex flex-1 flex-col items-center justify-center px-6 text-center', className)}>
        <div className="grid size-14 place-items-center rounded-2xl border border-dashed border-line bg-surface/50 text-ink-muted">
          <Mail className="size-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-sm font-medium text-ink">Select a message</h3>
        <p className="mt-1 max-w-xs text-sm text-ink-muted">
          Choose a conversation from the inbox to read it here.
        </p>
      </div>
    );
  }

  const initials = initialsFromAddress(message.from);
  const senderLabel = displaySender(message.from);

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col bg-surface', className)}>
      <header className="shrink-0 border-b border-line/60 bg-surface px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {showBackButton ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-ink lg:hidden"
              aria-label="Back to inbox"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
          ) : null}

          <div
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 font-sans text-sm font-medium text-accent-soft"
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
              {message.subject || '(No subject)'}
            </h2>
            <p className="mt-1 truncate text-sm text-ink">
              {senderLabel}
              {message.from.address ? (
                <span className="text-ink-muted"> · {message.from.address}</span>
              ) : null}
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {linkedLeadId ? (
              <Button to={`/admin/leads`} variant="secondary" size="sm">
                View lead
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => onCreateLead(message)}>
                <UserPlus className="size-4" aria-hidden="true" />
                Create lead
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => onReply(message)}>
              <Reply className="size-4" aria-hidden="true" />
              Reply
            </Button>
          </div>
        </div>

        <dl className="mt-4 grid gap-2 rounded-lg border border-line/80 bg-base/50 px-4 py-3 text-sm sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">To</dt>
            <dd className="mt-0.5 break-all text-ink">{formatAddressList(message.to)}</dd>
          </div>
          {message.cc.length > 0 ? (
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">Cc</dt>
              <dd className="mt-0.5 break-all text-ink">{formatAddressList(message.cc)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">Date</dt>
            <dd className="mt-0.5 text-ink">{formatMessageDate(message.date)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">Mailbox</dt>
            <dd className="mt-0.5 capitalize text-ink">{message.mailbox.toLowerCase()}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-col gap-2 sm:hidden">
          {linkedLeadId ? (
            <Button to="/admin/leads" variant="secondary" size="sm" className="w-full">
              View lead
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => onCreateLead(message)}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Create lead
            </Button>
          )}
          <Button variant="secondary" size="sm" className="w-full" onClick={() => onReply(message)}>
            <Reply className="size-4" aria-hidden="true" />
            Reply
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        <article className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
          <MessageBody message={message} isDark={isDark} />
        </article>
      </div>
    </div>
  );
}
