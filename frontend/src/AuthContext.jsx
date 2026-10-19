import { createContext, useContext, useEffect, useState } from 'react';
import api, { clearTokens, getAccessToken, saveTokens } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(() => Boolean(getAccessToken()));

  // Effect 1: on first load, if a token exists, ask the server who it belongs to.
  useEffect(() => {
    if (!getAccessToken()) return;

    let ignore = false;

    async function loadCurrentUser() {
      try {
        const { data } = await api.get('/auth/me/');
        if (!ignore) setUser(data);
      } catch {
        clearTokens();
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setInitializing(false);
      }
    }

    loadCurrentUser();
    return () => {
      ignore = true;
    };
  }, []);

  // Effect 2: the API client announces that a refresh failed.
  useEffect(() => {
    function handleForcedLogout() {
      setUser(null);
    }
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  async function login(username, password) {
    const { data } = await api.post('/auth/login/', { username, password });
    saveTokens(data.access, data.refresh);
    const me = await api.get('/auth/me/');
    setUser(me.data);
  }

  async function register(username, email, password) {
    await api.post('/auth/register/', { username, email, password });
    await login(username, password);
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  const value = {
    user,
    isAuthed: Boolean(user),
    initializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}