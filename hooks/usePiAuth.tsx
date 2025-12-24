
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isConfigured } from '../lib/supabase';

interface PiAuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  configError: string | null;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export const PiAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setConfigError("Supabase 설정이 누락되었습니다.");
    }

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
              .maybeSingle();
            
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
          throw new Error('Pi SDK 인증 실패. Pi 브라우저에서 접속하세요.');
        }
      } else {
        await new Promise(r => setTimeout(r, 600));
        piUser = { pi_username: 'Pioneer_Admin', pi_uid: 'dev_mode_admin' };
      }
      
      let finalUserData: User;

      if (isConfigured) {
        // pi_uid 기준으로 Upsert 수행 (중복 가입 방지)
        const { data, error } = await supabase
          .from('users')
          .upsert({ 
            pi_username: piUser.pi_username, 
            pi_uid: piUser.pi_uid,
          }, { onConflict: 'pi_uid' })
          .select()
          .single();

        if (error) {
          console.error("User Upsert Error:", error);
          throw new Error(`데이터베이스 동기화 실패: ${error.message}`);
        }
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
      alert(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pi_links_user');
  };

  return (
    <PiAuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin', configError }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => {
  const context = useContext(PiAuthContext);
  if (!context) throw new Error('usePiAuth must be used within a PiAuthProvider');
  return context;
};
