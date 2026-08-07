"use client";

import React from "react";
import { useAuth } from "../providers/auth-provider";

export function AdminHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-400">
          Environment: Local Dev (Postgres: 5434)
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-200">{user.email}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Admin Authorized</p>
            </div>

            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
