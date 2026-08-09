import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campusone_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from GET /api/student/me on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campusone_token');
      if (storedToken) {
        try {
          const profileData = await authService.getProfile(storedToken);
          setUser(profileData);
          setIsAuthenticated(true);
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ identifier, password });
      
      const accessToken = response.token || response.accessToken || response.jwt;
      const refToken = response.refreshToken || null;
      let userData = response.user || response.student || response;

      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem('campusone_token', accessToken);
      }

      if (refToken) {
        localStorage.setItem('campusone_refresh_token', refToken);
      }

      // Fetch fresh profile from GET /api/student/me
      if (accessToken) {
        try {
          const profile = await authService.getProfile(accessToken);
          userData = profile;
        } catch (e) {
          // fallback to login response payload
        }
      }

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('campusone_token');
    localStorage.removeItem('campusone_refresh_token');
    localStorage.removeItem('campusone_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
