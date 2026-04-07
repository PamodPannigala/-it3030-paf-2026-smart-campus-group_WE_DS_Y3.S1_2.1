import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // මේකෙන් තමයි Network එකේ අනිත් අයට (ෆෝන් එකට) පේජ් එක පෙන්වන්නේ
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/oauth2": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/logout": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
