import { defineConfig } from 'vite';
import VitePluginFullReload from 'vite-plugin-full-reload';

export default defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [
    VitePluginFullReload(['**/*.html'], { log: false }),
  ]
});
