// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/users/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { accessToken, user } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser({ user: user, profile: null }); // fetchMe will enrich this
    await fetchUser();
    return user;
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/api/auth/signup', { name, email, password });
    const { accessToken, user } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser({ user: user, profile: null });
    return user;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);