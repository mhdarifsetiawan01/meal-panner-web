import { getSessionToken, signOut } from "@masakapa/supabase-client";
import { ApiResponse } from "@masakapa/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export type { ApiResponse };

export async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getSessionToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Auto-clear stale session if unauthorized
      if (typeof window !== "undefined") {
        signOut().catch(() => {});
      }
      return {
        data: null,
        error: {
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
          code: "UNAUTHORIZED",
        },
      };
    }

    if (res.status === 502 || res.status === 503 || res.status === 504) {
      return {
        data: null,
        error: {
          message: "Server sedang dalam pemeliharaan (Maintenance).",
          isMaintenance: true,
        },
      };
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        data: null,
        error: {
          message: json.error?.message || `HTTP Error ${res.status}`,
          code: json.error?.code,
          current: json.error?.current,
          max: json.error?.max,
        },
      };
    }

    return json as ApiResponse<T>;
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: "Gagal terhubung ke server API (Maintenance).",
        isMaintenance: true,
      },
    };
  }
}
