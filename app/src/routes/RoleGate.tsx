import { Navigate } from 'react-router-dom';
import { useDemoStore } from '../mock-api/store';
import type { Role } from '../types';

/** Route-level guard: a role that can't use a control never even sees it. */
export function RoleGate({ allow, children }: { allow: Role; children: React.ReactNode }) {
  const role = useDemoStore((s) => s.role);
  if (role !== allow) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
