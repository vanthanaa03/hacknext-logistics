import React, { createContext, useContext, useState } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('drova_role') as UserRole) || 'MANAGER';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('drova_user');
    return cached ? JSON.parse(cached) : null;
  });

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem('drova_role', role);
  };

  const loginAsRole = async (role: UserRole) => {
    let email = "manager@drova.logistics";
    let password = "manager123";
    if (role === "DRIVER") {
      email = "arun@drova.logistics";
      password = "driver123";
    } else if (role === "CUSTOMER") {
      email = "customer@drova.logistics";
      password = "customer123";
    }

    try {
      const res = await api.post('/api/auth/login', { email, password, role });
      localStorage.setItem('drova_auth_token', res.data.access_token);
      localStorage.setItem('drova_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setActiveRole(role);
    } catch (e) {
      const fallbackUser: User = {
        id: role === 'MANAGER' ? 1 : (role === 'DRIVER' ? 2 : 5),
        email,
        full_name: role === 'MANAGER' ? 'Rajesh V (Operations Controller)' : (role === 'DRIVER' ? 'Arun Kumar' : 'Priya Sharma'),
        role
      };
      setUser(fallbackUser);
      setActiveRole(role);
    }
  };

  const logout = () => {
    localStorage.removeItem('drova_auth_token');
    localStorage.removeItem('drova_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, setActiveRole, loginAsRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
