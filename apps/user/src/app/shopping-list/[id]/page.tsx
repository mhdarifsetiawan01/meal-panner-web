"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

import { MaintenanceView } from "@/components/common/maintenance-view";

export interface ShoppingListItem {
  ingredient_name?: string;
  name?: string;
  quantity?: string;
  unit?: string;
  is_checked?: boolean;
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
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [copied, setCopied] = useState(false);

  // Price adjustment state
  const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null);
  const [editingPriceInput, setEditingPriceInput] = useState<number | "">("");
  const [rewardNotice, setRewardNotice] = useState<string | null>(null);

  const fetchShoppingList = async () => {
    setLoading(true);
    setErrorMsg(null);
    setIsMaintenance(false);

    const res = await fetchWithAuth<ShoppingListDetail>(`/shopping-list/${id}`);
    setLoading(false);

    if (res.error) {
      if (res.error.isMaintenance) {
        setIsMaintenance(true);
        return;
      }
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

    const item = shoppingList.items[index];
    if (!item) return;

    const ingredientName = item.ingredient_name || item.name;
    if (!ingredientName) return;

    const currentChecked = !!(item.is_checked ?? item.checked);
    const newChecked = !currentChecked;

    // Optimistic UI update
    const updatedItems = [...shoppingList.items];
    updatedItems[index] = {
      ...updatedItems[index],
      is_checked: newChecked,
      checked: newChecked,
    };
    setShoppingList({ ...shoppingList, items: updatedItems });

    const res = await fetchWithAuth(`/shopping-list/${id}/item`, {
      method: "PATCH",
      body: JSON.stringify({
        ingredient_name: ingredientName,
        is_checked: newChecked,
      }),
    });

    if (res.error) {
      // Revert on error
      updatedItems[index] = {
        ...updatedItems[index],
        is_checked: currentChecked,
        checked: currentChecked,
      };
      setShoppingList({ ...shoppingList, items: updatedItems });
      alert("Gagal memperbarui status item: " + res.error.message);
    }
  };

  const handleSaveItemPrice = async (index: number) => {
    if (!shoppingList) return;
    const item = shoppingList.items[index];
    if (!item) return;

    const ingredientName = item.ingredient_name || item.name;
    if (!ingredientName || editingPriceInput === "" || Number(editingPriceInput) < 0) return;

    const newPrice = Number(editingPriceInput);
    const oldPrice = item.estimated_price || 0;

    // Optimistic update
    const updatedItems = [...shoppingList.items];
    updatedItems[index] = {
      ...updatedItems[index],
      estimated_price: newPrice,
    };
    const priceDiff = newPrice - oldPrice;
    const newTotal = (shoppingList.total_estimated_price || 0) + priceDiff;

    setShoppingList({
      ...shoppingList,
      total_estimated_price: newTotal,
      items: updatedItems,
    });
    setEditingPriceIndex(null);

    const res = await fetchWithAuth<{
      new_total_estimated_price: number;
    }>(`/shopping-list/${id}/item-price`, {
      method: "PATCH",
      body: JSON.stringify({
        ingredient_name: ingredientName,
        real_price: newPrice,
      }),
    });

    if (res.error) {
      // Revert on error
      updatedItems[index] = {
        ...updatedItems[index],
        estimated_price: oldPrice,
      };
      setShoppingList({
        ...shoppingList,
        total_estimated_price: (shoppingList.total_estimated_price || 0),
        items: updatedItems,
      });
      alert("Gagal memperbarui harga item: " + res.error.message);
      return;
    }

    setRewardNotice(`✏️ Harga "${ingredientName}" diperbarui ke Rp ${newPrice.toLocaleString("id-ID")}.`);
    setTimeout(() => setRewardNotice(null), 3000);
  };

  const handleCopyText = () => {
    if (!shoppingList) return;

    let text = `🛒 *Daftar Belanja — ${shoppingList.recipe_name || "MasakApa"}*\n\n`;
    shoppingList.items.forEach((item) => {
      const isChecked = !!(item.is_checked ?? item.checked);
      const name = item.ingredient_name || item.name || "Bahan";
      const status = isChecked ? "✅" : "⏹️";
      const qtyStr = item.quantity ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ""})` : "";
      const priceStr = item.estimated_price ? ` (~Rp ${item.estimated_price.toLocaleString("id-ID")})` : "";
      text += `${status} ${name}${qtyStr}${priceStr}\n`;
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

  if (isMaintenance && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <MaintenanceView onRetry={fetchShoppingList} />
        </main>
      </div>
    );
  }

  if (errorMsg || !shoppingList) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
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
  const checkedCount = items.filter((i) => i.is_checked ?? i.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const totalEstimatedPrice = shoppingList.total_estimated_price || items.reduce((acc, i) => acc + (i.estimated_price || 0), 0);
  const remainingEstimatedPrice = items
    .filter((i) => !(i.is_checked ?? i.checked))
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

          {/* Reward Notice Banner */}
          {rewardNotice && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-pulse">
              <span>{rewardNotice}</span>
              <button onClick={() => setRewardNotice(null)} className="text-xs opacity-70 hover:opacity-100">
                ✕
              </button>
            </div>
          )}

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
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Item Bahan Masakan
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold">
                💡 Klik ✏️ untuk lapor harga riil pasar (+100 Credit)
              </span>
            </div>

            {items.map((item, index) => {
              const isChecked = !!(item.is_checked ?? item.checked);
              const name = item.ingredient_name || item.name || "Bahan";
              const qtyStr = item.quantity ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ""})` : "";
              const isEditingThisPrice = editingPriceIndex === index;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isChecked
                      ? "bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-slate-900 dark:text-slate-100 shadow-sm"
                  }`}
                >
                  <div
                    className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                    onClick={() => handleToggleItem(index)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`font-semibold text-sm ${isChecked ? "line-through" : ""}`}>
                      {name}{qtyStr}
                    </span>
                  </div>

                  {/* Price & Adjustment Input */}
                  <div className="flex items-center gap-2">
                    {isEditingThisPrice ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-slate-400 font-bold">Rp</span>
                        <input
                          type="number"
                          placeholder="Harga riil..."
                          value={editingPriceInput}
                          onChange={(e) => setEditingPriceInput(e.target.value === "" ? "" : Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveItemPrice(index);
                            if (e.key === "Escape") setEditingPriceIndex(null);
                          }}
                          className="w-24 px-2 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveItemPrice(index)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                          title="Simpan"
                        >
                          ✓ Simpan
                        </button>
                        <button
                          onClick={() => setEditingPriceIndex(null)}
                          className="px-2 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold"
                          title="Batal"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isChecked ? "text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                          {item.estimated_price ? `Rp ${item.estimated_price.toLocaleString("id-ID")}` : "-"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPriceIndex(index);
                            setEditingPriceInput(item.estimated_price || 0);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-950/30 transition-all text-xs font-semibold"
                          title="Edit harga riil pasar"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
