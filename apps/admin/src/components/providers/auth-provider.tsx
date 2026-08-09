"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getSupabaseClient,
  signInWithGoogle as supabaseSignInWithGoogle,
  signOut as supabaseSignOut,
  Session,
  SupabaseUser,
} from "@masakapa/supabase-client";

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Fetch role from the backend API (source of truth = users.role in DB).
   * This is called after a valid Supabase session is confirmed.
   */
  const fetchRoleFromAPI = async (accessToken: string): Promise<boolean> => {
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const res = await fetch(`${apiURL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return false;
      const json = await res.json();
      return json?.data?.role === "admin";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    try {
      const supabase = getSupabaseClient();

      supabase.auth.getSession().then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.access_token) {
          const adminStatus = await fetchRoleFromAPI(session.access_token);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }

        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.access_token) {
          const adminStatus = await fetchRoleFromAPI(session.access_token);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }

        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn("[Admin AuthProvider] Supabase client init error:", err);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async (redirectTo?: string) => {
    await supabaseSignInWithGoogle(redirectTo);
  };

  const signOut = async () => {
    await supabaseSignOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
