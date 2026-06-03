import type { UserRole } from "@/lib/auth/routes";

export interface AuthUserMetadata {
  role?: UserRole;
  full_name?: string;
}

export interface AuthFormState {
  error?: string;
  success?: string;
}
