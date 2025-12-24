
import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string): string | undefined => {
  // 1. Vite 표준 환경 변수 확인 (VITE_ 접두사)
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[name]) return viteEnv[name];
    // VITE_ 접두사가 없는 경우도 시도
    if (viteEnv && viteEnv[name.replace('VITE_', '')]) return viteEnv[name.replace('VITE_', '')];
  } catch (e) {}

  // 2. Global process.env 확인 (일부 빌드 환경)
  try {
    const processEnv = (window as any).process?.env;
    if (processEnv && processEnv[name]) return processEnv[name];
    if (processEnv && processEnv[name.replace('VITE_', '')]) return processEnv[name.replace('VITE_', '')];
  } catch (e) {}

  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// 실제 유효한 설정값이 있는지 확인 (플레이스홀더나 빈 값 제외)
export const isConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  !supabaseUrl.includes('placeholder-url') && 
  supabaseUrl.startsWith('https://');

if (!isConfigured) {
  console.warn('Supabase configuration missing or invalid. Check Vercel Environment Variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
