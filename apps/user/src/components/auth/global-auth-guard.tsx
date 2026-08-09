"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

// Daftar path yang TIDAK memerlukan autentikasi di user app
const PUBLIC_PATHS = ["/login", "/auth/callback"];

/**
 * GlobalAuthGuard — proteksi semua halaman di user app.
 *
 * Aturan:
 * 1. Jika loading → tampilkan spinner
 * 2. Jika belum login & bukan di halaman publik → redirect ke /login?next=<path>
 * 3. Jika sudah login → render children
 */
export function GlobalAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      // Simpan tujuan asli di query param `next` agar bisa redirect balik setelah login
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, isPublicPath, pathname, router]);

  // Tampilkan spinner saat loading session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  // Belum login & sedang menuju halaman protected → blank sementara redirect berjalan
  if (!user && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
