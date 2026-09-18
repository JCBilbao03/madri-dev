import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

export async function requireAdmin(request: CallableRequest): Promise<string> {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in to continue.');
  }

  const uid = request.auth.uid;
  const snapshot = await getFirestore().doc(`users/${uid}`).get();
  const role = snapshot.data()?.role;

  if (role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin access is required.');
  }

  return uid;
}
