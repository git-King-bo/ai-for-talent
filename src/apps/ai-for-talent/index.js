import { createAiForTalentRoutes } from './routes'
import { aiForTalentRouteNames } from './route-names'

export const aiForTalentApp = {
  id: 'ai-for-talent',
  name: 'AI for Talent',
  description: 'AI-powered talent matching and investor-founder workflow demo.',
  defaultRouteName: aiForTalentRouteNames.home,
  routeNames: aiForTalentRouteNames,
  createRoutes: createAiForTalentRoutes,
}
