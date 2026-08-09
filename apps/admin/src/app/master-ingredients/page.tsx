"use client";

import React, { useState, useEffect } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { fetchAdminWithAuth } from "@/lib/api";
import { MasterIngredientWithAliases } from "@masakapa/shared-types";

const CATEGORIES = [
  "Semua",
  "Cabai",
  "Bawang",
  "Daging & Protein",
  "Beras & Sembako",
  "Sayuran",
  "Bumbu",
];

export default function MasterIngredientsPage() {
  const [items, setItems] = useState<MasterIngredientWithAliases[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterIngredientWithAliases | null>(null);
  const [formCategory, setFormCategory] = useState("Cabai");
  const [formName, setFormName] = useState("");
  const [formDefaultUnit, setFormDefaultUnit] = useState("kg");
  const [formBaselinePrice, setFormBaselinePrice] = useState<number>(10000);
  const [formAliasesStr, setFormAliasesStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Add Alias State
  const [addingAliasForId, setAddingAliasForId] = useState<number | null>(null);
  const [newAliasInput, setNewAliasInput] = useState("");

  const fetchIngredients = async () => {
    setLoading(true);
    setErrorMsg(null);
    let url = "/admin/master-ingredients?";
    if (selectedCategory !== "Semua") url += `category=${encodeURIComponent(selectedCategory)}&`;
    if (debouncedSearchQuery.trim()) url += `search=${encodeURIComponent(debouncedSearchQuery.trim())}&`;

    const res = await fetchAdminWithAuth<MasterIngredientWithAliases[]>(url);
    setLoading(false);
    if (res.data) {
      setItems(res.data);
    } else if (res.error) {
      setErrorMsg(res.error.message);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [selectedCategory, debouncedSearchQuery]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormCategory("Cabai");
    setFormName("");
    setFormDefaultUnit("kg");
    setFormBaselinePrice(10000);
    setFormAliasesStr("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MasterIngredientWithAliases) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.name);
    setFormDefaultUnit(item.default_unit);
    setFormBaselinePrice(item.baseline_price || 10000);
    setFormAliasesStr("");
    setIsModalOpen(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    if (editingItem) {
      // Update
      const res = await fetchAdminWithAuth<MasterIngredientWithAliases>(
        `/admin/master-ingredients/${editingItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: formCategory,
            name: formName.trim(),
            default_unit: formDefaultUnit.trim(),
            baseline_price: Number(formBaselinePrice) || 10000,
          }),
        }
      );
      setIsSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }

      setSuccessMsg(`Master bahan "${formName}" berhasil diperbarui!`);
    } else {
      // Create
      const aliasesArray = formAliasesStr
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await fetchAdminWithAuth<MasterIngredientWithAliases>(
        "/admin/master-ingredients",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: formCategory,
            name: formName.trim(),
            default_unit: formDefaultUnit.trim(),
            baseline_price: Number(formBaselinePrice) || 10000,
            aliases: aliasesArray,
          }),
        }
      );
      setIsSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }

      setSuccessMsg(`Master bahan "${formName}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
    fetchIngredients();
  };

  const handleDeleteIngredient = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus master bahan "${name}"?`)) return;

    const res = await fetchAdminWithAuth(`/admin/master-ingredients/${id}`, {
      method: "DELETE",
    });

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setSuccessMsg(`Master bahan "${name}" berhasil dihapus.`);
    fetchIngredients();
  };

  const handleAddAliasSubmit = async (ingredientId: number) => {
    if (!newAliasInput.trim()) return;

    const res = await fetchAdminWithAuth(`/admin/master-ingredients/${ingredientId}/aliases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias_name: newAliasInput.trim() }),
    });

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setNewAliasInput("");
    setAddingAliasForId(null);
    fetchIngredients();
  };

  const handleDeleteAlias = async (aliasId: number, aliasName: string) => {
    const res = await fetchAdminWithAuth(
      `/admin/master-ingredients/aliases/${aliasId}`,
      {
        method: "DELETE",
      }
    );

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    fetchIngredients();
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader />

          <main className="p-6 sm:p-8 space-y-8 max-w-6xl">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                  <span>Master Bahan Baku 🥬</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Kelola katalog standar nama komoditas bahan baku & kamus sinonim alias untuk pemetaan harga.
                </p>
              </div>

              <button
                onClick={openCreateModal}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <span>➕ Tambah Bahan Baru</span>
              </button>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center justify-between">
                <span>✅ {successMsg}</span>
                <button onClick={() => setSuccessMsg(null)} className="text-xs opacity-70 hover:opacity-100">
                  ✕
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center justify-between">
                <span>⚠️ {errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-xs opacity-70 hover:opacity-100">
                  ✕
                </button>
              </div>
            )}

            {/* Controls: Search & Category Pills */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-80 relative">
                  <input
                    type="text"
                    placeholder="Cari bahan atau alias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  />
                  <span className="absolute left-3.5 top-3 text-slate-500 text-sm">🔍</span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Total: <strong className="text-white">{items.length}</strong> bahan baku
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ingredients Grid / List */}
            {loading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="text-sm font-medium">Memuat katalog master bahan...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
                <span className="text-4xl">🍃</span>
                <h3 className="font-bold text-slate-200 text-base">Tidak ada bahan baku ditemukan</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Coba ubah kata kunci pencarian atau pilih kategori lain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top bar: Category Badge & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-indigo-400 font-semibold text-[11px] uppercase tracking-wider border border-slate-700/50">
                          {item.category}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
                            title="Edit Bahan"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIngredient(item.id, item.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 text-xs font-semibold transition-all"
                            title="Hapus Bahan"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>

                      {/* Main Title & Default Unit & Baseline Price */}
                      <div className="mt-3">
                        <h3 className="font-extrabold text-slate-100 text-lg">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                          <p>
                            Satuan: <span className="font-mono text-slate-200">{item.default_unit}</span>
                          </p>
                          <p className="font-semibold text-emerald-400">
                            Rp {(item.baseline_price || 10000).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* Aliases Tags */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>Sinonim / Alias ({item.aliases?.length || 0}):</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 items-center">
                          {item.aliases && item.aliases.length > 0 ? (
                            item.aliases.map((alias) => (
                              <span
                                key={alias.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-200 text-xs font-mono"
                              >
                                <span>{alias.alias_name}</span>
                                <button
                                  onClick={() => handleDeleteAlias(alias.id, alias.alias_name)}
                                  className="text-slate-500 hover:text-red-400 text-xs font-bold"
                                  title="Hapus alias"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs italic text-slate-600">Belum ada sinonim alias</span>
                          )}

                          {/* Add Alias inline button / input */}
                          {addingAliasForId === item.id ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="text"
                                placeholder="Alias baru..."
                                value={newAliasInput}
                                onChange={(e) => setNewAliasInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddAliasSubmit(item.id);
                                  if (e.key === "Escape") setAddingAliasForId(null);
                                }}
                                className="w-32 px-2.5 py-1 rounded-xl bg-slate-950 border border-indigo-500 text-xs text-white focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleAddAliasSubmit(item.id)}
                                className="px-2 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setAddingAliasForId(null)}
                                className="px-2 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAddingAliasForId(item.id);
                                setNewAliasInput("");
                              }}
                              className="px-2.5 py-1 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 text-indigo-300 text-xs font-semibold transition-all"
                            >
                              + Alias
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-extrabold text-slate-100 text-lg">
                {editingItem ? "Edit Master Bahan Baku" : "Tambah Master Bahan Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Kategori Bahan</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nama Standar Komoditas</label>
                <input
                  type="text"
                  placeholder="Misal: Cabai Rawit Merah"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Satuan Standar Default</label>
                <input
                  type="text"
                  placeholder="kg / ikat / papan / liter"
                  value={formDefaultUnit}
                  onChange={(e) => setFormDefaultUnit(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Harga Acuan Baseline (Rp)</label>
                <input
                  type="number"
                  placeholder="Misal: 15000"
                  value={formBaselinePrice}
                  onChange={(e) => setFormBaselinePrice(Number(e.target.value))}
                  required
                  min={100}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-emerald-400 font-semibold"
                />
              </div>

              {!editingItem && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Sinonim Alias Awal (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    placeholder="cabe rawit, lombok rawit, cabe sret"
                    value={formAliasesStr}
                    onChange={(e) => setFormAliasesStr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Bahan Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
