<template>
  <div class="quiz-card">
    <!-- 进度与标题区域 -->
    <div class="quiz-header">
      <div class="progress-info">
        <span class="question-counter">第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题</span>
        <span class="answered-status">已完成: {{ answeredCount }} / {{ totalQuestions }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="progressFillStyle"></div>
      </div>
    </div>

    <!-- 题目主体 -->
    <div class="question-container">
      <h2 class="question-title">{{ currentQuestion.title }}</h2>
      <div class="scenario-text">{{ currentQuestion.scenario }}</div>

      <div class="options-list">
        <div
          v-for="option in currentQuestion.options"
          :key="option.value"
          class="option-item"
          :class="{ selected: currentSelectedValue === option.value }"
          @click="selectOption(option.value)"
        >
          <div class="option-radio">
            <div
              class="custom-radio"
              :class="{ checked: currentSelectedValue === option.value }"
            ></div>
          </div>
          <div class="option-content">
            <div class="option-label">{{ option.label }}</div>
            <div class="option-desc">{{ option.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="quiz-footer">
      <button class="nav-btn prev-btn" :disabled="currentIndex === 0" @click="prevQuestion">
        ← 上一题
      </button>

      <button
        class="nav-btn next-btn"
        :class="{ 'submit-mode': isLastQuestion }"
        @click="handleNextOrSubmit"
      >
        {{ isLastQuestion ? '进入开放问答 →' : '下一题 →' }}
      </button>
    </div>

    <!-- 结果汇总面板 (仅在提交后显示) -->
    <!-- <div v-if="showResult" class="result-panel">
      <div class="result-header">
        <span>📋 选择结果汇总</span>
        <button class="close-result" @click="showResult = false">✕</button>
      </div>
      <div class="result-list">
        <div v-for="(question, idx) in questions" :key="question.id" class="result-item">
          <div class="result-question">Q{{ idx + 1 }}. {{ question.title }}</div>
          <div class="result-answer" :class="{ 'not-answered': !selectedAnswers[idx] }">
            {{ selectedAnswers[idx] ? getOptionLabel(question, selectedAnswers[idx]) : '未作答' }}
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['complete'])

// ---------- Mock 数据 ----------
const questions = ref([
  {
    id: 1,
    title: '资源困境选择',
    scenario:
      '你的团队现在有两个机会：\nA）一位知名投资人愿意见你，但他比较关注商业模式和增长数据，对技术细节不太感兴趣。\nB）一位技术背景的天使投资人，投资金额不大，但他有深厚的产业资源，愿意深度参与技术路线讨论。\n\n根据你的优先级判断，你会如何选择？',
    options: [
      { value: 'A', label: '明确选A', description: '大机构能带来即时的品牌效应和资金，这最重要' },
      { value: 'B', label: '偏向A', description: '先拿大钱活下来，技术可以自己慢慢磨' },
      { value: 'C', label: '偏向B', description: '早期需要懂的人支持，钱够用就行' },
      { value: 'D', label: '明确选B', description: '技术壁垒是核心，不懂技术的钱拿着烫手' },
    ],
  },
  {
    id: 2,
    title: '技术路线分歧',
    scenario:
      '技术团队在架构选型上存在争议：一部分人倾向于使用成熟稳定的旧技术栈保证交付速度，另一部分人希望尝试新技术以获得长期优势。作为负责人，你如何决策？',
    options: [
      { value: 'A', label: '明确选稳定', description: '先保证产品上线，生存第一' },
      { value: 'B', label: '偏向稳定', description: '适当引入新技术但以稳定为主' },
      { value: 'C', label: '偏向新技术', description: '技术债未来要还，支持探索' },
      { value: 'D', label: '明确选新技术', description: '技术领先是核心竞争力，必须冒险' },
    ],
  },
  {
    id: 3,
    title: '市场与产品优先级',
    scenario:
      '你的创业项目即将进入关键阶段，但资源有限。市场团队希望投入更多预算做营销抢占份额，产品团队则坚持要完善核心功能提升用户体验。你会如何平衡？',
    options: [
      { value: 'A', label: '明确选市场', description: '流量为王，快速占领用户心智最重要' },
      { value: 'B', label: '偏向市场', description: '适当兼顾产品，但营销优先驱动增长' },
      { value: 'C', label: '偏向产品', description: '产品体验是留存根本，营销暂缓' },
      { value: 'D', label: '明确选产品', description: '极致产品才能建立长期壁垒，市场次之' },
    ],
  },
  {
    id: 4,
    title: '团队文化冲突',
    scenario:
      '团队中出现了“结果导向”与“过程规范”两种文化冲突。一部分成员追求快速迭代、试错成长，另一部分强调流程严谨、风险控制。你作为管理者更倾向哪种风格？',
    options: [
      { value: 'A', label: '明确选结果', description: '速度决定成败，先跑起来再优化' },
      { value: 'B', label: '偏向结果', description: '核心目标优先，适当规范即可' },
      { value: 'C', label: '偏向规范', description: '减少返工成本，稳健更重要' },
      { value: 'D', label: '明确选规范', description: '流程是规模化基础，必须严格遵循' },
    ],
  },
])

// 记录每个问题的答案 (存储选项的 value)
const selectedAnswers = ref(Array(questions.value.length).fill(null))
const currentIndex = ref(0)

// 当前题目的选中值 (用于视图绑定)
const currentSelectedValue = ref(null)

// 计算属性
const totalQuestions = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === totalQuestions.value - 1)
const answeredCount = computed(
  () => selectedAnswers.value.filter((answer) => answer !== null).length,
)
const progressPercent = computed(() => (answeredCount.value / totalQuestions.value) * 100)
const progressFillStyle = computed(() => {
  const percent = progressPercent.value
  const startHue = 210
  const endHue = 138
  const accentHue = 188
  const hue = startHue - ((startHue - endHue) * percent) / 100
  const accent = startHue - ((startHue - accentHue) * percent) / 100

  return {
    width: `${percent}%`,
    background: `linear-gradient(90deg,
      hsl(${hue} 88% 60%) 0%,
      hsl(${accent} 92% 58%) 55%,
      hsl(${endHue} 78% 54%) 100%)`,
    boxShadow: `0 0 18px hsla(${accent}, 90%, 60%, 0.35)`,
  }
})

// 监听当前题目索引变化，恢复已选答案
watch(
  currentIndex,
  (newIndex) => {
    currentSelectedValue.value = selectedAnswers.value[newIndex] || null
  },
  { immediate: true },
)

// 选择选项
function selectOption(optionValue) {
  // 更新当前题目的答案
  selectedAnswers.value[currentIndex.value] = optionValue
  currentSelectedValue.value = optionValue
}

// 上一题
function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 下一题或提交
function handleNextOrSubmit() {
  if (isLastQuestion.value) {
    // 提交答案
    submitAnswers()
  } else {
    currentIndex.value++
  }
}

// 提交逻辑: 检查完整性并进入下一环节
function submitAnswers() {
  const unanswered = selectedAnswers.value.filter((a) => a === null).length
  if (unanswered > 0) {
    alert(`还有 ${unanswered} 道题目未作答，请完成所有题目后再提交。`)
    // 可选：自动跳转到第一个未答题
    const firstUnansweredIndex = selectedAnswers.value.findIndex((a) => a === null)
    if (firstUnansweredIndex !== -1) {
      currentIndex.value = firstUnansweredIndex
    }
    return
  }

  emit(
    'complete',
    questions.value.map((question, idx) => ({
      id: question.id,
      title: question.title,
      selectedValue: selectedAnswers.value[idx],
      selectedOption: question.options.find(
        (option) => option.value === selectedAnswers.value[idx],
      ),
    })),
  )
}
</script>

<style scoped>
/* 整体卡片样式 */
.quiz-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  transition: all 0.2s ease;
}

/* 头部区域 */
.quiz-header {
  padding: 1.5rem 2rem 1rem 2rem;
  background: #fafcff;
  border-bottom: 1px solid #eef2f6;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #4b5563;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.question-counter {
  background: #eef2ff;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  color: #1e40af;
}

.answered-status {
  color: #2d3e50;
}

.progress-bar {
  background: #e4e7eb;
  border-radius: 12px;
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
}

/* 题目容器 */
.question-container {
  flex: 1;
  overflow: auto;
  padding: 2rem 2rem 1.5rem 2rem;
}

.question-title {
  font-size: 1.7rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b, #2d3e50);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  letter-spacing: -0.3px;
}

.scenario-text {
  background: #f8fafc;
  padding: 1.2rem 1.5rem;
  border-radius: 20px;
  color: #1e2a3e;
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  margin-bottom: 2rem;
  border: 1px solid #eef2f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: #ffffff;
  border: 1.5px solid #e9edf2;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  background: #fafdff;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px -8px rgba(0, 0, 0, 0.08);
}

.option-item.selected {
  border-color: #3b82f6;
  background: #f0f7ff;
  box-shadow: 0 6px 14px -8px rgba(59, 130, 246, 0.25);
}

/* 自定义 radio 样式 */
.option-radio {
  flex-shrink: 0;
  padding-top: 2px;
}

.custom-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: white;
  transition: all 0.15s;
  position: relative;
}

.custom-radio.checked {
  border-color: #3b82f6;
  background: #3b82f6;
  box-shadow: inset 0 0 0 3px white;
}

.option-content {
  flex: 1;
}

.option-label {
  font-weight: 700;
  font-size: 1rem;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.option-desc {
  font-size: 0.85rem;
  color: #5b6e8c;
  line-height: 1.4;
}

/* 底部按钮区域 */
.quiz-footer {
  padding: 1.2rem 2rem 2rem 2rem;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eff3f8;
  background: #ffffff;
}

.nav-btn {
  padding: 0.7rem 1.8rem;
  border-radius: 40px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #1e293b;
}

.prev-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.next-btn {
  background: #1e293b;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.next-btn:hover:not(:disabled) {
  background: #0f172a;
  transform: translateX(2px);
}

.submit-mode {
  background: linear-gradient(95deg, #2563eb, #1d4ed8);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.25);
}

.submit-mode:hover {
  background: linear-gradient(95deg, #1d4ed8, #1e40af);
  transform: scale(0.98);
}

/* 结果面板 */
.result-panel {
  margin: 0 2rem 2rem 2rem;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 24px;
  overflow: hidden;
  animation: fadeSlideUp 0.3s ease;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #fffbeb;
  border-bottom: 1px solid #fde047;
  font-weight: 700;
  color: #a16207;
}

.close-result {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #a16207;
  transition: 0.1s;
}

.close-result:hover {
  color: #854d0e;
}

.result-list {
  padding: 0.8rem 1.5rem;
  max-height: 320px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.8rem 0;
  border-bottom: 1px dashed #fdecc8;
}

.result-question {
  font-weight: 500;
  color: #3b2e1e;
  font-size: 0.9rem;
  flex: 1;
}

.result-answer {
  font-weight: 600;
  background: #fef3c7;
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #92400e;
}

.result-answer.not-answered {
  background: #fee2e2;
  color: #b91c1c;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .quiz-card {
    margin: 1rem;
    border-radius: 24px;
  }
  .question-container,
  .quiz-header,
  .quiz-footer {
    padding-left: 1.2rem;
    padding-right: 1.2rem;
  }
  .question-title {
    font-size: 1.4rem;
  }
  .option-item {
    padding: 0.8rem 1rem;
  }
  .nav-btn {
    padding: 0.5rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>
