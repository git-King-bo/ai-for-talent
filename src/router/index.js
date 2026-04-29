import { createRouter, createWebHistory } from 'vue-router'
import { resolveDocumentTitle } from '@/config/shell'
import { appRoutes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: appRoutes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = resolveDocumentTitle(to.meta?.title)
})

export default router
