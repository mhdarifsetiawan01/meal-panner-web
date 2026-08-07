"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export interface PriceWatchItem {
  id: number;
  campaign_id: number;
  ingredient_name: string;
  unit: string;
  icon_url?: string;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  items: PriceWatchItem[];
}

export interface UserSubmission {
  id: number;
  watch_item_id: number;
  ingredient_name: string;
  unit: string;
  campaign_title: string;
  city_id: number;
  submitted_price: number;
  status: "pending" | "validated" | "rejected";
  created_at: string;
}

export interface CreditSummary {
  balance: number;
}

export default function PriceWatchPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"campaigns" | "my-submissions">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mySubmissions, setMySubmissions] = useState<UserSubmission[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Submit Modal State
  const [selectedItem, setSelectedItem] = useState<PriceWatchItem | null>(null);
  const [submittedPrice, setSubmittedPrice] = useState<number>(15000);
  const [cityId, setCityId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);

    const [campRes, subRes, credRes] = await Promise.all([
      fetchWithAuth<Campaign[]>("/price-watch/campaigns/active"),
      fetchWithAuth<UserSubmission[]>("/price-watch/submissions/me"),
      fetchWithAuth<CreditSummary>("/credits/me"),
    ]);

    setLoading(false);

    if (campRes.data) setCampaigns(campRes.data);
    if (subRes.data) setMySubmissions(subRes.data);
    if (credRes.data) setCreditBalance(credRes.data.balance || 0);
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleSubmitPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const payload = {
      watch_item_id: selectedItem.id,
      submitted_price: submittedPrice,
      city_id: cityId,
    };

    const res = await fetchWithAuth("/price-watch/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setSuccessMsg(`Terima kasih! Laporan harga ${selectedItem.ingredient_name} berhasil dikirim.`);
    setSelectedItem(null);
    fetchData();
  };

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
        {/* Header & Credit Balance Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pantau Harga Komunitas 🏷️
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Bantu update harga bahan makanan di pasar kotamu dan dapatkan kredit komunitas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center gap-3 self-start sm:self-auto">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Saldo Kredit Komunitas
              </p>
              <p className="text-lg font-extrabold text-amber-900 dark:text-amber-200">
                {creditBalance} Credit
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-xs underline">Tutup</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-bold">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`pb-3 px-4 transition-all ${
              activeTab === "campaigns"
                ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            📋 Kampanye &amp; Item Aktif
          </button>
          <button
            onClick={() => setActiveTab("my-submissions")}
            className={`pb-3 px-4 transition-all ${
              activeTab === "my-submissions"
                ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            ✍️ Riwayat Laporan Saya ({mySubmissions.length})
          </button>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {campaigns.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                Belum ada kampanye pemantauan harga yang aktif saat ini.
              </div>
            ) : (
              campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {camp.title}
                    </h3>
                    {camp.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {camp.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {camp.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {item.ingredient_name}
                          </p>
                          <p className="text-xs text-slate-500">Satuan: {item.unit}</p>
                        </div>

                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          + Laporkan Harga
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: My Submissions */}
        {activeTab === "my-submissions" && (
          <div className="space-y-4">
            {mySubmissions.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                Anda belum pernah membagikan laporan harga. Silakan pilih item dari tab Kampanye Aktif!
              </div>
            ) : (
              mySubmissions.map((sub) => {
                const statusBadges = {
                  pending: { label: "🟡 Menunggu Validasi", class: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" },
                  validated: { label: "🟢 Valid (+1 Credit)", class: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" },
                  rejected: { label: "🔴 Ditolak", class: "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300" },
                };
                const badge = statusBadges[sub.status] || statusBadges.pending;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {sub.ingredient_name}
                        </span>
                        <span className="text-xs text-slate-500">({sub.unit})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sub.campaign_title} • Kota ID {sub.city_id}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        Rp {sub.submitted_price.toLocaleString("id-ID")}
                      </span>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Submit Price Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Form Laporan Harga
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedItem.ingredient_name} ({selectedItem.unit})
                </h2>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitPrice} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kota Lokasi Pasar
                  </label>
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value={1}>Jakarta Selatan (DKI Jakarta)</option>
                    <option value={2}>Jakarta Timur (DKI Jakarta)</option>
                    <option value={3}>Surabaya (Jawa Timur)</option>
                    <option value={4}>Bandung (Jawa Barat)</option>
                    <option value={5}>Medan (Sumatera Utara)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Per {selectedItem.unit} (Rp)
                  </label>
                  <input
                    type="number"
                    value={submittedPrice}
                    onChange={(e) => setSubmittedPrice(Number(e.target.value))}
                    step={500}
                    min={500}
                    required
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                  💡 Laporan harga akan divalidasi dengan algoritma konsensus komunitas. Laporan yang terverifikasi valid akan mendapatkan imbalan +1 Credit Komunitas.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      <span>Mengirim Laporan...</span>
                    </>
                  ) : (
                    <span>Kirim Laporan Harga &rarr;</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
