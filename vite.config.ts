import { defineConfig } from "vite";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  base: "/viz-time-series-app", // is being required to deploy it to gh pages
  plugins: [react(), eslintPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
