"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      plan_name: "premium",
      coupon_code: couponCode ? couponCode.trim() : undefined,
      payment_gateway: "dummy",
    };

    const res = await fetchWithAuth<{
      user_subscription_id: number;
      payment_transaction_id: number;
      status: string;
    }>("/subscription/subscribe", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setIsSuccess(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800">
            💎 Pilih Paket Langganan
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Masak Hemat Tanpa Batas Kuota
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tingkatkan ke paket Premium untuk menikmati seluruh fitur AI &amp; riwayat menu tanpa batas.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Card */}
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gratis (Free)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Cocok untuk penggunaan harian dasar.
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Rp 0</span>
                <span className="text-xs text-slate-500">/ bulan</span>
              </div>
            </div>

            <ul className="flex-1 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> 3x Generate Menu AI per hari
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Estimasi harga bahan lokal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Checklist belanja interaktif
              </li>
              <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through">
                <span>✕</span> Akses riwayat menu tanpa batas
              </li>
              <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through">
                <span>✕</span> Kuota AI tanpa batas (999x/hari)
              </li>
            </ul>

            <button
              disabled
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-sm cursor-not-allowed"
            >
              Paket Saat Ini
            </button>
          </div>

          {/* Premium Card */}
          <div className="flex flex-col h-full bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-900 rounded-3xl p-8 border-2 border-amber-500 dark:border-amber-600 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
              Paling Populer
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <span>⭐ Premium</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Akses penuh semua fitur unggulan tanpa batas.
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">Rp 29.000</span>
                <span className="text-xs text-slate-500">/ bulan</span>
              </div>
            </div>

            <ul className="flex-1 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 mb-8">
              <li className="flex items-center gap-2 font-medium">
                <span className="text-amber-500 font-bold">✓</span> 999x Generate Menu AI per hari
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="text-amber-500 font-bold">✓</span> Akses riwayat menu masakan tak terbatas
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="text-amber-500 font-bold">✓</span> Estimasi harga real-time prioritas
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="text-amber-500 font-bold">✓</span> Bebas iklan &amp; batas kuota
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="text-amber-500 font-bold">✓</span> Dukungan prioritas 24/7
              </li>
            </ul>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
            >
              Langganan Sekarang (Rp 29.000) &rarr;
            </button>
          </div>
        </div>

        {/* Checkout Modal */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ✕
              </button>

              {isSuccess ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-3xl">
                    🎉
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Pembayaran Berhasil!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Selamat, akun Anda kini beralih ke paket Premium. Nikmati kuota AI 999x/hari dan riwayat menu tak terbatas.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/generate"
                      className="inline-block w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20"
                    >
                      Mulai Generate Menu Premium &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Checkout Langganan
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      Paket Premium — 1 Bulan
                    </h2>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Harga Paket Premium</span>
                      <span>Rp 29.000</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Biaya Layanan</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">GRATIS</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
                      <span>Total Pembayaran</span>
                      <span className="text-amber-600 dark:text-amber-400">Rp 29.000</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kode Kupon Diskon (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: MASAKHEMAT"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                      💳 Simulasi Payment Gateway aktif (Proses pembayaran akan otomatis diverifikasi secara instant).
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          <span>Memproses Pembayaran...</span>
                        </>
                      ) : (
                        <span>Bayar Sekarang (Rp 29.000) &rarr;</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
