import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";

const APP_VERSION = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./package.json", import.meta.url)),
    "utf8",
  ),
).version as string;

export default defineConfig({
  // Defaults to "/" for oola.vanduo.dev. Override with VITE_BASE only when
  // deliberately testing a non-root layout.
  base: process.env.VITE_BASE ?? "/",
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["vue"],
  },
  ssr: {
    noExternal: ["@vanduo-oss/vd3"],
  },
  server: {
    port: 5180,
    fs: {
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        fileURLToPath(new URL("..", import.meta.url)),
      ],
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
  },
});
