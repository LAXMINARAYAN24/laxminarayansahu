import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Build-time "last updated" date, e.g. "7 Jul 2026"
const buildDate = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
