"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@masakapa/supabase-client";

export default function AdminAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Supabase otomatis mendeteksi code di URL dan menukar dengan session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Redirect ke dashboard admin — GlobalAuthGuard akan verifikasi role
        router.replace("/");
      } else {
        const { data: listener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "SIGNED_IN" && session) {
              listener.subscription.unsubscribe();
              router.replace("/");
            } else if (event === "SIGNED_OUT" || !session) {
              listener.subscription.unsubscribe();
              router.replace("/login");
            }
          }
        );

        // Timeout fallback jika tidak ada event dalam 5 detik
        setTimeout(() => {
          listener.subscription.unsubscribe();
          router.replace("/login?error=timeout");
        }, 5000);
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 text-2xl animate-bounce">
          🛡️
        </div>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto" />
        <p className="text-sm text-slate-400">
          Memverifikasi akses admin...
        </p>
      </div>
    </div>
  );
}
