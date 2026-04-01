import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await authService.me();
        if (active) {
          setUser(data.user || null);
        }
      } catch {
        localStorage.removeItem('token');
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrapAuth();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await authService.login(payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser((prev) => ({
      ...(prev || {}),
      ...(nextUser || {}),
    }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
