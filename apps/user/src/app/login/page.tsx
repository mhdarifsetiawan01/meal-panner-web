"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  // Jika sudah login, redirect ke tujuan asli (dari param `next`) atau ke home
  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [user, loading, router, nextPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-2xl font-bold mb-6">
          🍳
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Selamat Datang di MasakApa
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Rencanakan menu makanan hemat &amp; bergizi dengan bantuan AI
        </p>

        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-left">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                Sesi Aktif
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {user.email}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              Keluar Sesi
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Teruskan `next` ke GoogleLoginButton agar setelah OAuth callback, */}
            {/* Supabase mengarahkan balik ke URL yang benar */}
            <GoogleLoginButton
              className="w-full"
              redirectTo={
                typeof window !== "undefined"
                  ? `${window.location.origin}${nextPath}`
                  : undefined
              }
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Dengan masuk, Anda menyetujui Ketentuan Layanan &amp; Kebijakan Privasi MasakApa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
