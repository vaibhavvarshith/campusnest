import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password, portal) => {
    const endpoint = portal ? `/auth/login/${portal}` : '/auth/login';
    const res = await api.post(endpoint, { username, password });
    if (res.success && res.data) {
      const authData = res.data;
      localStorage.setItem('token', authData.token);
      setToken(authData.token);

      const userInfo = {
        id: authData.userId,
        username: authData.username,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        firstLogin: authData.firstLogin,
        studentId: authData.studentId,
        facultyId: authData.facultyId,
        identifier: authData.identifier,
        department: authData.department
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      return userInfo;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    if (res.success) {
      if (user) {
        const updated = { ...user, firstLogin: false };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    }
    return res;
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, changePassword, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
