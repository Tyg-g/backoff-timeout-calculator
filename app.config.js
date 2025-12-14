import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";


const appUrl = "https://backoff.so";
const appTitle = "Backoff_Calculator";


const viteConfig = {
  define: {
    '__APP_URL__': JSON.stringify(appUrl),
    '__APP_TITLE__': JSON.stringify(appTitle),
    '__BUILD_TIME__': JSON.stringify(Date.now()),
  },
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "~": "/src",
    },
  },
};


export default defineConfig({
  vite: viteConfig,
  middleware: "src/middlewares.mjs",
  ssr: true,
  server: {
    preset: "cloudflare_module",
    compatibilityDate: "2025-12-10",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: { name: 'backoff-ssr-server' }
    },
    routeRules: {
      "/**": {
        headers: {
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
        }
      }
    }
  },
});
