import { defineConfig, PluginOption } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { generate } from "@mewhhaha/fx-router/fs-routes";
import path from "path";

const injectMeta = (): PluginOption => {
  return {
    name: "vite-plugin-import-meta",
    renderChunk(code) {
      return code.replaceAll(/import\.meta\.url/g, '"file://"');
    },
  };
};

// Custom plugin: Watch for new files/folders in routes and run fs-routes generate
const routes = (appFolder: string): PluginOption => {
  return {
    name: "vite-plugin-fs-routes-watcher",
    configureServer(server) {
      generate(appFolder);
      server.watcher.on("all", (event, file) => {
        if (event === "change") return;
        if (file.includes(path.join(import.meta.dirname, appFolder))) {
          generate(appFolder);
        }
      });
    },
  };
};

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    injectMeta(),
    routes("./app"),
  ],
  build: {
    target: "esnext",
    rollupOptions: {
      experimental: {
        resolveNewUrlToAsset: true,
      },
      resolve: {
        conditionNames: ["import"],
      },
      moduleTypes: {
        ".jpg": "dataurl",
        ".jpeg": "dataurl",
        ".png": "dataurl",
        ".gif": "dataurl",
        ".svg": "dataurl",
        ".ico": "dataurl",
      },
    },
  },
});
