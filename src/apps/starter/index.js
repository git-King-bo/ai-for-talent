import { createStarterRoutes, starterRouteNames } from './routes'

export const starterApp = {
  id: 'starter',
  name: 'Starter Shell',
  description: 'Minimal starter module for embedding a new project into the Tauri shell.',
  defaultRouteName: starterRouteNames.home,
  routeNames: starterRouteNames,
  createRoutes: createStarterRoutes,
}
