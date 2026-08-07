import { createClient, SupabaseClient } from "@supabase/supabase-js";

// =============================================================
// Supabase client helper — dipakai oleh apps/user dan apps/admin
// Env vars WAJIB diset di masing-masing app:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
// =============================================================

let _client: SupabaseClient | null = null;

/**
 * Lazy singleton Supabase browser client.
 * Panggil ini di client component / hooks, BUKAN di server component.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "[supabase-client] NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset. " +
        "Pastikan .env.local sudah dikonfigurasi."
    );
  }

  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return _client;
}

/**
 * Ambil JWT dari sesi Supabase yang sedang aktif.
 * Dipakai sebagai Authorization header ke backend Go.
 *
 * @returns Bearer token string atau null jika belum login
 */
export async function getSessionToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Sign in dengan Google OAuth — redirect ke Supabase OAuth flow.
 */
export async function signInWithGoogle(redirectTo?: string): Promise<void> {
  const supabase = getSupabaseClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo ?? `${origin}/auth/callback`,
    },
  });
}

/**
 * Sign out dari Supabase.
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

// Re-export tipe Supabase yang sering dipakai
export type { SupabaseClient, Session, User as SupabaseUser } from "@supabase/supabase-js";
