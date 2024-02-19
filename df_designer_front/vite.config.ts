import { UserConfig, defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
const apiRoutes = ["/flows" , "/flows", "/health", '/build', '/socket', '/builds', '/run', '/runs', '/bot', '/bot/build/start', '/bot/build/status'];

// Use environment variable to determine the target.
const target = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8000";

const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
  proxyObj[route] = {
    target: target,
    changeOrigin: false,
    secure: false,
    ws: true,
  };
  return proxyObj;
}, {});
export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "../df_designer/static",
    },
    plugins: [react(), svgr()],
    server: {
      port: 3000,
      proxy: {
        ...proxyTargets,
      },
    },
  };
});
