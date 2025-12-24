
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface PiAuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export const PiAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock initial session check
  useEffect(() => {
    const savedUser = localStorage.getItem('pi_links_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPiUser: User = {
        id: 'user_admin_demo',
        pi_username: 'Pioneer_Admin',
        pi_uid: 'uid_admin_777',
        role: 'admin' // 테스트를 위해 기본적으로 admin 권한 부여
      };

      setUser(mockPiUser);
      localStorage.setItem('pi_links_user', JSON.stringify(mockPiUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pi_links_user');
  };

  return (
    <PiAuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => {
  const context = useContext(PiAuthContext);
  if (!context) throw new Error('usePiAuth must be used within a PiAuthProvider');
  return context;
};
