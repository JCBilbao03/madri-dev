import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthLoading } from '@/components/rental/AuthLoading';
import { useAuthStore } from '@/store/useAuthStore';
import { dashboardPath, type UserRole } from '@/types/rental';

interface RequireAuthProps {
  role?: UserRole;
  children: ReactNode;
}

export function RequireAuth({ role, children }: RequireAuthProps) {
  const user = useAuthStore((state) => state.user);
  const userRole = useAuthStore((state) => state.role);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={dashboardPath(userRole)} replace />;
  }

  return children;
}
