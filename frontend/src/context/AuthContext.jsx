import { createContext, useContext, useEffect, useState } from "react";

import {
  authApi,
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const session = getStoredSession();
      if (!session?.access) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await authApi.me();
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        clearStoredSession();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const session = await authApi.login(credentials);
    setStoredSession({
      access: session.access,
      refresh: session.refresh,
      user: session.user,
    });
    setUser(session.user);
    return session.user;
  }

  async function register(payload) {
    await authApi.register(payload);
    return login({ username: payload.username, password: payload.password });
  }

  function logout() {
    clearStoredSession();
    setUser(null);
  }

  async function refreshProfile() {
    const profile = await authApi.me();
    setUser(profile);
    const currentSession = getStoredSession();
    if (currentSession) {
      setStoredSession({ ...currentSession, user: profile });
    }
    return profile;
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
