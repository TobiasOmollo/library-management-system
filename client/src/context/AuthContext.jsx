import { useEffect, useState, useCallback } from 'react';
import { AuthContext } from './auth-context-base';
import { authStorage } from '../api/authStorage';
import { fetchApi } from '../api/client';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    authStorage.clearToken();
    setUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    let active = true;

    const initSession = async () => {
      const token = authStorage.getToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const userData = await fetchApi('/auth/me');
        if (active) setUser(userData);
      } catch {
        if (active) {
          authStorage.clearToken();
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initSession();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('mmu:unauthorized', handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener('mmu:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (email, password) => {
    setError(null);
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data?.access_token) {
      authStorage.setToken(data.access_token);
      const profile = await fetchApi('/auth/me');
      setUser(profile);
      return profile;
    }
    throw new Error('Authentication succeeded but no token was provided.');
  };

  const register = async (email, password, name) => {
    setError(null);
    const payload = { email, password };
    if (name && name.trim()) {
      payload.name = name.trim();
    }

    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isLibrarian: user?.role === 'LIBRARIAN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
