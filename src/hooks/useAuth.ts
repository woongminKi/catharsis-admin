import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

interface Admin {
  id: string;
  username: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      setAdmin(response.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login({ username, password });
    const { token, admin: adminData } = response.data.data;

    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(adminData));

    setAdmin(adminData);
    setIsAuthenticated(true);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
};
