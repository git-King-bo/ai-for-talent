export const layoutChildrenRoutes = [
  {
    path: 'overview',
    name: 'overview',
    component: () => import('@/views/desktop/OverviewView.vue'),
    meta: {
      title: '概览',
      description: '查看模板能力、开发入口和桌面环境是否已经准备就绪。',
      icon: '01',
      order: 1,
    },
  },
  {
    path: 'integration',
    name: 'integration',
    component: () => import('@/views/desktop/IntegrationView.vue'),
    meta: {
      title: '集成位',
      description: '把现有前端项目嵌进这个 Electron 壳时，优先改哪些入口。',
      icon: '02',
      order: 2,
    },
  },
  {
    path: 'system',
    name: 'system',
    component: () => import('@/views/desktop/SystemView.vue'),
    meta: {
      title: '系统面板',
      description: '验证运行时信息、预加载桥接和生产打包所需的关键能力。',
      icon: '03',
      order: 3,
    },
  },
]

export const appRoutes = [
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/overview',
    children: layoutChildrenRoutes,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
    },
  },
]
