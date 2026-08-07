"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { fetchAdminWithAuth } from "@/lib/api";

export interface AIProviderConfig {
  id?: number;
  provider_name: string;
  model_name: string;
  is_active: boolean;
  description?: string;
  icon?: string;
}

const defaultProviders: AIProviderConfig[] = [
  { provider_name: "openai", model_name: "gpt-4o-mini", is_active: true, description: "Fast, highly reliable OpenAI model for structured recipe generation.", icon: "🟢" },
  { provider_name: "groq", model_name: "llama-3.3-70b-versatile", is_active: false, description: "Ultra-fast inference speed via Groq LPU hardware.", icon: "⚡" },
  { provider_name: "gemini", model_name: "gemini-1.5-flash", is_active: false, description: "Google DeepMind multimodal LLM for food & menu understanding.", icon: "✨" },
  { provider_name: "deepseek", model_name: "deepseek-chat-v3", is_active: false, description: "High-reasoning cost-effective open weights LLM provider.", icon: "🐋" },
];

export default function AdminAIConfigPage() {
  const [providers, setProviders] = useState<AIProviderConfig[]>(defaultProviders);
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAIConfigs = async () => {
    setLoading(true);
    const res = await fetchAdminWithAuth<AIProviderConfig[]>("/admin/ai/configs");
    setLoading(false);

    if (res.data && res.data.length > 0) {
      setProviders(res.data);
    }
  };

  useEffect(() => {
    fetchAIConfigs();
  }, []);

  const handleSelectProvider = async (providerName: string) => {
    setIsSwitching(providerName);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await fetchAdminWithAuth("/admin/ai/configs/select", {
      method: "POST",
      body: JSON.stringify({ provider_name: providerName }),
    });

    setIsSwitching(null);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    setSuccessMsg(`Berhasil beralih ke provider AI aktif: ${providerName.toUpperCase()}`);

    // Update local active state
    setProviders((prev) =>
      prev.map((p) => ({
        ...p,
        is_active: p.provider_name === providerName,
      }))
    );
  };

  const activeProvider = providers.find((p) => p.is_active) || providers[0];

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader />

          <main className="p-6 sm:p-8 space-y-8 max-w-6xl">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                AI Provider Config Switch 🤖
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Pilih provider Large Language Model (LLM) aktif yang digunakan oleh generator menu AI.
              </p>
            </div>

            {/* Current Active Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700/60 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  ACTIVE AI PROVIDER LIVE
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wide">
                    {activeProvider?.provider_name}
                  </h2>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Model Name: <code className="font-mono bg-indigo-950 px-2 py-0.5 rounded text-emerald-300 font-bold">{activeProvider?.model_name}</code>
                  </p>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
                  <span>● ONLINE &amp; SERVING API</span>
                </div>
              </div>
            </div>

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm font-semibold flex items-center justify-between">
                <span>{successMsg}</span>
                <button onClick={() => setSuccessMsg(null)} className="text-xs underline">Tutup</button>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Providers Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Daftar AI Provider Terintegrasi ({providers.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((p) => {
                  const isActive = p.is_active;
                  const isPending = isSwitching === p.provider_name;

                  return (
                    <div
                      key={p.provider_name}
                      className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                        isActive
                          ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{p.icon || "🤖"}</span>
                            <h4 className="font-extrabold text-lg text-slate-100 uppercase tracking-wide">
                              {p.provider_name}
                            </h4>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            {isActive ? "🟢 Active" : "Standby"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">
                          Model ID: <code className="font-mono text-indigo-300 font-semibold">{p.model_name}</code>
                        </p>

                        {p.description && (
                          <p className="text-xs text-slate-400 leading-relaxed pt-1">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        {isActive ? (
                          <button
                            disabled
                            className="w-full py-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold text-xs cursor-default"
                          >
                            ✓ Provider Aktif Saat Ini
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectProvider(p.provider_name)}
                            disabled={isPending}
                            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {isPending ? (
                              <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                <span>Mengalihkan...</span>
                              </>
                            ) : (
                              <span>Aktifkan Provider Ini &rarr;</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
