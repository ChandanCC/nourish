import { useState, useCallback } from 'react';
import { getToken, getUser, setAuth, clearAuth, type AuthUser } from '../lib/auth';

export function useAuth() {
  const [token, setToken] = useState<string | null>(getToken);
  const [user,  setUser]  = useState<AuthUser | null>(getUser);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    setAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, login, logout, isAuthenticated: !!token };
}
