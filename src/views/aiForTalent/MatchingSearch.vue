<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeTalentPool } from '@/utils/talent'
import rawTalentPool from './mockTalentPool.json'

const route = useRoute()
const router = useRouter()
const baseTalentPool = normalizeTalentPool(rawTalentPool)

const radarSlots = [
  { x: 69, y: 28 },
  { x: 65, y: 62 },
  { x: 50, y: 81 },
  { x: 30, y: 54 },
  { x: 34, y: 20 },
  { x: 50, y: 13 },
]

const activeRole = computed(() => (route.query.role === 'investor' ? 'investor' : 'founder'))

const normalizedPool = computed(() =>
  [...baseTalentPool].sort((left, right) => right.matchScore - left.matchScore),
)

const centerProfile = computed(() => {
  const targetRole = activeRole.value
  const centerId = route.query.centerId

  return (
    normalizedPool.value.find((talent) => talent.id === centerId) ??
    normalizedPool.value.find((talent) => talent.roleType === targetRole) ??
    normalizedPool.value[0] ??
    null
  )
})

const talentPool = computed(() =>
  normalizedPool.value
    .filter((talent) =>
      activeRole.value === 'investor'
        ? talent.roleType === 'founder'
        : talent.roleType === 'investor',
    )
    .map((talent, index) => ({
      ...talent,
      radarPosition: radarSlots[index % radarSlots.length],
    })),
)

const selectedTalentId = ref(route.query.id ?? null)

const selectedTalent = computed(
  () =>
    talentPool.value.find((talent) => talent.id === selectedTalentId.value) ??
    talentPool.value[0] ??
    null,
)

const recommendedCount = computed(() => talentPool.value.length)
const centerLabel = computed(() =>
  activeRole.value === 'investor' ? '投资者视角，匹配创业者' : '创业者视角，匹配投资者',
)

const drawerReasons = computed(() => {
  const talent = selectedTalent.value

  if (!talent) return []

  const fields = talent.investmentFields ?? talent.researchFields ?? []
  const workHistory = talent.workHistory ?? []

  return [
    `专注于${fields.slice(0, 2).join('、') || talent.field || 'AI 相关'}方向`,
    workHistory[0]?.includes('前')
      ? `具备${workHistory[0].replace(/^前/, '')}的产业资源`
      : `具备${talent.organization}的一线实践经验与行业判断`,
  ]
})

const drawerChallenges = computed(() => {
  const talent = selectedTalent.value

  if (!talent) return []

  const challenges = []
  const investmentStyle = talent.investmentStyle ?? ''
  const investmentStages = talent.investmentStages ?? []

  if (investmentStyle.includes('高密度') || investmentStyle.includes('决策快')) {
    challenges.push('需要高频、结构化地同步项目进展')
  }

  if (investmentStages.some((stage) => stage.includes('A'))) {
    challenges.push('对阶段节奏和运营数据会有更明确要求')
  }

  if (!challenges.length) {
    challenges.push('前期沟通需要更充分，便于快速建立判断')
    challenges.push('需要更清晰地传递长期价值和执行路径')
  }

  return challenges.slice(0, 2)
})

function handleRestart() {
  router.push({ name: 'AiForTalent' })
}

function handleSelectTalent(id) {
  selectedTalentId.value = id
}

function handleStartDialogue() {
  if (!selectedTalent.value) return

  router.push({
    name: 'TalentDialogue',
    query: {
      id: selectedTalent.value.id,
    },
  })
}
</script>

<template>
  <section class="matching-page">
    <div class="matching-shell">
      <header class="matching-header">
        <div>
          <h1 class="matching-header__title">未来启点社区</h1>
          <p class="matching-header__subtitle">
            为你找到 {{ recommendedCount }} 位高度共鸣的潜在伙伴
          </p>
        </div>
      </header>

      <div class="matching-layout">
        <section class="matching-radar-panel">
          <div class="matching-radar__field">
            <span class="matching-radar__glow matching-radar__glow--inner"></span>
            <span class="matching-radar__glow matching-radar__glow--outer"></span>
            <span class="matching-radar__ring matching-radar__ring--outer"></span>
            <span class="matching-radar__ring matching-radar__ring--middle"></span>
            <span class="matching-radar__ring matching-radar__ring--inner"></span>
            <span class="matching-radar__pulse"></span>
            <span class="matching-radar__sweep"></span>
            <span class="matching-radar__crosshair matching-radar__crosshair--horizontal"></span>
            <span class="matching-radar__crosshair matching-radar__crosshair--vertical"></span>

            <div class="matching-radar__center">
              <div class="matching-radar__center-core">
                <span v-if="centerProfile" class="matching-radar__center-avatar">
                  <span class="matching-radar__center-fallback">{{ centerProfile.initial }}</span>
                  <img
                    :src="centerProfile.avatar"
                    :alt="centerProfile.name"
                    class="matching-radar__center-avatar-image"
                  />
                </span>
              </div>
              <!-- <p>{{ centerLabel }}</p> -->
            </div>

            <button
              v-for="talent in talentPool"
              :key="talent.id"
              type="button"
              class="matching-node"
              :class="{ 'matching-node--active': selectedTalent?.id === talent.id }"
              :style="{ left: `${talent.radarPosition.x}%`, top: `${talent.radarPosition.y}%` }"
              @click="handleSelectTalent(talent.id)"
            >
              <span class="matching-node__halo"></span>
              <span class="matching-node__avatar">
                <span class="matching-node__avatar-fallback">{{ talent.initial }}</span>
                <img :src="talent.avatar" :alt="talent.name" class="matching-node__avatar-image" />
              </span>
              <span
                class="matching-node__score"
                :class="{
                  'matching-node__score--high': talent.matchScore >= 85,
                  'matching-node__score--mid': talent.matchScore < 85 && talent.matchScore >= 75,
                  'matching-node__score--low': talent.matchScore < 75,
                }"
              >
                {{ talent.matchScore }}%
              </span>
            </button>
          </div>
        </section>

        <Transition name="panel-fade" mode="out-in">
          <aside v-if="selectedTalent" :key="selectedTalent.id" class="matching-info">
            <div class="matching-info__hero">
              <div class="matching-info__avatar">
                <span class="matching-info__avatar-fallback">{{ selectedTalent.initial }}</span>
                <img
                  :src="selectedTalent.avatar"
                  :alt="selectedTalent.name"
                  class="matching-info__avatar-image"
                />
              </div>

              <div class="matching-info__head">
                <h2 class="matching-info__name">{{ selectedTalent.name }}</h2>
                <p class="matching-info__role">
                  {{ selectedTalent.title }} · {{ selectedTalent.organization }}
                </p>
              </div>
            </div>

            <div class="matching-info__divider"></div>

            <div class="matching-info__score">
              <strong>{{ selectedTalent.matchScore }}%</strong>
              <span>合拍指数</span>
            </div>

            <section class="info-card">
              <h3 class="info-card__title">为什么匹配</h3>
              <ul class="info-card__list">
                <li v-for="reason in drawerReasons" :key="reason" class="info-card__item">
                  <span class="info-card__icon info-card__icon--positive">✓</span>
                  <span>{{ reason }}</span>
                </li>
              </ul>
            </section>

            <section class="info-card">
              <h3 class="info-card__title">潜在挑战</h3>
              <ul class="info-card__list">
                <li v-for="challenge in drawerChallenges" :key="challenge" class="info-card__item">
                  <span class="info-card__icon info-card__icon--warning">!</span>
                  <span>{{ challenge }}</span>
                </li>
              </ul>
            </section>

            <button type="button" class="matching-info__primary" @click="handleStartDialogue">
              发送共鸣信号
            </button>
            <p class="matching-info__hint">发送信号后，对方 Agent 可开启对话</p>
          </aside>
        </Transition>
      </div>

      <footer class="matching-footer">
        <!-- <button type="button" class="matching-footer__ghost" @click="handleRestart">
          返回重测
        </button> -->
      </footer>
    </div>
  </section>
</template>

<style scoped>
.matching-page {
  min-height: 100vh;
  padding: 10px;
}

.matching-shell {
  display: flex;
  min-height: calc(100vh - 20px);
  width: min(1400px, 100%);
  margin: 0 auto;
  flex-direction: column;
  gap: 0.75rem;
}

.matching-header {
  color: #fff;
}

.matching-header__title {
  margin: 0;
  font-size: clamp(1.8rem, 2.8vw, 2.8rem);
  font-weight: 850;
  letter-spacing: -0.05em;
}

.matching-header__subtitle {
  margin: 0.25rem 0 0;
  color: rgba(203, 213, 225, 0.76);
  font-size: 1rem;
}

.matching-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 0.9rem;
  flex: 1;
  min-height: 0;
}

.matching-info {
  border: 1px solid rgba(105, 140, 201, 0.2);
  border-radius: 1.6rem;
  background: rgba(16, 28, 51, 0.5);
  backdrop-filter: blur(10px);
}

.matching-radar-panel {
  display: grid;
  place-items: center;
  min-height: 0;
  overflow: hidden;
}

.matching-radar__field {
  position: relative;
  width: min(780px, calc(100% - 2rem), 76vh);
  aspect-ratio: 1 / 1;
}

.matching-radar__glow,
.matching-radar__ring,
.matching-radar__pulse,
.matching-radar__sweep,
.matching-radar__crosshair {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.matching-radar__glow {
  border-radius: 999px;
  filter: blur(30px);
}

.matching-radar__glow--inner {
  width: 58%;
  height: 58%;
  background: radial-gradient(circle, rgba(87, 157, 255, 0.22), transparent 68%);
}

.matching-radar__glow--outer {
  width: 84%;
  height: 84%;
  background: radial-gradient(circle, rgba(32, 82, 185, 0.1), transparent 74%);
}

.matching-radar__ring--outer {
  width: 86%;
  height: 86%;
  border: 1px dashed rgba(103, 153, 255, 0.22);
  border-radius: 999px;
}

.matching-radar__ring--middle {
  width: 56%;
  height: 56%;
  border: 2px solid rgba(73, 130, 255, 0.2);
  border-radius: 999px;
}

.matching-radar__ring--inner {
  width: 38%;
  height: 38%;
  border: 1px dashed rgba(144, 188, 255, 0.18);
  border-radius: 999px;
}

.matching-radar__pulse {
  width: 22%;
  height: 22%;
  border: 1px solid rgba(120, 177, 255, 0.18);
  border-radius: 999px;
  animation: radarPulse 3.2s ease-out infinite;
}

.matching-radar__sweep {
  width: 86%;
  height: 86%;
  border-radius: 999px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 314deg,
    rgba(132, 201, 255, 0.2) 338deg,
    rgba(132, 201, 255, 0.03) 360deg
  );
  mask: radial-gradient(circle, transparent 0 33%, #000 68%);
  opacity: 0.95;
  animation: radarSweep 8s linear infinite;
}

.matching-radar__crosshair {
  opacity: 0.24;
}

.matching-radar__crosshair--horizontal {
  width: 88%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(144, 188, 255, 0.44), transparent);
}

.matching-radar__crosshair--vertical {
  width: 1px;
  height: 88%;
  background: linear-gradient(180deg, transparent, rgba(144, 188, 255, 0.44), transparent);
}

.matching-radar__center {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  transform: translate(-50%, -50%);
}

.matching-radar__center-core {
  display: grid;
  width: 104px;
  height: 104px;
  place-items: center;
  overflow: hidden;
  border-radius: 999px;
  border: 2px solid rgba(181, 220, 255, 0.38);
  background: radial-gradient(circle at 30% 30%, #6ab8ff, #4176dc);
  color: #fff;
  font-size: 1.45rem;
  font-weight: 800;
  box-shadow:
    0 0 0 12px rgba(72, 120, 188, 0.08),
    0 18px 36px rgba(23, 51, 94, 0.22);
}

.matching-radar__center-avatar {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
}

.matching-radar__center-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.92);
  font-size: 2rem;
  font-weight: 800;
}

.matching-radar__center-avatar-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.matching-radar__center p {
  margin: 0;
  color: rgba(232, 243, 255, 0.84);
  font-size: 0.92rem;
  text-align: center;
}

.matching-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  background: none;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.matching-node__halo {
  position: absolute;
  top: 31px;
  left: 50%;
  width: 84px;
  height: 84px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(109, 174, 255, 0.16), transparent 68%);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.24s ease;
}

.matching-node__avatar {
  position: relative;
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.88);
  color: #fff;
  font-size: 1.6rem;
  font-weight: 800;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(76, 120, 204, 0.9), rgba(55, 86, 148, 0.9));
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.24);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease;
}

.matching-node__avatar-fallback,
.matching-info__avatar-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 800;
}

.matching-node__avatar-image,
.matching-info__avatar-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.matching-node__score {
  border-radius: 999px;
  padding: 0.36rem 0.68rem;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16);
}

.matching-node__score--high {
  background: linear-gradient(135deg, #42cb62, #71db6b);
}

.matching-node__score--mid {
  background: linear-gradient(135deg, #f59e0b, #ffbf66);
}

.matching-node__score--low {
  background: linear-gradient(135deg, #ff7f73, #ff9f9a);
}

.matching-node:hover .matching-node__avatar,
.matching-node--active .matching-node__avatar {
  transform: scale(1.08);
  box-shadow:
    0 18px 32px rgba(15, 23, 42, 0.28),
    0 0 0 10px rgba(82, 137, 235, 0.08);
}

.matching-node:hover .matching-node__halo,
.matching-node--active .matching-node__halo {
  opacity: 1;
}

.matching-info {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.1rem;
  color: #fff;
}

.matching-info__hero {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.matching-info__avatar {
  position: relative;
  display: grid;
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  font-size: 2.2rem;
  font-weight: 800;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(76, 120, 204, 0.9), rgba(55, 86, 148, 0.9));
}

.matching-info__name {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
}

.matching-info__role {
  margin: 0.25rem 0 0;
  color: rgba(201, 210, 226, 0.72);
  font-size: 0.95rem;
}

.matching-info__divider {
  height: 1px;
  background: rgba(154, 176, 214, 0.18);
}

.matching-info__score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0;
}

.matching-info__score strong {
  color: #59d96b;
  font-size: clamp(3.2rem, 4vw, 4.6rem);
  font-weight: 900;
  line-height: 1;
}

.matching-info__score span {
  color: rgba(194, 204, 223, 0.72);
  font-size: 0.95rem;
}

.info-card {
  border: 1px solid rgba(70, 97, 153, 0.55);
  border-radius: 1.2rem;
  background: rgba(40, 56, 91, 0.35);
  padding: 0.9rem 0.95rem;
}

.info-card__title {
  margin: 0 0 0.7rem;
  color: rgba(226, 232, 240, 0.84);
  font-size: 0.92rem;
  font-weight: 700;
}

.info-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.78rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.info-card__item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: rgba(244, 247, 255, 0.95);
  font-size: 0.92rem;
  line-height: 1.45;
}

.info-card__icon {
  display: grid;
  width: 1.35rem;
  height: 1.35rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 900;
}

.info-card__icon--positive {
  background: #35d35a;
  color: #10253e;
}

.info-card__icon--warning {
  background: #ffab1f;
  color: #10253e;
}

.matching-info__primary {
  margin-top: auto;
  border: 0;
  border-radius: 1rem;
  background: linear-gradient(135deg, #2678ff, #2458dc);
  padding: 0.95rem 1rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(18, 97, 255, 0.24);
}

.matching-info__hint {
  margin: 0;
  color: rgba(194, 204, 223, 0.62);
  font-size: 0.84rem;
  text-align: center;
}

.matching-footer {
  display: flex;
}

.matching-footer__ghost {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.62rem 0.96rem;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 700;
  cursor: pointer;
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes radarPulse {
  0% {
    opacity: 0.35;
    transform: translate(-50%, -50%) scale(0.92);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.2);
  }
}

@keyframes radarSweep {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (max-width: 1080px) {
  .matching-layout {
    grid-template-columns: minmax(0, 1fr) 320px;
  }

  .matching-info {
    padding: 1rem;
  }
}

@media (max-width: 880px) {
  .matching-page {
    padding: 10px 10px 18px;
  }

  .matching-shell {
    min-height: auto;
  }

  .matching-layout {
    grid-template-columns: 1fr;
  }

  .matching-radar-panel {
    min-height: 440px;
  }

  .matching-radar__field {
    width: min(560px, calc(100% - 1.25rem));
  }

  .matching-info {
    min-height: auto;
  }

  .matching-info__primary {
    margin-top: 0.15rem;
  }
}

@media (max-width: 640px) {
  .matching-page {
    padding: 8px 8px 16px;
  }

  .matching-shell {
    gap: 0.6rem;
  }

  .matching-header__title {
    font-size: 1.8rem;
  }

  .matching-header__subtitle {
    font-size: 0.9rem;
  }

  .matching-layout {
    gap: 0.75rem;
  }

  .matching-radar-panel,
  .matching-info {
    border-radius: 1.25rem;
  }

  .matching-radar-panel {
    min-height: 360px;
  }

  .matching-radar__center-core {
    width: 84px;
    height: 84px;
    font-size: 1.22rem;
  }

  .matching-node__avatar {
    width: 52px;
    height: 52px;
    font-size: 1.3rem;
  }

  .matching-node__score {
    padding: 0.3rem 0.56rem;
    font-size: 0.74rem;
  }

  .matching-info {
    gap: 0.75rem;
    padding: 0.9rem;
  }

  .matching-info__avatar {
    width: 68px;
    height: 68px;
    font-size: 1.8rem;
  }

  .matching-info__score strong {
    font-size: 3rem;
  }

  .info-card {
    padding: 0.8rem 0.85rem;
  }

  .info-card__item {
    font-size: 0.86rem;
  }
}
</style>
