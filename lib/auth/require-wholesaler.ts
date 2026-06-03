import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/routes";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Returns the authenticated user's id as wholesaler_id.
 * Products.wholesaler_id is scoped to auth.users.id for wholesaler accounts.
 */
export async function requireWholesaler(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError("You must be signed in.", "UNAUTHORIZED");
  }

  const role = user.user_metadata?.role as UserRole | undefined;
  if (role !== "wholesaler") {
    throw new AuthError("Wholesaler access only.", "FORBIDDEN");
  }

  return user.id;
}
