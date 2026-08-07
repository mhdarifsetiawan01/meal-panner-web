"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export interface ShoppingListItem {
  name: string;
  quantity?: string;
  checked?: boolean;
  estimated_price?: number;
}

export interface ShoppingListDetail {
  id: number;
  user_id: string;
  meal_selection_id: number;
  recipe_name?: string;
  total_estimated_price?: number;
  items: ShoppingListItem[];
  created_at: string;
}

export default function ShoppingListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [shoppingList, setShoppingList] = useState<ShoppingListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchShoppingList = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await fetchWithAuth<ShoppingListDetail>(`/shopping-list/${id}`);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    if (res.data) {
      setShoppingList(res.data);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchShoppingList();
    }
  }, [authLoading, user, id]);

  const handleToggleItem = async (index: number) => {
    if (!shoppingList) return;

    const currentChecked = !!shoppingList.items[index]?.checked;
    const newChecked = !currentChecked;

    // Optimistic UI update
    const updatedItems = [...shoppingList.items];
    updatedItems[index] = { ...updatedItems[index], checked: newChecked };
    setShoppingList({ ...shoppingList, items: updatedItems });

    const res = await fetchWithAuth(`/shopping-list/${id}/item`, {
      method: "PATCH",
      body: JSON.stringify({
        item_index: index,
        checked: newChecked,
      }),
    });

    if (res.error) {
      // Revert on error
      updatedItems[index] = { ...updatedItems[index], checked: currentChecked };
      setShoppingList({ ...shoppingList, items: updatedItems });
      alert("Gagal memperbarui status item: " + res.error.message);
    }
  };

  const handleCopyText = () => {
    if (!shoppingList) return;

    let text = `🛒 *Daftar Belanja — ${shoppingList.recipe_name || "MasakApa"}*\n\n`;
    shoppingList.items.forEach((item) => {
      const status = item.checked ? "✅" : "⏹️";
      const priceStr = item.estimated_price ? ` (~Rp ${item.estimated_price.toLocaleString("id-ID")})` : "";
      text += `${status} ${item.name} ${item.quantity ? `(${item.quantity})` : ""}${priceStr}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (errorMsg || !shoppingList) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="text-4xl">❌</div>
          <h2 className="text-xl font-bold">Daftar Belanja Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">{errorMsg || "ID daftar belanja tidak valid."}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm"
          >
            Kembali ke Beranda
          </Link>
        </main>
      </div>
    );
  }

  const items = shoppingList.items || [];
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const totalEstimatedPrice = shoppingList.total_estimated_price || items.reduce((acc, i) => acc + (i.estimated_price || 0), 0);
  const remainingEstimatedPrice = items
    .filter((i) => !i.checked)
    .reduce((acc, i) => acc + (i.estimated_price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Top Navigation Back */}
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          &larr; Lihat Semua Riwayat Menu
        </Link>

        {/* Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Checklist Belanja Pasar &amp; Supermarket
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {shoppingList.recipe_name || "Daftar Belanja Menu"}
              </h1>
            </div>

            <button
              onClick={handleCopyText}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span>{copied ? "✅ Tersalin!" : "📋 Salin Daftar"}</span>
            </button>
          </div>

          {/* Progress & Price Summary Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Progress Belanja ({checkedCount}/{totalCount} item)</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="pt-3 flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 gap-1">
              <span>
                Total Estimasi: <strong className="text-slate-900 dark:text-slate-100 font-extrabold">Rp {totalEstimatedPrice.toLocaleString("id-ID")}</strong>
              </span>
              <span>
                Sisa Harus Dibeli: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">Rp {remainingEstimatedPrice.toLocaleString("id-ID")}</strong>
              </span>
            </div>
          </div>

          {/* Items Checklist List */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Item Bahan Masakan
            </p>

            {items.map((item, index) => {
              const isChecked = !!item.checked;
              return (
                <div
                  key={index}
                  onClick={() => handleToggleItem(index)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-900 dark:text-slate-100 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`font-semibold text-sm ${isChecked ? "line-through" : ""}`}>
                      {item.name} {item.quantity ? `(${item.quantity})` : ""}
                    </span>
                  </div>

                  <span className={`text-xs font-bold ${isChecked ? "text-slate-400" : "text-slate-600 dark:text-slate-300"}`}>
                    {item.estimated_price ? `Rp ${item.estimated_price.toLocaleString("id-ID")}` : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
