import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as AuthApi from "../api/authApi.js";

const AuthContext = createContext(null);

//? Holds the logged-in user and wraps register / login / logout around the cookie session
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await AuthApi.FetchMe();
    setUser(data.user);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const data = await AuthApi.LoginRequest(email, password);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email, password) => {
    const data = await AuthApi.RegisterRequest(email, password);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthApi.LogoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, login, register, logout }),
    [user, loading, refresh, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("'useAuth' must be used inside AuthProvider in order for this to work!");
  }
  return ctx;
}