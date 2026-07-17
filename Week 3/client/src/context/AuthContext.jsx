import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import * as authService from '../services/authService';
import { registerUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  // Internal cleanup only (auto-expiry / 401 handling) — token is already dead
  const logout = useCallback((message) => {
    clearLogoutTimer();
    localStorage.removeItem('token');
    setUser(null);
    if (message) toast.info(message);
  }, []);

  // Explicit, user-initiated logout — blacklists the token server-side too
  const logOutUser = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Token may already be invalid — fine, we're logging out anyway
    } finally {
      logout();
    }
  }, [logout]);

  const scheduleAutoLogout = useCallback(
    (token) => {
      clearLogoutTimer();
      try {
        const { exp } = jwtDecode(token);
        const msUntilExpiry = exp * 1000 - Date.now();
        if (msUntilExpiry <= 0) {
          logout('Your session has expired. Please log in again.');
          return;
        }
        logoutTimerRef.current = setTimeout(() => {
          logout('Your session has expired. Please log in again.');
        }, msUntilExpiry);
      } catch {
        logout();
      }
    },
    [logout]
  );

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { exp } = jwtDecode(token);
      if (exp * 1000 < Date.now()) {
        logout();
        setLoading(false);
        return;
      }
      const { user: me } = await authService.getMe();
      setUser(me);
      scheduleAutoLogout(token);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, scheduleAutoLogout]);

  useEffect(() => {
    bootstrap();
    registerUnauthorizedHandler(() => logout('Your session has expired. Please log in again.'));
    return clearLogoutTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    const { token, user: loggedInUser } = await authService.login(credentials);
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    scheduleAutoLogout(token);
    return loggedInUser;
  };

  const registerUser = async (data) => {
    const { token, user: newUser } = await authService.register(data);
    localStorage.setItem('token', token);
    setUser(newUser);
    scheduleAutoLogout(token);
    return newUser;
  };

  const updateUserInState = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAuthor: user?.role === 'author',
        login,
        registerUser,
        logout,
        logOutUser,
        updateUserInState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
