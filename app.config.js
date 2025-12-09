import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

const appUrl = "https://x.y";


const viteConfig = {
  define: {
    '__APP_URL__': JSON.stringify(appUrl),
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

const firebaseConfig = {
  gen: 2,
  nodeVersion: "22",
  httpsOptions: {
    memory: '256MiB',
    concurrency: 20,
    region: "europe-west1",
    maxInstances: 2,
    minInstances: 0,
    timeoutSeconds: 10,
    serviceAccount: 'website-ssr@timeout-calculator-kei44nd.iam.gserviceaccount.com',
  },
};


export default defineConfig({
  vite: viteConfig,
  middleware: "src/middlewares.mjs",
  ssr: true,
  server: {
    preset: 'firebase',
    firebase: firebaseConfig,
  },
});
