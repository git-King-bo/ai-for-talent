import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { appRoutes } from './routes'

const isFileProtocol =
  typeof window !== 'undefined' && window.location.protocol === 'file:'

const router = createRouter({
  history: isFileProtocol ? createWebHashHistory() : createWebHistory(import.meta.env.BASE_URL),
  routes: appRoutes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = to.meta?.title ? `${to.meta.title} | AI for Talent` : 'AI for Talent'
  document.title = title
})

export default router
