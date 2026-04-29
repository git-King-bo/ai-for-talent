import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseURL = env.VITE_API_BASE_URL || '/api'
  const apiProxyTarget = env.API_PROXY_TARGET
  const shouldProxyApi = apiBaseURL.startsWith('/') && Boolean(apiProxyTarget)

  return {
    plugins: [
      tailwindcss(),
      vue(),
      // vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 8066,
      proxy: shouldProxyApi
        ? {
            [apiBaseURL]: {
              target: apiProxyTarget,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  }
})
