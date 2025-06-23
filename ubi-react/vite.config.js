import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // ✅ 포트 설정은 여기서 숫자 OK
    proxy: {
      "/api": {
        target: "http://localhost", // ✅ Spring 서버 포트 80
        changeOrigin: true,
        secure: false,
      },
    },
  },
});