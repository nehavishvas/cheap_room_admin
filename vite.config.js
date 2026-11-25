import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/agoda/Admin/",
  plugins: [react()],
  build: {
    outDir: "build",
  },
});
