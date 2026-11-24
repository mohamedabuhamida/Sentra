"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { API_BASE_URL } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
  provider_priorities?: Record<string, number>;
}

export interface AuthActionResult {
  success: boolean;
  error?: string | null;
  user?: User | null;
  session?: Session | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  signup: (email: string, password: string, fullName?: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<AuthActionResult>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const token = session?.access_token ?? null;

  // Sync the access token to a cookie so Next.js middleware can read it
  const syncCookie = (accessToken: string | null) => {
    if (typeof document === "undefined") return;
    if (accessToken) {
      // 7-day expiry; SameSite=Lax is safe for same-origin nav
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `sentra_auth_token=${accessToken}; path=/; expires=${expires}; SameSite=Lax`;
    } else {
      // Clear the cookie
      document.cookie = "sentra_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  };

  // Fetch real user profile & role from FastAPI backend (bypasses Supabase RLS)
  const loadProfile = useCallback(async (activeUser: User | null, accessToken?: string | null) => {
    if (!activeUser) {
      setProfile(null);
      return;
    }

    if (accessToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            id: data.id || activeUser.id,
            email: data.email || activeUser.email || "",
            full_name: data.full_name || activeUser.user_metadata?.full_name || "",
            role: (data.role || "viewer").toLowerCase(),
            is_active: data.is_active ?? true,
            provider_priorities: data.provider_priorities || {},
          });
          return;
        }
      } catch {
        // Fallback below
      }
    }

    setProfile({
      id: activeUser.id,
      email: activeUser.email || "",
      full_name: activeUser.user_metadata?.full_name || activeUser.email?.split("@")[0] || "User",
      role: "viewer",
      provider_priorities: {},
    });
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (!error && data.session) {
            setSession(data.session);
            setUser(data.session.user ?? null);
            syncCookie(data.session.access_token ?? null);
            await loadProfile(data.session.user ?? null, data.session.access_token ?? null);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            syncCookie(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial Supabase auth session:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          const currentUser = currentSession?.user ?? null;
          setUser(currentUser);
          loadProfile(currentUser, currentSession?.access_token ?? null);
          syncCookie(currentSession?.access_token ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to sign in",
          user: null,
          session: null,
        };
      }

      setSession(data.session);
      setUser(data.user);
      syncCookie(data.session?.access_token ?? null);
      await loadProfile(data.user, data.session?.access_token ?? null);
      return {
        success: true,
        error: null,
        user: data.user,
        session: data.session,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      return {
        success: false,
        error: msg,
        user: null,
        session: null,
      };
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const signup = useCallback(async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || "",
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Sign up registration failed",
          user: null,
          session: null,
        };
      }

      const activeUser = data.user || data.session?.user;
      if (activeUser) {
        // Ensure user record is inserted/upserted in public.user_profiles
        try {
          await supabase.from("user_profiles").upsert({
            id: activeUser.id,
            email: activeUser.email ?? email,
            full_name: fullName || "",
            role: "viewer",
          });
        } catch (dbErr) {
          console.warn("Notice: user_profile upsert handled by db trigger or deferred:", dbErr);
        }

        setProfile({
          id: activeUser.id,
          email: activeUser.email || email,
          full_name: fullName || activeUser.email?.split("@")[0] || "",
          role: "viewer",
        });
      }

      setSession(data.session ?? null);
      setUser(activeUser ?? null);
      return {
        success: true,
        error: null,
        user: activeUser ?? null,
        session: data.session ?? null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up registration failed";
      return {
        success: false,
        error: msg,
        user: null,
        session: null,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      syncCookie(null);
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      await loadProfile(currentUser, data.session?.access_token ?? null);
    } catch (err) {
      console.error("Session refresh error:", err);
    }
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      token,
      loading,
      login,
      signup,
      logout,
      signIn: login,
      signUp: signup,
      signOut: logout,
      signInWithPassword: login,
      refreshSession,
    }),
    [user, session, profile, token, loading, login, signup, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
