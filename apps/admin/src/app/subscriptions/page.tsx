"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { fetchAdminWithAuth } from "@/lib/api";

export interface SubscriptionPlan {
  id: number;
  name: string;
  price_monthly: number;
  daily_generate_limit: number;
  is_active: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
  max_redemptions: number;
  times_redeemed: number;
  is_active: boolean;
}

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"plans" | "coupons">("plans");

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planName, setPlanName] = useState("");
  const [planPriceMonthly, setPlanPriceMonthly] = useState(29000);
  const [planDailyLimit, setPlanDailyLimit] = useState(999);
  const [planActive, setPlanActive] = useState(true);

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(20);
  const [couponMaxRedemptions, setCouponMaxRedemptions] = useState(100);
  const [couponActive, setCouponActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [plansRes, couponsRes] = await Promise.all([
      fetchAdminWithAuth<SubscriptionPlan[]>("/admin/subscriptions/plans"),
      fetchAdminWithAuth<Coupon[]>("/admin/subscriptions/coupons"),
    ]);
    setLoading(false);

    if (plansRes.data) setPlans(plansRes.data);
    if (couponsRes.data) setCoupons(couponsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Plan Actions
  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanName("");
    setPlanPriceMonthly(29000);
    setPlanDailyLimit(999);
    setPlanActive(true);
    setErrorMsg(null);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanPriceMonthly(plan.price_monthly);
    setPlanDailyLimit(plan.daily_generate_limit);
    setPlanActive(plan.is_active);
    setErrorMsg(null);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: planName,
      price_monthly: planPriceMonthly,
      daily_generate_limit: planDailyLimit,
      is_active: planActive,
    };

    const endpoint = editingPlan
      ? `/admin/subscriptions/plans/${editingPlan.id}`
      : `/admin/subscriptions/plans`;
    const method = editingPlan ? "PUT" : "POST";

    const res = await fetchAdminWithAuth(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setIsPlanModalOpen(false);
    fetchData();
  };

  // Coupon Actions
  const openCreateCouponModal = () => {
    setEditingCoupon(null);
    setCouponCode("");
    setCouponDiscount(20);
    setCouponMaxRedemptions(100);
    setCouponActive(true);
    setErrorMsg(null);
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponCode(coupon.code);
    setCouponDiscount(coupon.discount_percentage);
    setCouponMaxRedemptions(coupon.max_redemptions);
    setCouponActive(coupon.is_active);
    setErrorMsg(null);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      code: couponCode.trim().toUpperCase(),
      discount_percentage: couponDiscount,
      max_redemptions: couponMaxRedemptions,
      is_active: couponActive,
    };

    const endpoint = editingCoupon
      ? `/admin/subscriptions/coupons/${editingCoupon.id}`
      : `/admin/subscriptions/coupons`;
    const method = editingCoupon ? "PUT" : "POST";

    const res = await fetchAdminWithAuth(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setIsCouponModalOpen(false);
    fetchData();
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
                  Paket Langganan &amp; Kupon 💎
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Kelola paket subscription (Free/Premium) dan kode kupon diskon promo.
                </p>
              </div>

              {activeTab === "plans" ? (
                <button
                  onClick={openCreatePlanModal}
                  className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all self-start sm:self-auto"
                >
                  + Tambah Paket Baru
                </button>
              ) : (
                <button
                  onClick={openCreateCouponModal}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
                >
                  + Buat Kupon Baru
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 text-sm font-bold">
              <button
                onClick={() => setActiveTab("plans")}
                className={`pb-3 px-4 transition-all ${
                  activeTab === "plans"
                    ? "border-b-2 border-amber-500 text-amber-400"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                📦 Paket Subscription ({plans.length})
              </button>
              <button
                onClick={() => setActiveTab("coupons")}
                className={`pb-3 px-4 transition-all ${
                  activeTab === "coupons"
                    ? "border-b-2 border-indigo-500 text-indigo-400"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                🏷️ Kupon Diskon Promo ({coupons.length})
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : activeTab === "plans" ? (
              /* Plans Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                        {plan.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          plan.is_active
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}
                      >
                        {plan.is_active ? "Aktif" : "Non-aktif"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-2xl font-extrabold text-amber-400">
                        Rp {plan.price_monthly.toLocaleString("id-ID")}{" "}
                        <span className="text-xs text-slate-500 font-normal">/ bulan</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Kuota AI Generate: <strong>{plan.daily_generate_limit}x / hari</strong>
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => openEditPlanModal(plan)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                      >
                        Edit Paket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Coupons Table */
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Kode Kupon</th>
                      <th className="py-4 px-6">Diskon (%)</th>
                      <th className="py-4 px-6">Penggunaan</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          Belum ada kupon diskon. Klik "+ Buat Kupon Baru".
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-slate-850 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-indigo-400">
                            {coupon.code}
                          </td>
                          <td className="py-4 px-6 font-extrabold text-emerald-400">
                            {coupon.discount_percentage}% OFF
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {coupon.times_redeemed} / {coupon.max_redemptions} kali
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                coupon.is_active
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                  : "bg-slate-800 text-slate-500 border-slate-700"
                              }`}
                            >
                              {coupon.is_active ? "Aktif" : "Non-aktif"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => openEditCouponModal(coupon)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                            >
                              Edit Kupon
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Save Plan Modal */}
            {isPlanModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative">
                  <button
                    onClick={() => setIsPlanModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-bold"
                  >
                    ✕
                  </button>

                  <h2 className="text-xl font-bold text-slate-100">
                    {editingPlan ? "Edit Paket Subscription" : "Buat Paket Baru"}
                  </h2>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Nama Paket</label>
                      <input
                        type="text"
                        required
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="free / premium / family"
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Harga Bulanan (Rp)
                        </label>
                        <input
                          type="number"
                          required
                          value={planPriceMonthly}
                          onChange={(e) => setPlanPriceMonthly(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Daily AI Limit
                        </label>
                        <input
                          type="number"
                          required
                          value={planDailyLimit}
                          onChange={(e) => setPlanDailyLimit(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="planActive"
                        checked={planActive}
                        onChange={(e) => setPlanActive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-amber-600"
                      />
                      <label htmlFor="planActive" className="font-semibold text-slate-300">
                        Aktifkan Paket
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-600/30 text-sm disabled:opacity-60"
                    >
                      {isSubmitting ? "Simpan..." : "Simpan Paket"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Save Coupon Modal */}
            {isCouponModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative">
                  <button
                    onClick={() => setIsCouponModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-bold"
                  >
                    ✕
                  </button>

                  <h2 className="text-xl font-bold text-slate-100">
                    {editingCoupon ? "Edit Kupon Diskon" : "Buat Kupon Baru"}
                  </h2>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Kode Kupon</label>
                      <input
                        type="text"
                        required
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Contoh: MASAKHEMAT20"
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none uppercase font-mono font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Diskon (%)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          required
                          value={couponDiscount}
                          onChange={(e) => setCouponDiscount(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Maks Penggunaan
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={couponMaxRedemptions}
                          onChange={(e) => setCouponMaxRedemptions(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="couponActive"
                        checked={couponActive}
                        onChange={(e) => setCouponActive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-indigo-600"
                      />
                      <label htmlFor="couponActive" className="font-semibold text-slate-300">
                        Aktifkan Kupon
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 text-sm disabled:opacity-60"
                    >
                      {isSubmitting ? "Simpan..." : "Simpan Kupon"}
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
