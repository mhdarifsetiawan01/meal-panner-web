"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { useAuth } from "@/components/providers/auth-provider";

export default function AdminLoginPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();

  // Jika sudah login sebagai admin, redirect ke dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace("/");
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-2xl font-bold">
          🛡️
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          MasakApa Admin Portal
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Akses khusus Tim Administrasi &amp; Operasional MasakApa
        </p>

        {user ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border text-left ${
                isAdmin
                  ? "bg-emerald-950/40 border-emerald-800"
                  : "bg-red-950/40 border-red-800"
              }`}
            >
              <p
                className={`text-xs font-semibold mb-1 ${
                  isAdmin ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isAdmin ? "Status: Admin Terverifikasi ✓" : "Status: Bukan Admin"}
              </p>
              <p className="text-sm font-medium text-slate-200">{user.email}</p>
              {!isAdmin && (
                <p className="text-xs text-slate-500 mt-2">
                  Akun ini tidak terdaftar sebagai administrator. Hubungi pengelola sistem.
                </p>
              )}
            </div>
            <button
              onClick={() => signOut()}
              className="w-full py-3 px-4 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 font-medium transition-colors"
            >
              Keluar Sesi
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <GoogleLoginButton className="w-full" />
            <p className="text-xs text-slate-500">
              Pastikan akun Google Anda terdaftar dalam whitelist administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
