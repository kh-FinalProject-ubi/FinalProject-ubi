import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  server: {
    logLevel: "debug", // ✅ 추가
    port: 5173,
    proxy: {
      "/login/oauth2": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
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
      "/ws-chat": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true, // 중요: WebSocket 활성화
        secure: false,
      },
    },
  },
});
