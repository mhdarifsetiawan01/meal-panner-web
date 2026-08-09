"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { MaintenanceView } from "@/components/common/maintenance-view";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // Cities from DB
  interface CityOption { id: number; name: string; province_name: string; }
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    fetch(`${apiBase.replace(/\/$/, "")}/cities`)
      .then((r) => r.json())
      .then((json) => {
        const list: CityOption[] = json?.data?.cities || [];
        setCities(list);
      })
      .catch(() => {})
      .finally(() => setCitiesLoading(false));
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchWithAuth<any>("/preferences").then((res) => {
        if (res.data) {
          if (res.data.city_id) setCityId(res.data.city_id);
          if (res.data.household_size > 0) setFamilyMembersCount(res.data.household_size);
          if (res.data.goal) setGoal(res.data.goal);
          if (res.data.budget_amount > 0) setBudgetAmount(res.data.budget_amount);
          if (res.data.budget_period) {
            const periodMap: Record<string, "daily" | "weekly" | "monthly"> = {
              harian: "daily",
              mingguan: "weekly",
              bulanan: "monthly",
              daily: "daily",
              weekly: "weekly",
              monthly: "monthly",
            };
            setBudgetPeriod(periodMap[res.data.budget_period] || "daily");
          }
          if (res.data.restrictions && Array.isArray(res.data.restrictions)) {
            setDietaryRestrictions(res.data.restrictions);
          }
        }
      });
    }
  }, [authLoading, user]);

  // Form State
  const [cityId, setCityId] = useState<number>(0);
  const [familyMembersCount, setFamilyMembersCount] = useState<number>(3);
  const [goal, setGoal] = useState<"hemat" | "sehat" | "variatif" | "praktis">("hemat");
  const [budgetPeriod, setBudgetPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [budgetAmount, setBudgetAmount] = useState<number>(50000);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(["halal"]);
  const [cookingEquipment, setCookingEquipment] = useState<string[]>(["kompor", "rice-cooker"]);

  const toggleDietary = (item: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleEquipment = (item: string) => {
    setCookingEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsMaintenance(false);
    setIsSubmitting(true);

    let dailyBudget = budgetAmount;
    let monthlyBudget = budgetAmount * 30;

    if (budgetPeriod === "weekly") {
      dailyBudget = Math.round(budgetAmount / 7);
      monthlyBudget = budgetAmount * 4;
    } else if (budgetPeriod === "monthly") {
      dailyBudget = Math.round(budgetAmount / 30);
      monthlyBudget = budgetAmount;
    }

    const budgetPeriodMap: Record<string, string> = {
      daily: "harian",
      weekly: "mingguan",
      monthly: "bulanan",
    };

    const payload = {
      city_id: cityId,
      household_size: familyMembersCount,
      restrictions: dietaryRestrictions,
      cooking_equipment: cookingEquipment,
      goal,
      budget_amount: budgetAmount,
      budget_period: budgetPeriodMap[budgetPeriod] || "harian",
      monthly_budget: monthlyBudget,
      daily_budget: dailyBudget,
    };

    const res = await fetchWithAuth("/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      if (res.error.isMaintenance) {
        setIsMaintenance(true);
        return;
      }
      setErrorMsg(res.error.message);
      return;
    }

    router.push("/generate");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <MaintenanceView onRetry={() => setIsMaintenance(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Langkah {step} dari 3
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Profil &amp; Preferensi Makanan
            </h1>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-8 bg-emerald-600 dark:bg-emerald-500"
                    : i < step
                    ? "w-2 bg-emerald-300 dark:bg-emerald-800"
                    : "w-2 bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Kota & Anggota Keluarga */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kota Tempat Tinggal
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(Number(e.target.value))}
                  disabled={citiesLoading}
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60"
                >
                  {citiesLoading ? (
                    <option value={0}>Memuat kota...</option>
                  ) : cities.length === 0 ? (
                    <option value={0}>Tidak ada data kota</option>
                  ) : (
                    cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name} ({city.province_name})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Jumlah Anggota Keluarga (Porsi Makan)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFamilyMembersCount(Math.max(1, familyMembersCount - 1))}
                    className="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 min-w-12 text-center">
                    {familyMembersCount} Orang
                  </span>
                  <button
                    type="button"
                    onClick={() => setFamilyMembersCount(familyMembersCount + 1)}
                    className="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all"
              >
                Lanjut ke Target Budget &rarr;
              </button>
            </div>
          )}

          {/* Step 2: Goal & Budget */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Target / Goal Utama Menu Makanan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "hemat", label: "💰 Hemat", desc: "Optimasi budget pengeluaran" },
                    { id: "sehat", label: "🥗 Sehat", desc: "Gizi seimbang & serat" },
                    { id: "variatif", label: "🍱 Variatif", desc: "Menu berbeda tiap hari" },
                    { id: "praktis", label: "⚡ Praktis", desc: "Cepat & simpel dimasak" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        goal === item.id
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-500"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Periode Budget
                </label>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
                  {[
                    { id: "daily", label: "Harian" },
                    { id: "weekly", label: "Mingguan" },
                    { id: "monthly", label: "Bulanan" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setBudgetPeriod(p.id as any)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        budgetPeriod === p.id
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Jumlah Budget (Rp)
                </label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  step={5000}
                  min={10000}
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  &larr; Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20"
                >
                  Lanjut &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Alergi & Peralatan Masak */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Batasan / Pantangan Makanan
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "halal", label: "🕌 Halal Only" },
                    { id: "tanpa-seafood", label: "🦐 Bebas Seafood" },
                    { id: "vegetarian", label: "🌱 Vegetarian" },
                    { id: "rendah-gula", label: "🍯 Rendah Gula" },
                    { id: "bebas-kacang", label: "🥜 Bebas Kacang" },
                  ].map((item) => {
                    const active = dietaryRestrictions.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleDietary(item.id)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Peralatan Masak yang Tersedia
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "kompor", label: "🔥 Kompor Gas/Listrik" },
                    { id: "rice-cooker", label: "🍚 Rice Cooker" },
                    { id: "air-fryer", label: "🍟 Air Fryer" },
                    { id: "blender", label: "🥤 Blender" },
                    { id: "oven", label: "🍕 Oven" },
                    { id: "microwave", label: "🍿 Microwave" },
                  ].map((item) => {
                    const active = cookingEquipment.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleEquipment(item.id)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  &larr; Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Profile & Selesai 🎉"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
