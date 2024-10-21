import { defineConfig } from "vite";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  base: "/viz-time-series-app", // Adjust this if deploying to a subdirectory
  plugins: [react(), eslintPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
