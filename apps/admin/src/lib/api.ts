import { getSessionToken } from "@masakapa/supabase-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ApiResponse<T = any> {
  data: T | null;
  error: {
    message: string;
  } | null;
}

export async function fetchAdminWithAuth<T = any>(
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

    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: {
          message: json.error?.message || `HTTP Error ${res.status}`,
        },
      };
    }

    return json as ApiResponse<T>;
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err.message || "Gagal terhubung ke server backend API Admin.",
      },
    };
  }
}
