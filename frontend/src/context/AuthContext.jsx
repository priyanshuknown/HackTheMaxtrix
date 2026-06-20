import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vidyafund_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('vidyafund_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data;
    localStorage.setItem('vidyafund_token', data.access_token);
    const userData = { id: data.user_id, role: data.role, full_name: data.full_name, email };
    localStorage.setItem('vidyafund_user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const data = res.data;
    localStorage.setItem('vidyafund_token', data.access_token);
    const userData = { id: data.user_id, role: data.role, full_name: data.full_name, email: formData.email };
    localStorage.setItem('vidyafund_user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('vidyafund_token');
    localStorage.removeItem('vidyafund_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
