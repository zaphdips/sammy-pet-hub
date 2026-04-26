/**
 * Supabase client utilities for Sammy Pet Hub
 *
 * WHY: We export a single shared client instance to avoid
 * creating multiple connections (N+1 connection leak risk).
 * The anon key is safe to expose client-side — it only allows
 * what RLS policies explicitly permit. Real secrets (service role key)
 * NEVER appear here; they live in server-only API routes.
 *
 * supabaseAdmin: server-only client that bypasses RLS. ONLY use in
 * trusted API routes (e.g. webhooks). Never expose to the browser.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Guard: fail loudly at startup if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Sammy Pet Hub] Missing Supabase environment variables. " +
    "Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

/** Browser/client-side client — respects RLS */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-only admin client — bypasses RLS.
 * ONLY import this in API route files (src/app/api/**).
 * Never use in components or pages.
 */
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "[Sammy Pet Hub] SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Add it to .env.local (never prefix with NEXT_PUBLIC_)."
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Fetch the current user's profile including their role.
 * Returns null if not logged in or no profile found.
 */
export async function getCurrentProfile() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("[Supabase] Session error:", sessionError.message);
    return null;
  }
  if (!session) return null;

  // We fetch ALL profiles for this user to handle the duplicate record bug
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id);

  if (profileError) {
    console.error("[Supabase] Profile fetch error:", profileError.message);
    return null;
  }

  if (!profiles || profiles.length === 0) return null;

  // If there are multiple, prioritize the one that is an admin
  const adminProfile = profiles.find(p => p.role === "admin");
  return adminProfile || profiles[0];
}

/**
 * Check if the current user is an admin.
 * Uses the DB role — NOT a client-side email check.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("[Supabase] Session error:", sessionError.message);
      return false;
    }
    if (!session) {
      console.warn("[Supabase] No active session found during admin check.");
      return false;
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // First check: DB Profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId);

    if (profileError) {
      console.error("[Supabase] Admin profile fetch error:", profileError.message);
    }

    if (profiles && profiles.length > 0) {
      const hasPrivilege = profiles.some(p => p.role === "admin");
      if (hasPrivilege) return true;
      console.warn(`[Supabase] User ${userEmail} has profile(s) but none with admin role.`, profiles);
    } else {
      console.warn(`[Supabase] No profile record found in 'profiles' table for user_id: ${userId}`);
    }

    // Second check: Auth Metadata (app_metadata is set server-side and is trustworthy)
    const metadataRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
    if (metadataRole === "admin") return true;

    // NOTE: Hardcoded email fallbacks have been intentionally removed.
    // To grant admin access, set role = 'admin' in the profiles table
    // OR set app_metadata.role = 'admin' via the Supabase dashboard.
    return false;
  } catch (err) {
    console.error("[Supabase] Fatal error in checkIsAdmin:", err);
    return false;
  }
}
