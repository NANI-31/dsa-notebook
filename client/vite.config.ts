import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode === "analyze" &&
      visualizer({
        open: true,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "decimal.js-light": "decimal.js-light/decimal.mjs",
    },
  },
  // Fix: decimal.js-light ships UMD/CJS browser builds that mess up ESM default imports in Vite.
  // We force resolution to decimal.mjs (pure ESM) using the resolve.alias above,
  // and pre-bundle both recharts and decimal.js-light to guarantee clean module interop.
  optimizeDeps: {
    include: ["decimal.js-light", "recharts"],
  },
  server: {
    port: 5173,
    open: true,
    host: true, //true
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
}));
