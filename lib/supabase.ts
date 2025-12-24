
import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string): string | undefined => {
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[name]) return viteEnv[name];
  } catch (e) {}

  try {
    const processEnv = (window as any).process?.env;
    if (processEnv && processEnv[name]) return processEnv[name];
  } catch (e) {}

  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder-key';

// 실제 URL이 설정되었는지 확인
export const isConfigured = !supabaseUrl.includes('placeholder-url') && !supabaseAnonKey.includes('placeholder-key');

if (!isConfigured) {
  console.warn('Supabase is not configured. Features will run in Mock Mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
