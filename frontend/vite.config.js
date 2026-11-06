import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend memanggil "/api/..." lalu Vite meneruskannya ke backend Express
// di http://localhost:3000. Dengan begitu backend tidak perlu diubah (tanpa CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
