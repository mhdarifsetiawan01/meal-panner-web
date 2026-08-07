"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { fetchAdminWithAuth } from "@/lib/api";

export interface PriceWatchItem {
  id: number;
  campaign_id: number;
  ingredient_name: string;
  unit: string;
  icon_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface PriceWatchCampaign {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  items?: PriceWatchItem[];
  created_at: string;
}

export default function AdminPriceWatchPage() {
  const [campaigns, setCampaigns] = useState<PriceWatchCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<PriceWatchCampaign | null>(null);

  // Campaign Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PriceWatchCampaign | null>(null);
  const [campTitle, setCampTitle] = useState("");
  const [campDesc, setCampDesc] = useState("");
  const [campActive, setCampActive] = useState(true);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceWatchItem | null>(null);
  const [itemIngredientName, setItemIngredientName] = useState("");
  const [itemUnit, setItemUnit] = useState("kg");
  const [itemDisplayOrder, setItemDisplayOrder] = useState(1);
  const [itemActive, setItemActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await fetchAdminWithAuth<PriceWatchCampaign[]>("/admin/price-watch/campaigns?include_inactive=true");
    setLoading(false);
    if (res.data) {
      setCampaigns(res.data);
    }
  };

  const fetchCampaignDetail = async (id: number) => {
    const res = await fetchAdminWithAuth<PriceWatchCampaign>(`/admin/price-watch/campaigns/${id}`);
    if (res.data) {
      setSelectedCampaign(res.data);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Campaign Actions
  const openCreateCampaignModal = () => {
    setEditingCampaign(null);
    setCampTitle("");
    setCampDesc("");
    setCampActive(true);
    setErrorMsg(null);
    setIsCampaignModalOpen(true);
  };

  const openEditCampaignModal = (c: PriceWatchCampaign) => {
    setEditingCampaign(c);
    setCampTitle(c.title);
    setCampDesc(c.description);
    setCampActive(c.is_active);
    setErrorMsg(null);
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      title: campTitle,
      description: campDesc,
      is_active: campActive,
    };

    const endpoint = editingCampaign
      ? `/admin/price-watch/campaigns/${editingCampaign.id}`
      : `/admin/price-watch/campaigns`;
    const method = editingCampaign ? "PUT" : "POST";

    const res = await fetchAdminWithAuth(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setIsCampaignModalOpen(false);
    fetchCampaigns();
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kampanye ini?")) return;

    const res = await fetchAdminWithAuth(`/admin/price-watch/campaigns/${id}`, {
      method: "DELETE",
    });

    if (res.error) {
      alert("Gagal menghapus kampanye: " + res.error.message);
      return;
    }

    if (selectedCampaign?.id === id) {
      setSelectedCampaign(null);
    }
    fetchCampaigns();
  };

  // Item Actions
  const openCreateItemModal = () => {
    if (!selectedCampaign) return;
    setEditingItem(null);
    setItemIngredientName("");
    setItemUnit("kg");
    setItemDisplayOrder(1);
    setItemActive(true);
    setErrorMsg(null);
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: PriceWatchItem) => {
    setEditingItem(item);
    setItemIngredientName(item.ingredient_name);
    setItemUnit(item.unit);
    setItemDisplayOrder(item.display_order);
    setItemActive(item.is_active);
    setErrorMsg(null);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      ingredient_name: itemIngredientName,
      unit: itemUnit,
      display_order: itemDisplayOrder,
      is_active: itemActive,
    };

    const endpoint = editingItem
      ? `/admin/price-watch/items/${editingItem.id}`
      : `/admin/price-watch/campaigns/${selectedCampaign.id}/items`;
    const method = editingItem ? "PUT" : "POST";

    const res = await fetchAdminWithAuth(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setIsItemModalOpen(false);
    fetchCampaignDetail(selectedCampaign.id);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

    const res = await fetchAdminWithAuth(`/admin/price-watch/items/${itemId}`, {
      method: "DELETE",
    });

    if (res.error) {
      alert("Gagal menghapus item: " + res.error.message);
      return;
    }

    if (selectedCampaign) {
      fetchCampaignDetail(selectedCampaign.id);
    }
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader />

          <main className="p-6 sm:p-8 space-y-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Manajemen Price Watch 🏷️
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Kelola kampanye pemantauan harga dan item bahan makanan komunitas.
                </p>
              </div>

              <button
                onClick={openCreateCampaignModal}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
              >
                + Kampanye Baru
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Campaign List Table */}
                <div className="lg:col-span-1 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Daftar Kampanye ({campaigns.length})
                  </h3>

                  <div className="space-y-2">
                    {campaigns.map((c) => {
                      const isSelected = selectedCampaign?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => fetchCampaignDetail(c.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-950/60 border-indigo-600 text-slate-100"
                              : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm">{c.title}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.is_active
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {c.is_active ? "Aktif" : "Draft"}
                            </span>
                          </div>

                          {c.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {c.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 pt-3 text-xs">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCampaignModal(c);
                              }}
                              className="text-indigo-400 hover:underline"
                            >
                              Edit
                            </button>
                            <span className="text-slate-700">•</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCampaign(c.id);
                              }}
                              className="text-red-400 hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Campaign Detail & Items Management */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedCampaign ? (
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                            Detail Kampanye
                          </span>
                          <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                            {selectedCampaign.title}
                          </h2>
                        </div>

                        <button
                          onClick={openCreateItemModal}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                        >
                          + Tambah Item Bahan
                        </button>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Item Bahan Makanan ({selectedCampaign.items?.length || 0})
                        </h4>

                        {!selectedCampaign.items || selectedCampaign.items.length === 0 ? (
                          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
                            Belum ada item bahan makanan pada kampanye ini. Klik "+ Tambah Item Bahan".
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                            {selectedCampaign.items.map((item) => (
                              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-bold text-sm text-slate-100">
                                    {item.ingredient_name}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Satuan: <span className="font-semibold text-slate-200">{item.unit}</span> | Urutan: {item.display_order}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                      item.is_active
                                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                        : "bg-slate-800 text-slate-500"
                                    }`}
                                  >
                                    {item.is_active ? "Aktif" : "Non-aktif"}
                                  </span>

                                  <button
                                    onClick={() => openEditItemModal(item)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-medium border border-red-800/50"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500 text-sm">
                      Pilih salah satu kampanye di kolom sebelah kiri untuk mengelola item bahan.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Campaign Modal */}
            {isCampaignModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative">
                  <button
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-bold"
                  >
                    ✕
                  </button>

                  <h2 className="text-xl font-bold text-slate-100">
                    {editingCampaign ? "Edit Kampanye" : "Buat Kampanye Baru"}
                  </h2>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Judul Kampanye
                      </label>
                      <input
                        type="text"
                        required
                        value={campTitle}
                        onChange={(e) => setCampTitle(e.target.value)}
                        placeholder="Contoh: Pantau Beras & Sembako Ramadan"
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Deskripsi Opsional
                      </label>
                      <textarea
                        rows={3}
                        value={campDesc}
                        onChange={(e) => setCampDesc(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="campActive"
                        checked={campActive}
                        onChange={(e) => setCampActive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-indigo-600"
                      />
                      <label htmlFor="campActive" className="font-semibold text-slate-300">
                        Aktifkan Kampanye
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 text-sm disabled:opacity-60"
                    >
                      {isSubmitting ? "Simpan..." : "Simpan Kampanye"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Save Item Modal */}
            {isItemModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative">
                  <button
                    onClick={() => setIsItemModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-bold"
                  >
                    ✕
                  </button>

                  <h2 className="text-xl font-bold text-slate-100">
                    {editingItem ? "Edit Item Bahan" : "Tambah Item Bahan Baru"}
                  </h2>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Nama Bahan Makanan
                      </label>
                      <input
                        type="text"
                        required
                        value={itemIngredientName}
                        onChange={(e) => setItemIngredientName(e.target.value)}
                        placeholder="Contoh: Beras SPHP, Cabai Merah"
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Satuan (Unit)
                        </label>
                        <input
                          type="text"
                          required
                          value={itemUnit}
                          onChange={(e) => setItemUnit(e.target.value)}
                          placeholder="kg, liter, ikat, pcs"
                          className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Urutan Tampilan
                        </label>
                        <input
                          type="number"
                          value={itemDisplayOrder}
                          onChange={(e) => setItemDisplayOrder(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="itemActive"
                        checked={itemActive}
                        onChange={(e) => setItemActive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-emerald-600"
                      />
                      <label htmlFor="itemActive" className="font-semibold text-slate-300">
                        Aktifkan Item Ini
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 text-sm disabled:opacity-60"
                    >
                      {isSubmitting ? "Simpan..." : "Simpan Item Bahan"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
