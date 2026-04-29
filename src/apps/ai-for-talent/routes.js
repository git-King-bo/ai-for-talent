import { aiForTalentRouteNames } from './route-names'

export function createAiForTalentRoutes() {
  return [
    {
      path: '/',
      alias: '/AiForTalent',
      name: aiForTalentRouteNames.home,
      component: () => import('@/views/aiForTalent/index.vue'),
      meta: {
        title: '智能创投',
      },
    },
    {
      path: '/MatchingSearch',
      name: aiForTalentRouteNames.matchingSearch,
      component: () => import('@/views/aiForTalent/MatchingSearch.vue'),
      meta: {
        title: '人才匹配',
      },
    },
    {
      path: '/TalentDialogue',
      name: aiForTalentRouteNames.talentDialogue,
      component: () => import('@/views/aiForTalent/TalentDialogue.vue'),
      meta: {
        title: '人才对话',
      },
    },
    {
      path: '/IntelligentSummary',
      name: aiForTalentRouteNames.intelligentSummary,
      component: () => import('@/views/aiForTalent/IntelligentSummary.vue'),
      meta: {
        title: '智能总结',
      },
    },
  ]
}
