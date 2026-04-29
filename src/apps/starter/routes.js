export const starterRouteNames = {
  home: 'StarterHome',
}

export function createStarterRoutes() {
  return [
    {
      path: '/',
      name: starterRouteNames.home,
      component: () => import('./StarterHome.vue'),
      meta: {
        title: 'Starter Shell',
      },
    },
  ]
}
