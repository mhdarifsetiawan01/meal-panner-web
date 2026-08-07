"use client";

import React, { useState } from "react";

export interface Ingredient {
  name: string;
  quantity?: string;
  estimated_price?: number;
}

export interface RecipeOption {
  recipe_name: string;
  description?: string;
  total_estimated_price: number;
  ingredients: Ingredient[];
  instructions?: string[];
}

interface RecipeOptionCardProps {
  option: RecipeOption;
  optionIndex: number;
  onSelect: (option: RecipeOption) => Promise<void>;
}

export function RecipeOptionCard({
  option,
  optionIndex,
  onSelect,
}: RecipeOptionCardProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async () => {
    try {
      setIsSelecting(true);
      await onSelect(option);
    } finally {
      setIsSelecting(false);
    }
  };

  const optionLabels = ["Opsi A — Paling Hemat", "Opsi B — Paling Bergizi", "Opsi C — Praktis & Cepat"];
  const badgeColors = [
    "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    "bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            badgeColors[optionIndex % badgeColors.length]
          }`}
        >
          {optionLabels[optionIndex] || `Opsi Menu ${optionIndex + 1}`}
        </span>

        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
          Rp {(option.total_estimated_price ?? (option as any).estimated_total_price ?? 0).toLocaleString("id-ID")}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {option.recipe_name}
      </h3>

      {option.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
          {option.description}
        </p>
      )}

      {/* Ingredients Section */}
      <div className="flex-1 space-y-3 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Bahan-bahan &amp; Estimasi Harga
        </p>

        <div className="space-y-2 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs">
          {option.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50 last:border-none">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                • {ing.name} {ing.quantity ? `(${ing.quantity})` : ""}
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {ing.estimated_price ? `Rp ${ing.estimated_price.toLocaleString("id-ID")}` : "-"}
              </span>
            </div>
          ))}
        </div>

        {/* Instructions preview */}
        {option.instructions && option.instructions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Langkah Singkat
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {option.instructions.slice(0, 3).map((step, idx) => (
                <li key={idx} className="line-clamp-1">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <button
        onClick={handleSelect}
        disabled={isSelecting}
        className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {isSelecting ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            <span>Membuat Daftar Belanja...</span>
          </>
        ) : (
          <span>Pilih Menu Ini &amp; Buat Daftar Belanja &rarr;</span>
        )}
      </button>
    </div>
  );
}
