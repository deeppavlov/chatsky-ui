import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
const apiRoutes = ["/get" , "/save", "/health"];

// Use environment variable to determine the target.
const target = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8000";

const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
  proxyObj[route] = {
    target: target,
    changeOrigin: true,
    secure: false,
    ws: true,
  };
  return proxyObj;
}, {});
export default defineConfig(() => {
  return {
    build: {
      outDir: "../static",
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
