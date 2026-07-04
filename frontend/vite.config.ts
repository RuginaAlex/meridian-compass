import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxying /api to the Flask backend means the frontend code can just call
// fetch("/api/..."), the same way it would in production if both were
// served from the same origin. No hardcoded "http://localhost:5000"
// scattered through the code, and no CORS headaches during development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
