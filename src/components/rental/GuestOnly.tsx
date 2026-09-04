import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthLoading } from '@/components/rental/AuthLoading';
import { useAuthStore } from '@/store/useAuthStore';
import { dashboardPath } from '@/types/rental';

interface GuestOnlyProps {
  children: ReactNode;
}

export function GuestOnly({ children }: GuestOnlyProps) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (user && role) {
    return <Navigate to={dashboardPath(role)} replace />;
  }

  return children;
}
