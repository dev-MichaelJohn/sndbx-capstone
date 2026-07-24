import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      allow: [
        // Search up to the workspace root (sndbx-capstone/)
        searchForWorkspaceRoot(process.cwd()),
        path.resolve(__dirname, ".."),
      ],
    },
  },
});
