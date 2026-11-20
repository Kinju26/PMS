import type { AuthRole } from "@/lib/auth/roles";
import type { Permission } from "@/lib/auth/rbac";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: AuthRole;
  permissions: readonly Permission[];
};

export type PublicAuthResponse = {
  ok: boolean;
  message?: string;
  mfaRequired?: boolean;
  redirectTo?: string;
};
