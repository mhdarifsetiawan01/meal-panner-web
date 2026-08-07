"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard Overview", icon: "📊" },
  { href: "/price-watch", label: "Price Watch Campaigns", icon: "🏷️" },
  { href: "/submissions", label: "Monitoring Submissions", icon: "📈" },
  { href: "/subscriptions", label: "Plans & Coupons", icon: "💎" },
  { href: "/ai-config", label: "AI Provider Config", icon: "🤖" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/30">
          🛡️
        </div>
        <div>
          <h2 className="font-bold text-slate-100 text-base">MasakApa</h2>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        MasakApa Admin v0.1.0
      </div>
    </aside>
  );
}
