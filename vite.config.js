import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const processEnvDefines = {};

  Object.keys(env).forEach((key) => {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(env[key]);
  });

  return {
    plugins: [
      react({
        include: /\.(jsx|js)$/,
      }),
    ],
    resolve: {
      alias: {
        "@/Components/ui": path.resolve(__dirname, "src/Components/UI"),
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      ...processEnvDefines,
      "process.env": JSON.stringify(env),
      "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
      global: "window",
    },
    server: {
      port: 3000,
      open: false,
    },
    build: {
      outDir: "build",
      chunkSizeWarningLimit: 1600,
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
  };
});
