"use client";

import React from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader />

          <main className="p-6 sm:p-8 space-y-8 max-w-6xl">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Dashboard Administrasi 📊
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Ringkasan modul operasional sistem MasakApa Platform.
              </p>
            </div>

            {/* Quick Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">PRICE WATCH</span>
                  <span className="text-xl">🏷️</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-100">Kampanye Aktif</p>
                <Link href="/price-watch" className="text-xs text-indigo-400 font-semibold hover:underline inline-block pt-1">
                  Kelola Kampanye &rarr;
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">MONITORING</span>
                  <span className="text-xl">📈</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-100">Laporan Harga</p>
                <Link href="/submissions" className="text-xs text-indigo-400 font-semibold hover:underline inline-block pt-1">
                  Cek Submission &rarr;
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">SUBSCRIPTIONS</span>
                  <span className="text-xl">💎</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-100">Paket &amp; Kupon</p>
                <Link href="/subscriptions" className="text-xs text-indigo-400 font-semibold hover:underline inline-block pt-1">
                  Kelola Plan &rarr;
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">AI CONFIG</span>
                  <span className="text-xl">🤖</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-100">OpenAI / Groq</p>
                <Link href="/ai-config" className="text-xs text-indigo-400 font-semibold hover:underline inline-block pt-1">
                  Switch Provider &rarr;
                </Link>
              </div>
            </div>

            {/* Platform Status Banner */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>⚡ System Health &amp; Services</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <p className="text-slate-400">Backend API</p>
                  <p className="text-emerald-400 font-bold">● Running (Port 8080)</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <p className="text-slate-400">Database PostgreSQL</p>
                  <p className="text-emerald-400 font-bold">● Connected (Port 5434)</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <p className="text-slate-400">Consensus Job Engine</p>
                  <p className="text-indigo-400 font-bold">● Ready (POST trigger active)</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
