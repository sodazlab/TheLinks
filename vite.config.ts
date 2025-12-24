
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel 환경 변수를 클라이언트 코드에서 사용할 수 있도록 설정
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Terser가 설치되어 있지 않아 발생하는 빌드 오류를 해결하기 위해 
    // Vite의 기본 고성능 minifier인 'esbuild'를 사용하거나 설정을 제거합니다.
    minify: 'esbuild', 
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
