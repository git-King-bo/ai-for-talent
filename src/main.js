import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

function hideBootSplash() {
  const splash = document.getElementById('boot-splash')
  if (!splash) return

  if (splash.dataset.desktop !== 'true') {
    splash.remove()
    return
  }

  splash.classList.add('is-hidden')
  window.setTimeout(() => splash.remove(), 500)
}

async function bootstrap() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.mount('#app')

  await router.isReady()
  window.requestAnimationFrame(() => hideBootSplash())
}

bootstrap()
