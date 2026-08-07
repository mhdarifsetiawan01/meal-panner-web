"use client";

import React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-2xl">
            🛡️
          </div>
          <h1 className="text-2xl font-bold mb-2">Portal Admin MasakApa</h1>
          <p className="text-sm text-slate-400 mb-8">
            Silakan masuk dengan akun Google Admin terverifikasi untuk melanjutkan.
          </p>
          <GoogleLoginButton className="w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-red-900/50 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 text-2xl">
            🚫
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-400">Akses Ditolak</h1>
          <p className="text-sm text-slate-400 mb-4">
            Akun <span className="font-semibold text-slate-200">{user.email}</span> tidak memiliki peran Administrator.
          </p>
          <button
            onClick={() => signOut()}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700"
          >
            Keluar &amp; Ganti Akun
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
