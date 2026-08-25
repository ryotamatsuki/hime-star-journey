import { defineConfig } from "vite";
// @ts-expect-error: dev-server plugin is authored as a small local ESM module.
import { mapEditorPlugin } from "./vite-plugins/mapEditorPlugin.mjs";

export default defineConfig({
  base: "/hime-star-journey/",
  plugins: [mapEditorPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        mapEditor: "map-editor.html",
        p11Verifier: "p11-browser-verifier.html",
        p12Verifier: "p12-browser-verifier.html"
      }
    }
  }
});
