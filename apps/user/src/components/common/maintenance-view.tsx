"use client";

import React from "react";

interface MaintenanceViewProps {
  onRetry?: () => void;
  message?: string;
}

export function MaintenanceView({ onRetry, message }: MaintenanceViewProps) {
  return (
    <div className="py-16 px-6 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 shadow-xl max-w-lg mx-auto my-8">
      <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-4xl shadow-inner animate-pulse">
        🛠️
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Server Sedang Pemeliharaan (Maintenance)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
          {message || "Sistem API MasakApa sedang tidak terjangkau atau dalam pemeliharaan rutin. Silakan coba beberapa saat lagi."}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
          >
            <span>🔄 Coba Koneksi Lagi</span>
          </button>
        </div>
      )}
    </div>
  );
}
