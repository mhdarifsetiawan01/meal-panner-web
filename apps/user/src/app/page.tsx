"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthGuardLink } from "@/components/auth/auth-guard-link";

function getContextualGreeting(): { title: string; icon: string } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return { title: "Selamat Pagi", icon: "☀️" };
  if (hour >= 11 && hour < 15) return { title: "Selamat Siang", icon: "🌤️" };
  if (hour >= 15 && hour < 18) return { title: "Selamat Sore", icon: "🌆" };
  return { title: "Selamat Malam", icon: "🌙" };
}

export default function Home() {
  const { user, loading } = useAuth();
  const [greeting, setGreeting] = useState({ title: "Selamat Datang", icon: "🍳" });

  useEffect(() => {
    setGreeting(getContextualGreeting());
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Sobat Masak";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Contextual Greeting Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 sm:p-10 shadow-2xl shadow-emerald-900/20">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
              <span>{greeting.icon}</span>
              <span>{greeting.title}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Hai, {loading ? "..." : userName}! Ready Masak Hari Ini?
            </h1>

            <p className="text-emerald-50 text-sm sm:text-base leading-relaxed opacity-95">
              Dapatkan rekomendasi 3 opsi menu harian bernutrisi tinggi yang disesuaikan presisi dengan budget dan bahan masak yang Anda miliki.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              {/* CTA utama — wajib login */}
              <AuthGuardLink
                href="/generate"
                className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 font-bold shadow-lg shadow-black/10 hover:bg-emerald-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <span>✨ Rencanakan Menu AI</span>
                <span>&rarr;</span>
              </AuthGuardLink>

              {/* Edit Preferensi — wajib login */}
              <AuthGuardLink
                href="/onboarding"
                className="px-5 py-3.5 rounded-2xl bg-emerald-700/60 hover:bg-emerald-700/80 text-emerald-50 font-semibold backdrop-blur-md border border-white/20 transition-all text-sm sm:text-base"
              >
                ⚙️ Edit Preferensi
              </AuthGuardLink>
            </div>
          </div>

          {/* Decorative background shape */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </section>

        {/* Quick Features Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Generator Menu AI — wajib login */}
          <AuthGuardLink
            href="/generate"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🤖
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Generator Menu AI
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Buat 3 opsi resep masakan dalam hitungan detik.
            </p>
          </AuthGuardLink>

          {/* Daftar Belanja — wajib login */}
          <AuthGuardLink
            href="/shopping-list"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🛒
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Daftar Belanja
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Checklist otomatis bahan masakan pilihan Anda.
            </p>
          </AuthGuardLink>

          {/* Pantau Harga — wajib login */}
          <AuthGuardLink
            href="/price-watch"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🏷️
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Pantau Harga
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cek &amp; kirim update harga bahan makanan di kotamu.
            </p>
          </AuthGuardLink>

          {/* Riwayat Menu — wajib login */}
          <AuthGuardLink
            href="/history"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              📜
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Riwayat Menu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lihat kembali daftar rekomendasi menu sebelumnya.
            </p>
          </AuthGuardLink>
        </section>
      </main>
    </div>
  );
}
