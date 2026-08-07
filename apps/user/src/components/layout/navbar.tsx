"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-slate-100">
          <span className="text-2xl">🍳</span>
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            MasakApa
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/price-watch"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1"
          >
            Pantau Harga
          </Link>
          <Link
            href="/history"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1"
          >
            Riwayat
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/subscription"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold shadow-sm hover:opacity-95"
              >
                <span>⭐ Upgrade</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
