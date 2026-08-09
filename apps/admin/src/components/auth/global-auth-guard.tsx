"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

// Daftar path yang TIDAK memerlukan autentikasi
const PUBLIC_PATHS = ["/login", "/auth/callback"];

/**
 * GlobalAuthGuard — proteksi semua halaman di admin app.
 *
 * Aturan:
 * 1. Jika loading → tampilkan spinner (jangan redirect dulu)
 * 2. Jika belum login & bukan di halaman publik → redirect ke /login
 * 3. Jika sudah login tapi bukan admin & bukan di /login → blokir, tampilkan pesan
 * 4. Jika sudah login sebagai admin → render children
 */
export function GlobalAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      // Belum login — redirect ke /login
      router.replace("/login");
    }
  }, [user, loading, isPublicPath, router]);

  // Tampilkan spinner saat loading session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Belum login & sedang menuju halaman protected → blank sementara redirect berjalan
  if (!user && !isPublicPath) {
    return null;
  }

  // Sudah login tapi bukan admin & mencoba akses halaman selain /login
  if (user && !isAdmin && !isPublicPath) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-red-900/50 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 text-2xl">
            🚫
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-400">Akses Ditolak</h1>
          <p className="text-sm text-slate-400 mb-4">
            Akun{" "}
            <span className="font-semibold text-slate-200">{user.email}</span>{" "}
            tidak memiliki peran Administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Hubungi pengelola sistem untuk mendapatkan akses.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
