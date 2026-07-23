import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { triggerSourceMapStartupCrash } from './debug/sourceMapStartupCrash'
import router from './router'

import * as Sentry from '@sentry/vue'

const app = createApp(App)
Sentry.init({
  app,
  dsn: 'https://4f80a30b9841781b555469c6ccea1e9c@o4511693184827392.ingest.de.sentry.io/4511693225066576',
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
  },
})
if (import.meta.env.PROD) {
  triggerSourceMapStartupCrash()
}
app.use(createPinia())
app.use(router)

app.mount('#app')
