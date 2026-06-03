import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/routes";
import { AuthError } from "@/lib/auth/require-wholesaler";

/**
 * Returns the authenticated user's id as retailer_id.
 * retailer_inventory.retailer_id is scoped to auth.users.id for retailer accounts.
 */
export async function requireRetailer(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError("You must be signed in.", "UNAUTHORIZED");
  }

  const role = user.user_metadata?.role as UserRole | undefined;
  if (role !== "retailer") {
    throw new AuthError("Retailer access only.", "FORBIDDEN");
  }

  return user.id;
}
