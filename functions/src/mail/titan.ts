import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/** GoDaddy Professional Email defaults; override with TITAN_IMAP_HOST / TITAN_SMTP_HOST env. */
const IMAP_HOST_CANDIDATES = [
  process.env.TITAN_IMAP_HOST,
  'imap.secureserver.net',
  'imap.titan.email',
].filter((host): host is string => Boolean(host));

const SMTP_HOST = process.env.TITAN_SMTP_HOST ?? 'smtpout.secureserver.net';
const SMTP_PORT = Number(process.env.TITAN_SMTP_PORT ?? 465);
const IMAP_PORT = Number(process.env.TITAN_IMAP_PORT ?? 993);

export interface TitanCredentials {
  email: string;
  password: string;
}

interface ImapAuthError extends Error {
  authenticationFailed?: boolean;
  responseText?: string;
}

function isAuthFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as ImapAuthError;
  return candidate.authenticationFailed === true || candidate.responseText?.includes('AUTHENTICATIONFAILED') === true;
}

async function connectImap(credentials: TitanCredentials, host: string): Promise<ImapFlow> {
  const client = new ImapFlow({
    host,
    port: IMAP_PORT,
    secure: true,
    auth: {
      user: credentials.email,
      pass: credentials.password,
      loginMethod: 'LOGIN',
    },
    logger: false,
  });

  await client.connect();
  return client;
}

export async function withImapClient<T>(
  credentials: TitanCredentials,
  callback: (client: ImapFlow) => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (const host of IMAP_HOST_CANDIDATES) {
    let client: ImapFlow | undefined;

    try {
      client = await connectImap(credentials, host);
      return await callback(client);
    } catch (error) {
      lastError = error;

      if (isAuthFailure(error)) {
        // Wrong credentials or third-party access disabled — other hosts won't help.
        throw error;
      }

      console.warn(`IMAP connect failed for ${host}`, error);
    } finally {
      if (client) {
        try {
          await client.logout();
        } catch {
          // Ignore logout errors after a failed session.
        }
      }
    }
  }

  throw lastError ?? new Error('Could not connect to any IMAP host.');
}

export function createSmtpTransport(credentials: TitanCredentials): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: credentials.email,
      pass: credentials.password,
    },
  });
}

export const SENT_MAILBOX_CANDIDATES = ['Sent', 'Sent Items', 'Sent Mail', '[Gmail]/Sent Mail'];

export async function resolveSentMailbox(client: ImapFlow): Promise<string | null> {
  for (const candidate of SENT_MAILBOX_CANDIDATES) {
    try {
      const lock = await client.getMailboxLock(candidate);
      lock.release();
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

export function describeMailError(error: unknown): string {
  if (isAuthFailure(error)) {
    return (
      'Titan rejected the mailbox login. Confirm hello@madribuild.com and the password secret, ' +
      'enable third-party access in Titan, then redeploy functions.'
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not connect to the mailbox.';
}
