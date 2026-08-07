"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@masakapa/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Supabase secara otomatis mendeteksi token di URL hash/query dan menyimpan sesi
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/");
      } else {
        // Tunggu sebentar agar SDK memproses URL hash terlebih dahulu
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-2xl animate-bounce">
          🍳
        </div>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Menyiapkan sesi Anda...
        </p>
      </div>
    </div>
  );
}
