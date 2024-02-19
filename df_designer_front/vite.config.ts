import { UserConfig, defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
const apiRoutes = ["/flows" , "/flows", "/health", '/build', '/socket', '/builds', '/run', '/runs', '/bot', '/bot/build/start', '/bot/build/status', '/bot/build/stop', '/bot/run/start', '/bot/run/status', '/bot/run/stop'];

// Use environment variable to determine the target.
const target = process.env.VITE_PROXY_TARGET || "http://0.0.0.0:8000";

console.log(process.env.VITE_PROXY_TARGET)

const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
  proxyObj[route] = {
    target: target,
    changeOrigin: true,
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
      host: "0.0.0.0",
      port: 3000,
      proxy: {
        ...proxyTargets,
      },
    },
  };
});
