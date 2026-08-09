"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

interface AuthGuardLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * AuthGuardLink — wrapper link yang memerlukan autentikasi.
 *
 * Jika user belum login, akan redirect ke /login?next=<href> alih-alih
 * langsung navigasi ke tujuan. Setelah login berhasil, user akan
 * dikembalikan ke tujuan aslinya via query param `next`.
 *
 * Jika user sudah login, berperilaku persis seperti <Link> biasa.
 */
export function AuthGuardLink({
  href,
  children,
  className,
  onClick,
}: AuthGuardLinkProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.(e);

    if (!loading && !user) {
      // Belum login — redirect ke halaman login, simpan tujuan asli di `next`
      router.push(`/login?next=${encodeURIComponent(href)}`);
    } else {
      // Sudah login — navigasi langsung ke tujuan
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
