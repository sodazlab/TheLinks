
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isConfigured } from '../lib/supabase';

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

  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem('pi_links_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (isConfigured) {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('pi_uid', parsed.pi_uid)
              .single();
            
            if (data && !error) {
              setUser(data);
              localStorage.setItem('pi_links_user', JSON.stringify(data));
            } else {
              setUser(parsed);
            }
          } else {
            setUser(parsed);
          }
        } catch (e) {
          console.error("Session restore failed", e);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      let piUser;

      if ((window as any).Pi) {
        try {
          const auth = await (window as any).Pi.authenticate(['username'], (onIncompletePaymentFound: any) => {
            console.log('Incomplete payment', onIncompletePaymentFound);
          });
          piUser = {
            pi_username: auth.user.username,
            pi_uid: auth.user.uid,
          };
        } catch (sdkError: any) {
          throw new Error('Pi SDK Error. Use Pi Browser.');
        }
      } else {
        // Mock User for Dev
        await new Promise(r => setTimeout(r, 600));
        piUser = { pi_username: 'Pioneer_Admin', pi_uid: 'dev_mode_admin' };
      }
      
      let finalUserData: User;

      if (isConfigured) {
        const { data, error } = await supabase
          .from('users')
          .upsert({ 
            pi_username: piUser.pi_username, 
            pi_uid: piUser.pi_uid,
          }, { onConflict: 'pi_uid' })
          .select()
          .single();

        if (error) throw new Error(`DB Sync Error: ${error.message}`);
        finalUserData = data;
      } else {
        finalUserData = {
          id: 'mock-id',
          pi_username: piUser.pi_username,
          pi_uid: piUser.pi_uid,
          role: piUser.pi_username.toLowerCase().includes('admin') ? 'admin' : 'user'
        };
      }

      setUser(finalUserData);
      localStorage.setItem('pi_links_user', JSON.stringify(finalUserData));
    } catch (err: any) {
      alert(err.message || 'Login failed');
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
