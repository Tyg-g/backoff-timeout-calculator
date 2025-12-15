import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

const appDomain = "backoff.so";
const appUrl = `https://${appDomain}`;
const appTitle = "Backoff_Calculator";

const hour = 3600;
const day = 24*hour;


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
    prerender: { routes: ["/"] },
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: 'backoff-ssr-server',
        routes: [ { pattern: appDomain, custom_domain: true } ],
        workers_dev: false,
        observability: { enabled: true }
      }
    },
    routeRules: {
      "/**": {
        headers: {
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
          "Strict-Transport-Security": `max-age=${day}; includeSubDomains`,
          "Cross-Origin-Opener-Policy": "same-origin",
          "Cross-Origin-Resource-Policy": "same-origin"
        }
      },
      "/icons/**": {
        headers: {
          "Cache-Control": `max-age=${10*day}, s-maxage=${day}, stale-while-revalidate=${day}, must-revalidate`
        }
      },
      "/*.*": {
        headers: {
          "Cache-Control": `max-age=${day}, s-maxage=${day}, must-revalidate`
        }
      }
    }
  },
});
