"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export interface PreferenceData {
  goal: "hemat" | "sehat" | "variatif" | "praktis";
  budget_amount: number;
  budget_period: "harian" | "mingguan" | "bulanan";
  household_size: number;
  restrictions: string[];
  city_id?: number;
}

interface PreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPref?: PreferenceData | null;
  onSaved: () => void;
}

export function PreferenceModal({
  isOpen,
  onClose,
  currentPref,
  onSaved,
}: PreferenceModalProps) {
  const [goal, setGoal] = useState<"hemat" | "sehat" | "variatif" | "praktis">("hemat");
  const [budgetAmount, setBudgetAmount] = useState<number>(50000);
  const [budgetPeriod, setBudgetPeriod] = useState<"harian" | "mingguan" | "bulanan">("harian");
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(["halal"]);
  const [cityId, setCityId] = useState<number>(1);
  const [cities, setCities] = useState<{ id: number; name: string; province_name: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentPref) {
      if (currentPref.goal) setGoal(currentPref.goal);
      if (currentPref.budget_amount > 0) setBudgetAmount(currentPref.budget_amount);
      if (currentPref.budget_period) setBudgetPeriod(currentPref.budget_period);
      if (currentPref.household_size > 0) setHouseholdSize(currentPref.household_size);
      if (currentPref.restrictions) setDietaryRestrictions(currentPref.restrictions);
      if (currentPref.city_id) setCityId(currentPref.city_id);
    }
  }, [currentPref, isOpen]);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    fetch(`${apiBase.replace(/\/$/, "")}/cities`)
      .then((r) => r.json())
      .then((json) => {
        const list = json?.data?.cities || [];
        setCities(list);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const toggleDietary = (item: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (budgetAmount <= 0) {
      setErrorMsg("Budget harus lebih dari Rp 0");
      return;
    }

    setIsSubmitting(true);

    let dailyBudget = budgetAmount;
    let monthlyBudget = budgetAmount * 30;

    if (budgetPeriod === "mingguan") {
      dailyBudget = Math.round(budgetAmount / 7);
      monthlyBudget = budgetAmount * 4;
    } else if (budgetPeriod === "bulanan") {
      dailyBudget = Math.round(budgetAmount / 30);
      monthlyBudget = budgetAmount;
    }

    const payload = {
      goal,
      budget_amount: budgetAmount,
      budget_period: budgetPeriod,
      household_size: householdSize,
      restrictions: dietaryRestrictions,
      city_id: cityId,
      daily_budget: dailyBudget,
      monthly_budget: monthlyBudget,
    };

    const res = await fetchWithAuth("/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              ✏️ Modifikasi Preferensi &amp; Budget
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sesuaikan budget harian dan preferensi makanan Anda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Budget & Periode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Target Budget Masak
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <select
                value={budgetPeriod}
                onChange={(e) => setBudgetPeriod(e.target.value as any)}
                className="py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="harian">/ hari</option>
                <option value="mingguan">/ minggu</option>
                <option value="bulanan">/ bulan</option>
              </select>
            </div>
            {/* Quick Budget Chips */}
            <div className="flex gap-2 mt-2">
              {[30000, 50000, 75000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBudgetAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    budgetAmount === amt
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Rp {(amt / 1000).toFixed(0)}rb
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah Anggota Keluarga */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Porsi Makan (Anggota Keluarga)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                -
              </button>
              <span className="font-extrabold text-base text-slate-900 dark:text-slate-100 min-w-[70px] text-center">
                {householdSize} Orang
              </span>
              <button
                type="button"
                onClick={() => setHouseholdSize(householdSize + 1)}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Target Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Prioritas Utama (Goal)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "hemat", label: "💰 Paling Hemat", desc: "Minimalisir pengeluaran" },
                { id: "sehat", label: "🥗 Lebih Sehat", desc: "Tinggi gizi & nutrisi" },
                { id: "variatif", label: "🍲 Variatif & Unik", desc: "Menu tidak membosankan" },
                { id: "praktis", label: "⚡ Praktis & Cepat", desc: "Masak cepat < 20 mnt" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    goal === item.id
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-300"
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Kota Tempat Tinggal */}
          {cities.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Kota Tempat Tinggal
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.province_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pantangan / Alergi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Pantangan &amp; Alergi
            </label>
            <div className="flex flex-wrap gap-2">
              {["halal", "no-pork", "vegetarian", "seafood-allergy", "nut-allergy", "low-sugar"].map((item) => {
                const isSelected = dietaryRestrictions.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {({
                      halal: "🕌 Halal",
                      "no-pork": "🚫 Tanpa Babi",
                      vegetarian: "🥗 Vegetarian",
                      "seafood-allergy": "🦐 Alergi Seafood",
                      "nut-allergy": "🥜 Alergi Kacang",
                      "low-sugar": "📉 Rendah Gula",
                    } as Record<string, string>)[item] || item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan &amp; Generate Ulang Menu &rarr;</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
