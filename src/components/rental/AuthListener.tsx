import { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

/**
 * Subscribes to Firebase Auth once for the app lifetime. Renders nothing.
 */
export function AuthListener() {
  const subscribeAuth = useAuthStore((state) => state.subscribeAuth);

  useEffect(() => subscribeAuth(), [subscribeAuth]);

  return null;
}
