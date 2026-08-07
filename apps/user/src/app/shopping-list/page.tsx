"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShoppingListIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/history");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );
}
