import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthLoading } from '@/components/rental/AuthLoading';
import { useAuthStore } from '@/store/useAuthStore';
import { dashboardPath, type SignupRole } from '@/types/rental';

interface RentalRoleGateProps {
  allow: SignupRole | 'any';
  children: ReactNode;
}

/** Demo guests pass through; signed-in users stay on routes that match their role. */
export function RentalRoleGate({ allow, children }: RentalRoleGateProps) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!user || allow === 'any') {
    return children;
  }

  if (role === 'admin' || role === allow) {
    return children;
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={dashboardPath(role)} replace />;
}
