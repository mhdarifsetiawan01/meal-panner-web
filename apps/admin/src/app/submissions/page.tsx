"use client";

import React, { useState } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { fetchAdminWithAuth } from "@/lib/api";

export interface SubmissionMonitoring {
  id: number;
  user_id: string;
  ingredient_name: string;
  unit: string;
  city_name: string;
  city_id: number;
  submitted_price: number;
  status: "pending" | "validated" | "rejected";
  created_at: string;
}

const cityNames: Record<number, string> = {
  1: "Jakarta Selatan",
  2: "Jakarta Timur",
  3: "Surabaya",
  4: "Bandung",
  5: "Medan",
};

// Mock initial data if backend search endpoint returns empty list for dev UI
const sampleSubmissions: SubmissionMonitoring[] = [
  { id: 101, user_id: "usr_1", ingredient_name: "Beras SPHP 5kg", unit: "5kg", city_name: "Jakarta Selatan", city_id: 1, submitted_price: 65000, status: "validated", created_at: "2026-08-07T10:00:00Z" },
  { id: 102, user_id: "usr_2", ingredient_name: "Beras SPHP 5kg", unit: "5kg", city_name: "Jakarta Selatan", city_id: 1, submitted_price: 64500, status: "validated", created_at: "2026-08-07T10:15:00Z" },
  { id: 103, user_id: "usr_3", ingredient_name: "Beras SPHP 5kg", unit: "5kg", city_name: "Jakarta Selatan", city_id: 1, submitted_price: 120000, status: "rejected", created_at: "2026-08-07T10:30:00Z" },
  { id: 104, user_id: "usr_4", ingredient_name: "Cabai Merah Keriting", unit: "kg", city_name: "Surabaya", city_id: 3, submitted_price: 45000, status: "pending", created_at: "2026-08-07T11:00:00Z" },
  { id: 105, user_id: "usr_5", ingredient_name: "Cabai Merah Keriting", unit: "kg", city_name: "Surabaya", city_id: 3, submitted_price: 44000, status: "pending", created_at: "2026-08-07T11:20:00Z" },
];

export default function SubmissionsMonitoringPage() {
  const [selectedCityId, setSelectedCityId] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [submissions, setSubmissions] = useState<SubmissionMonitoring[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRunningConsensus, setIsRunningConsensus] = useState(false);
  const [consensusResult, setConsensusResult] = useState<{
    groups_processed: number;
    validated_count: number;
    rejected_count: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Consensus job parameters
  const [minSubmissions, setMinSubmissions] = useState<number>(3);
  const [tolerancePercent, setTolerancePercent] = useState<number>(15);

  const fetchSubmissions = async () => {
    setLoading(true);
    let url = "/admin/price-watch/submissions?";
    if (selectedCityId !== "all") url += `city_id=${selectedCityId}&`;
    if (selectedStatus !== "all") url += `status=${selectedStatus}&`;

    const res = await fetchAdminWithAuth<SubmissionMonitoring[]>(url);
    setLoading(false);
    if (res.data) {
      setSubmissions(res.data);
    }
  };

  React.useEffect(() => {
    fetchSubmissions();
  }, [selectedCityId, selectedStatus]);

  const handleRunConsensus = async () => {
    setIsRunningConsensus(true);
    setErrorMsg(null);
    setConsensusResult(null);

    const res = await fetchAdminWithAuth<{
      groups_processed: number;
      validated_count: number;
      rejected_count: number;
    }>("/admin/price-watch/run-consensus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        min_submissions: minSubmissions,
        tolerance_percent: tolerancePercent,
      }),
    });

    setIsRunningConsensus(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    if (res.data) {
      setConsensusResult(res.data);
      fetchSubmissions();
    }
  };

  const filteredSubmissions = submissions;

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader />

          <main className="p-6 sm:p-8 space-y-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Monitoring Submission Harga 📈
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Pantau data masukan harga dari komunitas per kota dan jalankan validasi konsensus.
                  </p>
                </div>
              </div>

              {/* Consensus Job Config + Run Button */}
              <div className="flex flex-wrap items-end gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Min. Laporan per Grup</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={minSubmissions}
                      onChange={(e) => setMinSubmissions(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-500">(default: 3)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Toleransi Harga (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={tolerancePercent}
                      onChange={(e) => setTolerancePercent(Math.max(1, parseFloat(e.target.value) || 15))}
                      className="w-20 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-500">(default: 15%)</span>
                  </div>
                </div>

                <button
                  onClick={handleRunConsensus}
                  disabled={isRunningConsensus}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 ml-auto"
                >
                  {isRunningConsensus ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      <span>Menjalankan Consensus Job...</span>
                    </>
                  ) : (
                    <span>⚡ Jalankan Job Validasi Konsensus</span>
                  )}
                </button>
              </div>
            </div>

            {/* Job Execution Success Result */}
            {consensusResult && (
              <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <h3 className="font-bold text-emerald-300 text-base">
                    Consensus Validation Job Sukses Diperoleh!
                  </h3>
                </div>
                <p className="text-xs text-emerald-400">
                  Grup Diproses: <strong>{consensusResult.groups_processed}</strong> | Laporan Validated: <strong>{consensusResult.validated_count}</strong> | Laporan Rejected: <strong>{consensusResult.rejected_count}</strong>
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Filters Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Filter Kota Pasar
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-xs outline-none"
                >
                  <option value="all">Semua Kota</option>
                  <option value={1}>Jakarta Selatan</option>
                  <option value={2}>Jakarta Timur</option>
                  <option value={3}>Surabaya</option>
                  <option value={4}>Bandung</option>
                  <option value={5}>Medan</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Filter Status Laporan
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-xs outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending (Menunggu Job)</option>
                  <option value="validated">Validated (Terverifikasi)</option>
                  <option value="rejected">Rejected (Outlier / Diluar Toleransi)</option>
                </select>
              </div>
            </div>

            {/* Monitoring Submissions Table */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Item Bahan</th>
                    <th className="py-4 px-6">Kota Pasar</th>
                    <th className="py-4 px-6">Harga Dilaporkan</th>
                    <th className="py-4 px-6">Status Validasi</th>
                    <th className="py-4 px-6">Waktu Laporan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Tidak ada laporan harga yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const statusBadges = {
                        pending: { label: "🟡 Pending", class: "bg-amber-950 text-amber-300 border-amber-800" },
                        validated: { label: "🟢 Validated (+1 Cr)", class: "bg-emerald-950 text-emerald-300 border-emerald-800" },
                        rejected: { label: "🔴 Rejected", class: "bg-red-950 text-red-300 border-red-800" },
                      };
                      const badge = statusBadges[sub.status] || statusBadges.pending;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-850 transition-colors">
                          <td className="py-4 px-6 font-mono text-slate-500">#{sub.id}</td>
                          <td className="py-4 px-6 font-bold text-slate-100">
                            {sub.ingredient_name} <span className="text-slate-500 font-normal">({sub.unit})</span>
                          </td>
                          <td className="py-4 px-6">{sub.city_name || cityNames[sub.city_id] || `Kota ID ${sub.city_id}`}</td>
                          <td className="py-4 px-6 font-extrabold text-emerald-400">
                            Rp {sub.submitted_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.class}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {new Date(sub.created_at).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
