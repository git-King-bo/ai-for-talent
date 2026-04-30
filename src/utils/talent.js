import { resolveTalentAvatar } from './runtime'

function getTalentInitial(talent) {
  const label = String(talent?.name || talent?.organization || '').trim()

  if (!label) {
    return '?'
  }

  return Array.from(label)[0]?.toUpperCase() || '?'
}

export function normalizeTalentPool(talentPool = []) {
  return talentPool.map((talent, index) => ({
    ...talent,
    avatar: resolveTalentAvatar(talent, index),
    initial: getTalentInitial(talent),
  }))
}
