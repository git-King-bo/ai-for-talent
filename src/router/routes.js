import { activeApp } from '@/apps'

export const layoutChildrenRoutes = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '工作台',
      description: '概览系统状态、核心指标和项目运行进度。',
      icon: '01',
      order: 1,
    },
  },
  {
    path: 'talent',
    name: 'talent',
    component: () => import('@/views/talent/index.vue'),
    meta: {
      title: '人才库',
      description: '集中管理候选人、标签、跟进状态和协作信息。',
      icon: '02',
      order: 2,
    },
  },
  {
    path: 'jobs',
    name: 'jobs',
    component: () => import('@/views/jobs/index.vue'),
    meta: {
      title: '职位管理',
      description: '维护职位需求、流程节点和投递阶段。',
      icon: '03',
      order: 3,
    },
  },
]

const sharedRoutes = [
  // {
  //   path: '/',
  //   component: () => import('@/layouts/index.vue'),
  //   redirect: '/dashboard',
  //   children: layoutChildrenRoutes,
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
    },
  },
]

export const appRoutes = [...activeApp.createRoutes(), ...sharedRoutes]
