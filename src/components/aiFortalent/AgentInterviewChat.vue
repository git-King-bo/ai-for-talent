<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  role: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['generate-agent'])

const threadRef = ref(null)
const draft = ref('')
const currentQuestionIndex = ref(0)
const isResponding = ref(false)
const isComplete = ref(false)

const questionSets = {
  founder: [
    {
      title: '最失败的沟通',
      prompt: '描述一次你最失败的融资/合作沟通经历。你准备得很充分，但对方完全没兴趣或误解了你。',
      followup:
        '我听到了一个很典型的创始人信号: 你会认真准备，但更在意是否真的被理解，而不是只拿到表面机会。',
    },
    {
      title: '两难抉择',
      prompt:
        '如果必须在“快速增长但技术平庸”和“技术领先但增长缓慢”之间选一个，你会怎么选？为什么？',
      followup:
        '这说明你对长期壁垒和阶段性生存之间的平衡有自己的判断，这会直接影响我们为你生成的协作型 Agent 性格。',
    },
  ],
  investor: [
    {
      title: '错过的项目',
      prompt: '回忆一个你曾经低估、后来证明非常优秀的项目。你当时忽略了什么信号？',
      followup: '这个回答能帮助我们判断你更依赖结构化判断，还是更依赖创始人直觉。',
    },
    {
      title: '价值排序',
      prompt:
        '如果一个项目技术壁垒很强，但创始人表达能力一般；另一个项目故事很强，但技术护城河一般，你会优先看哪一个？',
      followup: '你的取舍方式会影响 Agent 最终是偏“研究型分析助手”还是“关系型决策助手”。',
    },
  ],
}

const activeRoleId = computed(() =>
  props.role?.id && questionSets[props.role.id] ? props.role.id : 'founder',
)

const activeQuestions = computed(() => questionSets[activeRoleId.value])

const introTitle = computed(() => '深度了解')
const introSubtitle = computed(() =>
  props.role?.title
    ? `最后几个问题，让我们更懂${props.role.title}视角下的你`
    : '最后几个问题，让我们更懂你',
)

const messages = ref([])

function buildAiQuestionMessage(index) {
  const question = activeQuestions.value[index]
  return {
    id: `ai-q-${index}`,
    type: 'ai-question',
    questionNo: index + 1,
    total: activeQuestions.value.length,
    title: question.title,
    content: question.prompt,
  }
}

function initializeMessages() {
  currentQuestionIndex.value = 0
  draft.value = ''
  isResponding.value = false
  isComplete.value = false
  messages.value = [buildAiQuestionMessage(0)]
}

function scrollToBottom() {
  nextTick(() => {
    const el = threadRef.value
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    })
  })
}

function submitAnswer() {
  const content = draft.value.trim()
  if (!content || isResponding.value || isComplete.value) return

  messages.value.push({
    id: `user-${Date.now()}`,
    type: 'user',
    content,
  })

  draft.value = ''
  isResponding.value = true
  scrollToBottom()

  const answeredIndex = currentQuestionIndex.value

  window.setTimeout(() => {
    if (answeredIndex < activeQuestions.value.length - 1) {
      currentQuestionIndex.value += 1
      messages.value.push(buildAiQuestionMessage(currentQuestionIndex.value))
    } else {
      isComplete.value = true
      messages.value.push({
        id: 'ai-final',
        type: 'ai-final',
        title: '你的回答已经足够形成初步画像',
        content: '点击生成你的专属agent',
      })
    }

    isResponding.value = false
    scrollToBottom()
  }, 820)
}

function handleGenerateAgent() {
  emit('generate-agent', {
    role: props.role,
    answers: messages.value.filter((item) => item.type === 'user').map((item) => item.content),
  })
}

watch(
  () => activeRoleId.value,
  () => {
    initializeMessages()
    scrollToBottom()
  },
  { immediate: true },
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <section class="chat-shell">
    <div ref="threadRef" class="chat-thread">
      <header class="hero-card">
        <h1 class="hero-card__title">{{ introTitle }}</h1>
        <p class="hero-card__subtitle">{{ introSubtitle }}</p>
      </header>

      <article
        v-for="(message, index) in messages"
        :key="message.id"
        class="message"
        :class="[`message--${message.type}`, `message--delay-${Math.min(index, 5)}`]"
      >
        <template v-if="message.type === 'ai-question'">
          <div class="message__avatar message__avatar--ai">
            <span class="message__avatar-core">🤖</span>
          </div>
          <div class="message-card message-card--ai">
            <div class="message-card__eyebrow">
              <span class="message-card__pill"
                >问题 {{ message.questionNo }}/{{ message.total }}</span
              >
              <span class="message-card__title">{{ message.title }}</span>
            </div>
            <p class="message-card__text">{{ message.content }}</p>
          </div>
        </template>

        <template v-else-if="message.type === 'ai-final'">
          <div class="message__avatar message__avatar--ai">
            <span class="message__avatar-core">🤖</span>
          </div>
          <div class="message-card message-card--ai message-card--final">
            <h2 class="message-card__final-title">{{ message.title }}</h2>
            <p class="message-card__text">{{ message.content }}</p>
            <button type="button" class="agent-cta" @click="handleGenerateAgent">
              点击生成你的专属agent
            </button>
          </div>
        </template>

        <template v-else>
          <div class="message-card message-card--user">
            <p class="message-card__text">{{ message.content }}</p>
          </div>
          <div class="message__avatar message__avatar--user">
            <span class="message__avatar-core">👤</span>
          </div>
        </template>
      </article>
    </div>

    <form class="composer" @submit.prevent="submitAnswer">
      <div class="composer__frame" :class="{ 'composer__frame--disabled': isComplete }">
        <textarea
          v-model="draft"
          class="composer__input"
          rows="3"
          :disabled="isComplete"
          :placeholder="isComplete ? '问答已完成，点击上方按钮生成专属 agent' : '输入你的回答...'"
        ></textarea>
        <button
          type="submit"
          class="composer__send"
          :disabled="!draft.trim() || isResponding || isComplete"
        >
          {{ isResponding ? '思考中...' : '发送' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.chat-shell {
  display: flex;
  height: 100vh;
  min-height: 0;
  flex-direction: column;
  gap: 1rem;
  padding: 1.2rem 1rem 1rem;
  overflow: hidden;
}

.chat-thread {
  margin: 0 auto;
  display: flex;
  width: min(980px, 100%);
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.25rem;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-thread::-webkit-scrollbar {
  display: none;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  opacity: 0;
  animation: riseIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.message--user {
  justify-content: flex-end;
}

.message--delay-0 {
  animation-delay: 0.04s;
}

.message--delay-1 {
  animation-delay: 0.08s;
}

.message--delay-2 {
  animation-delay: 0.12s;
}

.message--delay-3 {
  animation-delay: 0.16s;
}

.message--delay-4 {
  animation-delay: 0.2s;
}

.message--delay-5 {
  animation-delay: 0.24s;
}

.hero-card {
  margin: 0 auto 0.2rem;
  width: min(980px, 100%);
  padding: 0.15rem 0.1rem 0.45rem;
  text-align: center;
}

.hero-card__eyebrow {
  display: inline-flex;
  margin-bottom: 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.34);
  padding: 0.25rem 0.7rem;
  color: rgba(191, 219, 254, 0.9);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-card__title {
  margin: 0;
  color: rgba(255, 255, 255, 0.98);
  font-size: clamp(1.8rem, 3.2vw, 2.7rem);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.05;
}

.hero-card__subtitle {
  margin: 0.45rem auto 0;
  max-width: 38rem;
  color: rgba(226, 232, 240, 0.72);
  font-size: clamp(0.9rem, 1.4vw, 1.02rem);
  line-height: 1.55;
}

.message__avatar {
  display: flex;
  height: 3.4rem;
  width: 3.4rem;
  flex: 0 0 3.4rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(51, 65, 85, 0.88);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.22);
}

.message__avatar--ai {
  background: radial-gradient(circle at 30% 30%, #5b8dff, #4154d9 72%);
}

.message__avatar--user {
  background: rgba(71, 85, 105, 0.88);
}

.message__avatar-core {
  font-size: 1.25rem;
}

.message-card {
  max-width: min(860px, calc(100% - 4.2rem));
  border-radius: 1.45rem;
  padding: 1.15rem 1.25rem;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
}

.message-card--ai {
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(55, 65, 81, 0.9);
  color: rgba(241, 245, 249, 0.98);
}

.message-card--final {
  background:
    linear-gradient(180deg, rgba(59, 71, 94, 0.96), rgba(41, 47, 62, 0.92)), rgba(51, 65, 85, 0.92);
}

.message-card--user {
  background: linear-gradient(135deg, rgba(63, 121, 255, 0.98), rgba(94, 94, 229, 0.92));
  color: rgba(255, 255, 255, 0.98);
}

.message-card__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.7rem;
}

.message-card__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(78, 132, 255, 0.98), rgba(85, 110, 239, 0.86));
  padding: 0.42rem 0.78rem;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
}

.message-card__title {
  color: rgba(255, 255, 255, 0.98);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.message-card__text {
  margin: 0;
  color: inherit;
  font-size: 0.96rem;
  line-height: 1.75;
  white-space: pre-wrap;
}

.message-card__final-title {
  margin: 0 0 0.55rem;
  color: rgba(255, 255, 255, 0.98);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.agent-cta {
  margin-top: 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f87ff, #6c61ff);
  padding: 0.9rem 1.45rem;
  color: #fff;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(79, 135, 255, 0.26);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.agent-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 135, 255, 0.34);
}

.composer {
  margin: 0 auto;
  width: min(980px, 100%);
  flex: 0 0 auto;
}

.composer__frame {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1.35rem;
  background: rgba(15, 23, 42, 0.72);
  padding: 0.85rem;
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.2);
  backdrop-filter: blur(18px);
}

.composer__frame--disabled {
  opacity: 0.76;
}

.composer__input {
  min-height: 4.8rem;
  width: 100%;
  resize: vertical;
  border: 0;
  outline: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.96);
  font-size: 1rem;
  line-height: 1.8;
}

.composer__input::placeholder {
  color: rgba(203, 213, 225, 0.54);
}

.composer__send {
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f87ff, #6c61ff);
  padding: 0.9rem 1.35rem;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.composer__send:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.composer__send:not(:disabled):hover {
  transform: translateY(-1px);
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 900px) {
  .chat-shell {
    gap: 0.85rem;
    padding: 0.9rem 0.85rem 0.85rem;
  }

  .message {
    gap: 0.7rem;
  }

  .message__avatar {
    height: 3.3rem;
    width: 3.3rem;
    flex-basis: 3.3rem;
  }

  .message-card {
    max-width: calc(100% - 4rem);
    padding: 1.1rem 1rem;
    border-radius: 1.4rem;
  }

  .message-card__eyebrow {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.55rem;
  }

  .message-card__title {
    font-size: 1.18rem;
  }

  .message-card__text {
    font-size: 0.9rem;
    line-height: 1.68;
  }

  .hero-card {
    padding: 0.1rem 0 0.35rem;
  }

  .hero-card__title {
    font-size: 1.55rem;
  }

  .hero-card__subtitle {
    font-size: 0.88rem;
  }

  .composer__frame {
    flex-direction: column;
    align-items: stretch;
  }

  .composer__send {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .message {
    opacity: 1;
    animation: none;
  }

  .agent-cta,
  .composer__send {
    transition: none;
  }
}
</style>
