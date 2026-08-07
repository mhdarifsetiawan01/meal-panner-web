"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { RecipeOptionCard, RecipeOption } from "@/components/menu/recipe-option-card";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [options, setOptions] = useState<RecipeOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleGenerate = async () => {
    setErrorMsg(null);
    setIsRateLimited(false);
    setIsGenerating(true);

    const res = await fetchWithAuth<{ options: RecipeOption[] }>("/menu/generate", {
      method: "POST",
    });

    setIsGenerating(false);

    if (res.error) {
      if (res.error.message.includes("429") || res.error.message.toLowerCase().includes("limit")) {
        setIsRateLimited(true);
      }
      if (res.error.message.toLowerCase().includes("onboarding")) {
        router.push("/onboarding");
        return;
      }
      setErrorMsg(res.error.message);
      return;
    }

    if (res.data?.options) {
      setOptions(res.data.options);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      handleGenerate();
    }
  }, [authLoading, user]);

  const handleSelectOption = async (option: RecipeOption) => {
    const payload = {
      recipe_name: option.recipe_name,
      description: option.description || "",
      total_estimated_price: option.total_estimated_price,
      ingredients: option.ingredients,
    };

    const res = await fetchWithAuth<{ shopping_list_id: number }>("/menu/select", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.error) {
      alert("Gagal menyimpan menu pilihan: " + res.error.message);
      return;
    }

    if (res.data?.shopping_list_id) {
      router.push(`/shopping-list/${res.data.shopping_list_id}`);
    } else {
      router.push("/shopping-list");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rekomendasi Menu AI Hari Ini 🤖
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dibuat khusus berdasarkan budget dan profil preferensi makanan Anda.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>Meracik Menu...</span>
              </>
            ) : (
              <span>🔄 Generate Ulang</span>
            )}
          </button>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-950"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">👨‍🍳</div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                AI Sedang Meracik 3 Opsi Resep Lezat &amp; Hemat...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                Mengombinasikan data bahan lokal, preferensi keluarga, dan estimasi harga terbaru di kotamu.
              </p>
            </div>
          </div>
        )}

        {/* Rate Limit Reached Alert */}
        {isRateLimited && (
          <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                  Batas Generate Harian Tercapai (3/3)
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Anda telah mencapai batas 3x generate harian untuk akun Free. Upgrade ke Premium untuk batas tak terbatas (999x/hari).
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
              >
                <span>⭐ Upgrade ke Premium (Rp 29.000)</span>
              </Link>
            </div>
          </div>
        )}

        {/* Generic Error */}
        {errorMsg && !isRateLimited && !isGenerating && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Display 3 Recipe Options Grid */}
        {!isGenerating && options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((option, index) => (
              <RecipeOptionCard
                key={index}
                option={option}
                optionIndex={index}
                onSelect={handleSelectOption}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
