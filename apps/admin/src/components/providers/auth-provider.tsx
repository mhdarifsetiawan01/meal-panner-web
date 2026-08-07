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

  const checkIsAdmin = (u: SupabaseUser | null): boolean => {
    if (!u) return false;
    const role = u.app_metadata?.role || u.user_metadata?.role;
    return role === "admin";
  };

  useEffect(() => {
    try {
      const supabase = getSupabaseClient();

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin: checkIsAdmin(user),
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
