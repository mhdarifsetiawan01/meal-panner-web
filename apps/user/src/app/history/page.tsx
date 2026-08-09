"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

import { MaintenanceView } from "@/components/common/maintenance-view";

export interface HistoryItem {
  id?: number;
  meal_selection_id?: number;
  recipe_id: number;
  recipe_name: string;
  recipe_description?: string;
  selected_date: string;
  total_estimated_price: number;
  shopping_list_id?: number;
  created_at: string;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUpgradeRequired, setIsUpgradeRequired] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (historyId: number, recipeName: string) => {
    if (!historyId) return;
    if (!window.confirm(`Hapus "${recipeName}" dari riwayat masakan Anda?`)) {
      return;
    }

    setDeletingId(historyId);
    const res = await fetchWithAuth(`/history/${historyId}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (res.error) {
      alert("Gagal menghapus riwayat: " + res.error.message);
      return;
    }

    setHistoryItems((prev) => prev.filter((item) => (item.meal_selection_id || item.id) !== historyId));
  };

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg(null);
    setIsUpgradeRequired(false);
    setIsMaintenance(false);

    const res = await fetchWithAuth<{ history?: HistoryItem[]; items?: HistoryItem[] }>("/history?limit=20&offset=0");
    setLoading(false);

    if (res.error) {
      if (res.error.isMaintenance) {
        setIsMaintenance(true);
        return;
      }
      if (
        res.error.message.toLowerCase().includes("upgrade") ||
        res.error.message.toLowerCase().includes("premium") ||
        res.error.message.includes("403")
      ) {
        setIsUpgradeRequired(true);
      } else {
        setErrorMsg(res.error.message);
      }
      return;
    }

    const items = res.data?.history || res.data?.items || [];
    setHistoryItems(items);
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchHistory();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Riwayat Pilihan Menu 📜
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daftar seluruh menu masakan yang pernah Anda pilih &amp; rencanakan sebelumnya.
          </p>
        </div>

        {/* Premium Upgrade Required Screen */}
        {isUpgradeRequired && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
              👑
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-bold">Fitur Eksklusif Member Premium</h2>
              <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                Riwayat pilihan menu disimpan tanpa batas untuk pelanggan Premium. Upgrade sekarang untuk membuka akses riwayat lengkap dan kuota AI generate 999x/hari.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-amber-900 font-extrabold shadow-lg hover:bg-amber-50 transition-all text-sm"
              >
                <span>⭐ Upgrade ke Premium (Rp 29.000)</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Maintenance State */}
        {isMaintenance && !loading && (
          <MaintenanceView onRetry={fetchHistory} />
        )}

        {/* Generic Error */}
        {errorMsg && !isUpgradeRequired && !isMaintenance && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Empty History State */}
        {!isUpgradeRequired && !errorMsg && historyItems.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
            <div className="text-4xl">🍽️</div>
            <h3 className="text-lg font-bold">Belum Ada Riwayat Menu</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Anda belum memilih rekomendasi menu dari generator AI. Mulai buat rencana menu pertamamu hari ini!
            </p>
            <div className="pt-2">
              <Link
                href="/generate"
                className="inline-block px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                ✨ Rencanakan Menu Sekarang
              </Link>
            </div>
          </div>
        )}

        {/* History Items Grid */}
        {!isUpgradeRequired && historyItems.length > 0 && (
          <div className="space-y-4">
            {historyItems.map((item, idx) => {
              const historyId = item.meal_selection_id || item.id || idx;
              return (
                <div
                  key={historyId}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {new Date(item.selected_date || item.created_at).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {item.recipe_name}
                    </h3>
                    {item.recipe_description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.recipe_description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      Rp {item.total_estimated_price.toLocaleString("id-ID")}
                    </span>

                    {item.shopping_list_id ? (
                      <Link
                        href={`/shopping-list/${item.shopping_list_id}`}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                      >
                        🛒 Lihat Daftar Belanja
                      </Link>
                    ) : null}

                    <button
                      onClick={() => handleDelete(Number(historyId), item.recipe_name)}
                      disabled={deletingId === Number(historyId)}
                      title="Hapus dari riwayat"
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-xs font-bold disabled:opacity-50 flex items-center justify-center min-w-[36px]"
                    >
                      {deletingId === Number(historyId) ? "⌛" : "🗑️"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
