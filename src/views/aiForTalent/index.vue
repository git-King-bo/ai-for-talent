<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import RoleSelectPanel from '@/components/aiFortalent/RoleSelectPanel.vue'
import SceneQA from '@/components/aiFortalent/SceneQA.vue'
import AgentInterviewChat from '@/components/aiFortalent/AgentInterviewChat.vue'
import AgentProfileAnalysis from '@/components/aiFortalent/AgentProfileAnalysis.vue'

const currentStep = ref('role-select')
const selectedRole = ref(null)
const sceneAnswers = ref([])
const chatAnswers = ref(null)
const isSwitching = ref(false)
const router = useRouter()

const activeView = computed(() => {
  if (currentStep.value === 'role-select') return RoleSelectPanel
  if (currentStep.value === 'scene-qa') return SceneQA
  if (currentStep.value === 'ai-chat') return AgentInterviewChat
  return AgentProfileAnalysis
})

let switchTimer = null

function handleContinue(role) {
  if (isSwitching.value) return

  selectedRole.value = role
  isSwitching.value = true

  switchTimer = window.setTimeout(() => {
    currentStep.value = 'scene-qa'
    isSwitching.value = false
    switchTimer = null
  }, 560)
}

function handleSceneComplete(payload) {
  sceneAnswers.value = payload
  currentStep.value = 'ai-chat'
}

function handleGenerateAgent(payload) {
  chatAnswers.value = payload
  currentStep.value = 'agent-profile'
}

function handleStartMatching(payload = {}) {
  router.push({
    name: 'MatchingSearch',
    query: {
      role: payload.role ?? selectedRole.value?.id ?? 'founder',
      centerId: payload.centerId ?? undefined,
    },
  })
}

function handleRestart() {
  currentStep.value = 'role-select'
  selectedRole.value = null
  sceneAnswers.value = []
  chatAnswers.value = null
}

onBeforeUnmount(() => {
  if (switchTimer) {
    window.clearTimeout(switchTimer)
  }
})
</script>

<template>
  <main class="relative z-10 h-full flex flex-col overflow-hidden">
    <Transition name="experience-switch" mode="out-in">
      <component
        :is="activeView"
        :key="currentStep"
        :is-exiting="currentStep === 'role-select' ? isSwitching : undefined"
        :role="selectedRole"
        :scene-answers="sceneAnswers"
        :chat-answers="chatAnswers"
        @continue="handleContinue"
        @complete="handleSceneComplete"
        @generate-agent="handleGenerateAgent"
        @start-matching="handleStartMatching"
        @restart="handleRestart"
      />
    </Transition>
  </main>
</template>

<style scoped>
.experience-switch-enter-active {
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.7s ease;
}

.experience-switch-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease,
    filter 0.24s ease;
}

.experience-switch-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.988);
  filter: blur(10px);
}

.experience-switch-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.996);
  filter: blur(4px);
}
</style>
