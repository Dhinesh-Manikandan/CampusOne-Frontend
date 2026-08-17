import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// ── Canonical localStorage keys (single source of truth) ──
export const STORAGE_KEYS = {
  TOKEN:         'gather_token',
  REFRESH_TOKEN: 'gather_refresh_token',
  USER:          'gather_user',
};

// ── One-time cleanup: remove all legacy / duplicate keys ──
const purgeLegacyKeys = () => {
  const legacyKeys = [
    // Old campusone_* keys
    'campusone_token', 'campusone_refresh_token', 'campusone_user', 'campusone_theme',
    // Capital-G duplicates from the bad PowerShell rename
    'Gather_token', 'Gather_refresh_token', 'Gather_user', 'Gather_theme',
    // Generic fallback keys
    'token', 'currentUser', 'isLoggedIn',
    // Old gather_* duplicates that were written alongside (none needed beyond the 3 above)
  ];
  legacyKeys.forEach(k => localStorage.removeItem(k));
};

// ── Role extraction helper ──
const extractRole = (roles, fallbackRole = 'STUDENT') => {
  if (!roles) return fallbackRole;
  const roleList = Array.isArray(roles) ? roles : [roles];
  const normalized = roleList.map(r => {
    if (typeof r === 'string') return r.replace('ROLE_', '');
    if (r && typeof r === 'object') return (r.roleName || r.authority || r.name || '').replace('ROLE_', '');
    return '';
  });
  if (normalized.includes('APP_ADMIN'))   return 'APP_ADMIN';
  if (normalized.includes('EVENT_ADMIN')) return 'EVENT_ADMIN';
  if (normalized.includes('STUDENT'))     return 'STUDENT';
  return normalized[0] || fallbackRole;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Save user to state + single localStorage key ──
  const updateUserState = (newUserData) => {
    if (!newUserData) return;
    const primaryRole = extractRole(newUserData.roles || newUserData.role);
    const updatedUser = {
      ...newUserData,
      role: primaryRole,
      name: newUserData.fullName || newUserData.name
        || (newUserData.email ? newUserData.email.split('@')[0] : 'User'),
    };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // ── Boot: purge legacy keys, then restore session ──
  useEffect(() => {
    purgeLegacyKeys();

    const handleSessionExpired = () => logout();
    window.addEventListener('gather_session_expired', handleSessionExpired);

    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (storedToken) {
        try {
          const profileData = await authService.getProfile(storedToken);
          if (profileData && (profileData.id || profileData.email)) {
            updateUserState(profileData);
            setIsAuthenticated(true);
          } else {
            // Profile endpoint returned empty — fall back to stored user object
            restoreUserFromStorage();
          }
        } catch {
          restoreUserFromStorage();
        }
      }
      setLoading(false);
    };

    initAuth();
    return () => window.removeEventListener('gather_session_expired', handleSessionExpired);
  }, []);

  const restoreUserFromStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
        setIsAuthenticated(true);
      } catch {
        logout();
      }
    } else {
      logout();
    }
  };

  // ── Login ──
  const login = async (identifier, password) => {
    setLoading(true);
    sessionStorage.removeItem('gather_welcomed');
    sessionStorage.removeItem('gather_admin_welcomed');
    try {
      const response = await authService.login({ identifier, password });

      const accessToken  = response.token || response.accessToken || response.jwt;
      const refToken     = response.refreshToken || null;
      const userData     = response.user || response.student || null;

      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      }
      if (refToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refToken);
      }
      if (userData) {
        updateUserState(userData);
      }

      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ──
  const signup = async (signupData) => {
    setLoading(true);
    try {
      const response = await authService.signup(signupData);
      return { success: true, data: response };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem('gather_welcomed');
    sessionStorage.removeItem('gather_admin_welcomed');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, login, signup, logout, updateUser: updateUserState }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
