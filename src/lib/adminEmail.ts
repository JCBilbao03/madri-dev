import { FirebaseError } from 'firebase/app';
import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase';
import type {
  MailComposePayload,
  MailMessage,
  MailSendResult,
  MailSyncResult,
} from '@/types/email';

function mailErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'functions/unauthenticated':
        return 'Sign in to continue.';
      case 'functions/permission-denied':
        return 'You do not have permission to access email.';
      case 'functions/invalid-argument':
        return error.message || 'Check the email form and try again.';
      case 'functions/not-found':
        return 'That message could not be found.';
      case 'functions/failed-precondition':
        return error.message || 'Email is not configured yet.';
      case 'functions/resource-exhausted':
        return 'Too many requests. Please wait and try again.';
      default:
        return error.message || 'Could not complete that email request.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not complete that email request.';
}

export async function syncMail(): Promise<MailSyncResult> {
  try {
    const callable = httpsCallable<undefined, MailSyncResult>(functions, 'mailSync');
    const result = await callable();
    return result.data;
  } catch (error) {
    throw new Error(mailErrorMessage(error));
  }
}

export async function getMailMessage(messageDocId: string): Promise<MailMessage> {
  try {
    const callable = httpsCallable<{ messageDocId: string }, { message: MailMessage }>(
      functions,
      'mailGetMessage',
    );
    const result = await callable({ messageDocId });
    return result.data.message;
  } catch (error) {
    throw new Error(mailErrorMessage(error));
  }
}

export async function sendMail(payload: MailComposePayload): Promise<MailSendResult> {
  try {
    const callable = httpsCallable<MailComposePayload, MailSendResult>(functions, 'mailSend');
    const result = await callable(payload);
    return result.data;
  } catch (error) {
    throw new Error(mailErrorMessage(error));
  }
}
