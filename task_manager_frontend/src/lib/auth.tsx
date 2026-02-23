"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError, type User } from "@/lib/api";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  // PUBLIC_INTERFACE
  login: (email: string, password: string) => Promise<void>;
  // PUBLIC_INTERFACE
  signup: (email: string, password: string) => Promise<void>;
  // PUBLIC_INTERFACE
  logout: () => void;
};

const STORAGE_KEY = "tm_token_v1";

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!token) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /** Provides auth state and actions (login/signup/logout) backed by localStorage. */
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
  });

  const hydrate = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setState({ token: null, user: null, loading: false });
      return;
    }

    try {
      const user = await api.me(token);
      setState({ token, user, loading: false });
    } catch {
      // token invalid/expired
      setStoredToken(null);
      setState({ token: null, user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const resp = await api.login(email, password);
      setStoredToken(resp.access_token);
      // Prefer user returned in login response, otherwise fetch /me
      const user = resp.user ?? (await api.me(resp.access_token));
      setState({ token: resp.access_token, user, loading: false });
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      if (e instanceof ApiError) throw e;
      throw new Error("Login failed");
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const resp = await api.signup(email, password);
      setStoredToken(resp.access_token);
      const user = resp.user ?? (await api.me(resp.access_token));
      setState({ token: resp.access_token, user, loading: false });
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      if (e instanceof ApiError) throw e;
      throw new Error("Signup failed");
    }
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setState({ token: null, user: null, loading: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
    }),
    [state, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /** Access auth state/actions. Must be used under <AuthProvider/>. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
