import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('credit_assistant_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('credit_assistant_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('credit_assistant_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.data);
          localStorage.setItem('credit_assistant_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('credit_assistant_token', access_token);
    localStorage.setItem('credit_assistant_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('credit_assistant_token', access_token);
    localStorage.setItem('credit_assistant_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('credit_assistant_token');
    localStorage.removeItem('credit_assistant_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfileState = (hasProfile = true) => {
    if (user) {
      const updated = { ...user, has_profile: hasProfile };
      setUser(updated);
      localStorage.setItem('credit_assistant_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUserProfileState,
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
