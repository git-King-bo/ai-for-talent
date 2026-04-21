<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import rawTalentPool from './mockTalentPool.json'

const route = useRoute()
const router = useRouter()
const scrollEl = ref(null)
const draft = ref('')
const isReplying = ref(false)
const isEnded = ref(false)
const replyCursor = ref(0)
let replyTimer = null

const talentPool = computed(() =>
  [...rawTalentPool].sort((left, right) => right.matchScore - left.matchScore),
)

const activeTalentId = computed(() => route.query.id ?? talentPool.value[0]?.id ?? null)

const activeTalent = computed(
  () =>
    talentPool.value.find((talent) => talent.id === activeTalentId.value) ?? talentPool.value[0],
)

const promptLibrary = {
  'talent-zhang-linfeng': [
    '你们现在最想优先推进的合作，是联合研发、产业资源链接，还是下一轮融资交流？',
    '如果进入下一轮沟通，你最希望我重点了解你们哪一块核心能力或落地案例？',
    '好的，我对这个方向有兴趣，建议你把产品进展和阶段性目标整理一下，我们继续深入交流。',
  ],
  'investor-001': [
    '你们现在最核心的产品能力已经验证到什么程度了？',
    '如果我希望进一步了解，接下来一轮沟通你最想重点展开哪部分？',
    '好的，我建议你把当前里程碑和融资计划也整理给我，我们继续推进。',
  ],
  'investor-002': [
    '如果从商业化角度看，你们目前最有把握跑通的是哪个场景？',
    '团队分工和核心成员背景可以再和我讲讲吗？',
    '这条线我有兴趣继续看，后面可以约一次更完整的交流。',
  ],
}

function createDateAt(hour, minute) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
}

function createInitialMessages(talent) {
  if (!talent) return []

  const start = createDateAt(13, 11)
  const focusAreas = (talent.investmentFields ?? talent.researchFields ?? talent.tags ?? []).slice(
    0,
    2,
  )
  const focusText = focusAreas.length ? focusAreas.join('、') : 'AI 与产业协同'

  return [
    {
      id: `${talent.id}-seed-1`,
      sender: 'talent',
      text: `你好，我看了下你的项目方向。${focusText}这几个方向我一直很关注，可以先简单介绍一下你现在最想推进的核心事情吗？`,
      timestamp: start,
    },
    {
      id: `${talent.id}-seed-2`,
      sender: 'me',
      text: '我们现在在做一套 AI 驱动的产业基础设施，重点放在提升复杂场景里的判断效率，已经拿到几家目标客户的试点反馈。',
      timestamp: new Date(start.getTime() + 60 * 1000),
    },
    {
      id: `${talent.id}-seed-3`,
      sender: 'talent',
      text: `明白了。那你们接下来 6 个月最重要的目标，是产品验证、客户增长，还是融资节奏？`,
      timestamp: new Date(start.getTime() + 7 * 60 * 1000),
    },
  ]
}

const messages = ref([])

function resetConversation() {
  messages.value = createInitialMessages(activeTalent.value)
  replyCursor.value = 0
  isReplying.value = false
  isEnded.value = false
  draft.value = ''
}

function formatClock(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatTimeDivider(date) {
  const now = new Date()
  const sameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()

  if (sameDay) return formatClock(date)

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

const conversationItems = computed(() => {
  const items = []

  messages.value.forEach((message, index) => {
    const previous = messages.value[index - 1]
    const shouldShowTime =
      !previous || message.timestamp.getTime() - previous.timestamp.getTime() > 5 * 60 * 1000

    if (shouldShowTime) {
      items.push({
        id: `${message.id}-time`,
        type: 'time',
        label: formatTimeDivider(message.timestamp),
      })
    }

    items.push({
      ...message,
      type: 'message',
    })
  })

  if (isReplying.value) {
    items.push({
      id: 'replying',
      type: 'typing',
    })
  }

  return items
})

const quickFacts = computed(() => {
  const talent = activeTalent.value

  if (!talent) return []

  return [
    { label: '合作风格', value: talent.investmentStyle },
    { label: '教育背景', value: talent.educationBackground?.[0] ?? '待补充' },
    { label: '代表履历', value: talent.workHistory?.[0] ?? '待补充' },
  ]
})

const promptText = computed(() => `${draft.value.length}/500`)

function nextTimestamp() {
  const last = messages.value[messages.value.length - 1]
  const now = new Date()

  if (!last) return now
  if (now.getTime() > last.timestamp.getTime()) return now

  return new Date(last.timestamp.getTime() + 60 * 1000)
}

function buildReplyText() {
  const talent = activeTalent.value
  const prompts = promptLibrary[talent?.id] ?? [
    '你提到的方向我基本理解了，能再讲讲当前最关键的验证结果吗？',
    '这个节奏挺清楚的。团队和客户推进这块，你最希望我重点了解哪一部分？',
    '好的，我对这个项目有继续沟通的兴趣，我们可以约下一轮详细交流。',
  ]

  const text = prompts[Math.min(replyCursor.value, prompts.length - 1)]
  replyCursor.value += 1
  return text
}

function scrollToBottom() {
  nextTick(() => {
    if (!scrollEl.value) return
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  })
}

function handleSend() {
  if (isReplying.value || isEnded.value) return

  const content = draft.value.trim()
  if (!content) return

  messages.value.push({
    id: `me-${Date.now()}`,
    sender: 'me',
    text: content,
    timestamp: nextTimestamp(),
  })

  draft.value = ''
  isReplying.value = true
  scrollToBottom()

  replyTimer = window.setTimeout(() => {
    messages.value.push({
      id: `talent-${Date.now()}`,
      sender: 'talent',
      text: buildReplyText(),
      timestamp: nextTimestamp(),
    })
    isReplying.value = false
    scrollToBottom()
    replyTimer = null
  }, 900)
}

function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleEndDialogue() {
  if (isEnded.value) return

  if (replyTimer) {
    window.clearTimeout(replyTimer)
    replyTimer = null
  }

  draft.value = ''
  isReplying.value = false
  isEnded.value = true

  messages.value.push({
    id: `system-${Date.now()}`,
    sender: 'system',
    text: '本次对话已结束，你可以稍后重新发起新的沟通。',
    timestamp: nextTimestamp(),
  })

  scrollToBottom()

  window.setTimeout(() => {
    router.push({
      name: 'IntelligentSummary',
      query: {
        id: activeTalent.value?.id,
      },
    })
  }, 420)
}

watch(
  () => activeTalent.value?.id,
  () => {
    resetConversation()
    scrollToBottom()
  },
  { immediate: true },
)

watch(
  () => conversationItems.value.length,
  () => {
    scrollToBottom()
  },
)

onMounted(() => {
  scrollToBottom()
})

onBeforeUnmount(() => {
  if (replyTimer) {
    window.clearTimeout(replyTimer)
  }
})
</script>

<template>
  <section class="dialogue-page">
    <div class="dialogue-shell">
      <aside v-if="activeTalent" class="dialogue-sidebar">
        <!-- <button type="button" class="dialogue-sidebar__back" @click="handleBack">返回匹配</button> -->

        <div class="dialogue-sidebar__card">
          <div class="dialogue-sidebar__avatar-wrap">
            <img
              :src="activeTalent.avatar"
              :alt="activeTalent.name"
              class="dialogue-sidebar__avatar"
            />
          </div>

          <h1 class="dialogue-sidebar__name">{{ activeTalent.name }}</h1>
          <p class="dialogue-sidebar__title">
            {{ activeTalent.title }} · {{ activeTalent.organization }}
          </p>
          <span class="dialogue-sidebar__tag">
            {{ activeTalent.investmentFields?.[0] || activeTalent.field || 'AI' }} &amp;
            {{ activeTalent.investmentFields?.[1] || activeTalent.tags?.[0] || '协同交流' }}
          </span>

          <div class="dialogue-sidebar__divider"></div>

          <div class="dialogue-sidebar__section">
            <div class="dialogue-sidebar__group">
              <span class="dialogue-sidebar__group-label">关注方向</span>
              <div class="dialogue-sidebar__chips">
                <span
                  v-for="field in activeTalent.investmentFields"
                  :key="field"
                  class="dialogue-sidebar__chip"
                >
                  {{ field }}
                </span>
              </div>
            </div>

            <div class="dialogue-sidebar__group">
              <span class="dialogue-sidebar__group-label">当前阶段</span>
              <div class="dialogue-sidebar__chips">
                <span
                  v-for="stage in activeTalent.investmentStages"
                  :key="stage"
                  class="dialogue-sidebar__chip dialogue-sidebar__chip--soft"
                >
                  {{ stage }}
                </span>
              </div>
            </div>

            <div class="dialogue-sidebar__facts">
              <div v-for="fact in quickFacts" :key="fact.label" class="dialogue-sidebar__fact">
                <span>{{ fact.label }}</span>
                <strong>{{ fact.value }}</strong>
              </div>
            </div>
          </div>

          <div class="dialogue-sidebar__section dialogue-sidebar__section--score">
            <p class="dialogue-sidebar__section-title">合作匹配度</p>
            <div class="dialogue-sidebar__progress">
              <div
                class="dialogue-sidebar__progress-fill"
                :style="{ width: `${activeTalent.matchScore}%` }"
              ></div>
            </div>
            <p class="dialogue-sidebar__progress-text">{{ activeTalent.matchScore }}%</p>
          </div>
        </div>
      </aside>

      <section class="dialogue-main">
        <div ref="scrollEl" class="dialogue-messages">
          <template v-for="item in conversationItems" :key="item.id">
            <div v-if="item.type === 'time'" class="dialogue-time">{{ item.label }}</div>

            <div v-else-if="item.type === 'typing'" class="dialogue-row dialogue-row--talent">
              <img
                :src="activeTalent.avatar"
                :alt="activeTalent.name"
                class="dialogue-message__avatar"
              />
              <div class="dialogue-bubble dialogue-bubble--talent dialogue-bubble--typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div
              v-else
              class="dialogue-row"
              :class="
                item.sender === 'me'
                  ? 'dialogue-row--me'
                  : item.sender === 'system'
                    ? 'dialogue-row--system'
                    : 'dialogue-row--talent'
              "
            >
              <template v-if="item.sender === 'system'">
                <div class="dialogue-system">
                  {{ item.text }}
                </div>
              </template>

              <template v-if="item.sender === 'talent'">
                <img
                  :src="activeTalent.avatar"
                  :alt="activeTalent.name"
                  class="dialogue-message__avatar"
                />
              </template>

              <div class="dialogue-message">
                <div
                  v-if="item.sender !== 'system'"
                  class="dialogue-bubble"
                  :class="item.sender === 'me' ? 'dialogue-bubble--me' : 'dialogue-bubble--talent'"
                >
                  {{ item.text }}
                </div>
              </div>

              <template v-if="item.sender === 'me'">
                <span class="dialogue-message__me-avatar">我</span>
              </template>
            </div>
          </template>
        </div>

        <div class="dialogue-composer">
          <div class="dialogue-composer__box">
            <textarea
              v-model="draft"
              class="dialogue-composer__input"
              rows="3"
              maxlength="500"
              :disabled="isEnded"
              :placeholder="
                isEnded
                  ? '对话已结束，如需继续沟通请重新发起。'
                  : '输入你的回复...（按 Enter 发送，Shift+Enter 换行）'
              "
              @keydown="handleKeydown"
            ></textarea>
            <div class="dialogue-composer__meta">
              <div class="dialogue-composer__actions">
                <button
                  type="button"
                  class="dialogue-composer__end"
                  :disabled="isEnded"
                  @click="handleEndDialogue"
                >
                  {{ isEnded ? '对话已结束' : '结束对话' }}
                </button>
                <!-- <span>{{ promptText }}</span> -->
              </div>

              <button
                type="button"
                class="btn-submit"
                :disabled="isReplying || isEnded || !draft.trim()"
                @click="handleSend"
              >
                <i>
                  <svg viewBox="0 0 512 512">
                    <path
                      d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05"
                      fill="currentColor"
                    ></path>
                  </svg>
                </i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.dialogue-page {
  height: 100vh;
  padding: 12px;
  overflow: hidden;
}

.dialogue-shell {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 14px;
  height: calc(100vh - 24px);
  min-height: 0;
}

.dialogue-sidebar__card,
.dialogue-main {
  border-radius: 1.6rem;
  background: rgba(18, 31, 56, 0.72);
  /*     background: rgb(49 72 89 / 72%); */
}
.dialogue-sidebar__card {
  border: 1px solid rgba(104, 140, 201, 0.16);
  backdrop-filter: blur(14px);
}

.dialogue-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.dialogue-sidebar__back {
  align-self: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.58rem 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  cursor: pointer;
}

.dialogue-sidebar__card {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
  padding: 1.2rem 1rem;
  color: #fff;
  scrollbar-width: none;
}

.dialogue-sidebar__card::-webkit-scrollbar {
  display: none;
}

.dialogue-sidebar__avatar-wrap {
  display: flex;
  justify-content: center;
}

.dialogue-sidebar__avatar {
  width: 106px;
  height: 106px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 18px 32px rgba(7, 15, 32, 0.32);

  object-fit: cover;
  object-position: center top;
}

.dialogue-sidebar__name {
  margin: 1rem 0 0;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
}

.dialogue-sidebar__title {
  margin: 0.4rem 0 0;
  color: rgba(203, 213, 225, 0.75);
  text-align: center;
  line-height: 1.6;
}

.dialogue-sidebar__tag {
  align-self: center;
  margin-top: 0.8rem;
  border-radius: 999px;
  background: rgba(41, 99, 196, 0.45);
  padding: 0.42rem 0.8rem;
  color: rgba(231, 240, 255, 0.95);
  font-size: 0.82rem;
  font-weight: 700;
}

.dialogue-sidebar__divider {
  height: 1px;
  margin: 1.15rem 0 1rem;
  background: rgba(154, 176, 214, 0.14);
}

.dialogue-sidebar__section + .dialogue-sidebar__section {
  margin-top: auto;
}

.dialogue-sidebar__section--score {
  margin-top: auto;
  padding-top: 1rem;
}

.dialogue-sidebar__group + .dialogue-sidebar__group {
  margin-top: 0.9rem;
}

.dialogue-sidebar__group-label {
  display: block;
  margin-bottom: 0.55rem;
  color: rgba(194, 204, 223, 0.72);
  font-size: 0.82rem;
  font-weight: 700;
}

.dialogue-sidebar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.dialogue-sidebar__chip {
  border: 1px solid rgba(86, 131, 214, 0.26);
  border-radius: 999px;
  background: rgba(41, 99, 196, 0.2);
  padding: 0.3rem 0.62rem;
  color: rgba(239, 246, 255, 0.94);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1;
}

.dialogue-sidebar__chip--soft {
  background: rgba(255, 255, 255, 0.06);
}

.dialogue-sidebar__section-title {
  margin: 0 0 0.75rem;
  color: rgba(194, 204, 223, 0.72);
  font-size: 0.88rem;
  font-weight: 700;
}

.dialogue-sidebar__facts {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.dialogue-sidebar__fact {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
}

.dialogue-sidebar__fact span {
  color: rgba(194, 204, 223, 0.64);
  font-size: 0.8rem;
}

.dialogue-sidebar__fact strong {
  color: rgba(247, 250, 255, 0.96);
  font-size: 0.92rem;
  line-height: 1.55;
}

.dialogue-sidebar__progress {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.dialogue-sidebar__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d7dff, #5de36f);
}

.dialogue-sidebar__progress-text {
  margin: 0.55rem 0 0;
  color: rgba(255, 255, 255, 0.88);
  text-align: right;
  font-weight: 700;
}

.dialogue-main {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.dialogue-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  scrollbar-width: none;
}

.dialogue-messages::-webkit-scrollbar {
  display: none;
}

.dialogue-time {
  width: fit-content;
  margin: 0.4rem auto 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.28rem 0.68rem;
  color: rgba(203, 213, 225, 0.72);
  font-size: 0.78rem;
}

.dialogue-row {
  display: flex;
  margin-bottom: 1rem;
  gap: 0.7rem;
}

.dialogue-row--talent {
  justify-content: flex-start;
}

.dialogue-row--me {
  justify-content: flex-end;
}

.dialogue-row--system {
  justify-content: center;
}

.dialogue-message {
  display: flex;
  max-width: min(76%, 760px);
  flex-direction: column;
  gap: 0.35rem;
}

.dialogue-message__avatar,
.dialogue-message__me-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
}

.dialogue-message__avatar {
  object-fit: cover;
}

.dialogue-message__me-avatar {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #6f61d8, #8b72ff);
  color: #fff;
  font-size: 0.96rem;
  font-weight: 800;
}

.dialogue-bubble {
  border-radius: 1.1rem;
  padding: 0.88rem 1rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.dialogue-bubble--talent {
  background: rgba(243, 244, 246, 0.94);
  color: #111827;
  border-top-left-radius: 0.45rem;
}

.dialogue-bubble--me {
  background: linear-gradient(135deg, #1d7dff, #3c95ff);
  color: #fff;
  border-top-right-radius: 0.45rem;
}

.dialogue-bubble--typing {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0.86rem 1rem;
}

.dialogue-bubble--typing span {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.5);
  animation: typingDot 1.1s infinite ease-in-out;
}

.dialogue-bubble--typing span:nth-child(2) {
  animation-delay: 0.16s;
}

.dialogue-bubble--typing span:nth-child(3) {
  animation-delay: 0.32s;
}

.dialogue-system {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.45rem 0.85rem;
  color: rgba(203, 213, 225, 0.78);
  font-size: 0.8rem;
}

.dialogue-composer {
  flex-shrink: 0;
  padding: 0 1.25rem 1.25rem;
}

.dialogue-composer__box {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.7rem 0.85rem;
}

.dialogue-composer__input {
  width: 100%;
  border: 0;
  resize: none;
  background: transparent;
  color: #111827;
  font: inherit;
  line-height: 1.7;
  outline: none;
}

.dialogue-composer__input:disabled {
  color: rgba(107, 114, 128, 0.82);
  cursor: not-allowed;
}

.dialogue-composer__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: rgba(107, 114, 128, 0.8);
  font-size: 0.78rem;
}

.dialogue-composer__actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.dialogue-composer__end {
  border: 1px solid rgba(239, 68, 68, 0.18);
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.08);
  padding: 0.54rem 0.9rem;
  color: #c23d4a;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.dialogue-composer__end:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.12);
}

.dialogue-composer__end:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@keyframes typingDot {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  40% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@media (max-width: 960px) {
  .dialogue-shell {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .dialogue-sidebar__card {
    padding: 1rem;
  }
}

@media (max-width: 640px) {
  .dialogue-page {
    padding: 8px;
  }

  .dialogue-shell {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(220px, 34vh) minmax(0, 1fr);
    gap: 10px;
    height: calc(100vh - 16px);
  }

  .dialogue-sidebar__back {
    font-size: 0.84rem;
  }

  .dialogue-sidebar {
    min-height: 0;
  }

  .dialogue-sidebar__card {
    min-height: 0;
  }

  .dialogue-sidebar__avatar {
    width: 82px;
    height: 82px;
  }

  .dialogue-message {
    max-width: 84%;
  }

  .dialogue-messages {
    padding: 1rem 0.9rem;
  }

  .dialogue-composer {
    padding: 0 0.9rem 0.9rem;
  }

  .dialogue-message__avatar,
  .dialogue-message__me-avatar {
    width: 30px;
    height: 30px;
  }
}
.btn-submit {
  display: flex;
  padding: 2px;
  background-image: linear-gradient(to top, #ff4141, #9147ff, #3b82f6);
  border-radius: 10px;
  box-shadow: inset 0 6px 2px -4px rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border: none;
  outline: none;
  opacity: 0.7;
  transition: all 0.15s ease;
}

.btn-submit__label {
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.btn-submit i {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: 999px;
  color: #f8fbff;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.btn-submit svg {
  width: 1rem;
  height: 1rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-submit:hover:not(:disabled) i {
  transform: rotate(-12deg) translateX(1px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
