import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/images": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // WebSocket 프록시 추가
      "/ws-alert": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        ws: true, // ✅ 핵심!
      },
<<<<<<< HEAD
      '/ws-chat': {
      target: 'ws://localhost:8080',    // ✅
      changeOrigin: true,
      ws: true, // WebSocket용
      secure: false,
=======
      '^/ws-chat/.*': {          // ← 정규식으로 변경
      target: 'http://localhost:8080',
      changeOrigin: true,
      ws: true,   
>>>>>>> f333260b46a3989935dfea7eeaf67a46da9dc6d6
      },
    },
    logLevel: 'debug', 
  },
});
