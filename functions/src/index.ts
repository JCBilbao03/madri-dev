import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { mailSync } from './callables/mailSync';
export { mailGetMessage } from './callables/mailGetMessage';
export { mailSend } from './callables/mailSend';
export { mailScheduledSync } from './scheduled/mailScheduledSync';
export { recordAppVisitCallable as recordAppVisit } from './callables/recordAppVisit';
