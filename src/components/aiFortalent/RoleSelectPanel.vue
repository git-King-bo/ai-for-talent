<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['continue'])
defineProps({
  isExiting: {
    type: Boolean,
    default: false,
  },
})

const roles = [
  {
    id: 'founder',
    title: '创业者',
    description: '寻找真正理解你愿景的伙伴，建立长期价值导向关系',
    accent: 'from-blue-500 to-sky-400',
    ring: 'ring-blue-400/70',
    glow: 'shadow-[0_0_32px_rgba(59,130,246,0.28)]',
    points: [
      '寻找有技术/产业背景的投资人',
      '匹配沟通风格和价值观',
      '获得导师型或资源型支持',
      '避免只谈 ROI 的投资人',
    ],
    icon: 'rocket',
  },
  {
    id: 'investor',
    title: '投资者',
    description: '发现真正有潜力的创业者，找到志同道合的合作伙伴',
    accent: 'from-sky-500 to-cyan-400',
    ring: 'ring-white/40',
    glow: 'shadow-[0_0_28px_rgba(125,211,252,0.18)]',
    points: [
      '发现技术驱动的优质项目',
      '匹配投资风格和偏好',
      '提前了解创业者真实特质',
      '避免不适合的项目',
    ],
    icon: 'capital',
  },
]

const selectedRole = ref('founder')

const selectedRoleData = computed(() => roles.find((role) => role.id === selectedRole.value))

function handleContinue() {
  if (!selectedRoleData.value) return
  emit('continue', selectedRoleData.value)
}
</script>

<template>
  <section
    class="relative mx-auto min-h-screen w-full px-3 py-6 sm:px-6 sm:py-8 lg:px-8"
    :class="{ 'role-panel--exiting': isExiting }"
  >
    <div
      class="rolePanel relative grid min-h-[calc(100vh-3rem)] grid-rows-[auto_1fr_auto] sm:min-h-[calc(100vh-4rem)] sm:px-5 sm:py-2"
    >
      <div
        class="reveal reveal--header mx-auto flex w-full max-w-2xl flex-col items-center pt-2 text-center sm:pt-4"
      >
        <p
          class="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-slate-300/55 sm:text-[0.68rem]"
        >
          Role Selection
        </p>
        <h1
          class="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
          style="font-family: Georgia, 'Times New Roman', serif"
        >
          你是谁- v5?
        </h1>
        <p class="mx-auto mt-2 max-w-lg text-xs leading-6 text-slate-300/82 sm:mt-3 sm:text-sm">
          选择你的当前身份，我们会给你更贴合的匹配路径与体验入口。
        </p>
      </div>

      <div class="flex items-center py-5 sm:py-6">
        <div class="grid w-full grid-cols-2 gap-3 sm:gap-5 lg:gap-10 xl:gap-14">
          <button
            v-for="(role, index) in roles"
            :key="role.id"
            type="button"
            class="role-card reveal reveal--card group relative cursor-pointer overflow-visible rounded-[1.6rem] px-3 pb-3 pt-8 text-left transition duration-300 ease-out hover:-translate-y-1 sm:rounded-[1.9rem] sm:px-5 sm:pb-5 sm:pt-10"
            :class="
              selectedRole === role.id
                ? ['ring-2', role.ring, role.glow, 'scale-[1.01]']
                : 'shadow-[0_10px_30px_rgba(15,23,42,0.14)]'
            "
            :style="{ '--reveal-delay': `${220 + index * 140}ms` }"
            @click="selectedRole = role.id"
          >
            <div
              class="absolute inset-x-4 top-0 h-1 rounded-full bg-gradient-to-r transition-opacity duration-300"
              :class="[role.accent, selectedRole === role.id ? 'opacity-100' : 'opacity-0']"
            ></div>

            <div
              class="role-card__notch pointer-events-none absolute left-1/2 top-0 h-7 w-16 -translate-x-1/2 -translate-y-px rounded-b-full sm:h-8 sm:w-20"
            ></div>

            <div class="flex h-full flex-col">
              <div
                class="role-card__avatar absolute left-1/2 top-0 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-[58%] items-center justify-center rounded-full border-[6px] bg-gradient-to-br text-white shadow-[0_18px_34px_rgba(15,23,42,0.3)] sm:h-20 sm:w-20 sm:border-[7px]"
                :class="role.accent"
              >
                <svg
                  v-if="role.icon === 'rocket'"
                  viewBox="0 0 64 64"
                  fill="none"
                  class="h-8 w-8 sm:h-11 sm:w-11"
                  aria-hidden="true"
                >
                  <path
                    d="M38.8 11.5c7.1-2.2 12.6-1 13.7.1 1.1 1.1 2.2 6.6 0 13.7l-8 8c-.9.9-2.1 1.4-3.3 1.4H31.3L22.6 44l-7.1-.4.4-7.1 9.3-8.7v-9.9c0-1.2.5-2.4 1.4-3.3l8.2-8.1Z"
                    fill="currentColor"
                  />
                  <path
                    d="m17.4 46.6-4 4"
                    stroke="currentColor"
                    stroke-width="4.5"
                    stroke-linecap="round"
                  />
                  <path d="M39.5 23.5a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" fill="#dbeafe" />
                  <path
                    d="M23 39.8 15.6 47M28.6 45.2l-7.8 7.8"
                    stroke="currentColor"
                    stroke-width="4.5"
                    stroke-linecap="round"
                  />
                </svg>

                <svg
                  v-else
                  viewBox="0 0 64 64"
                  fill="none"
                  class="h-8 w-8 sm:h-11 sm:w-11"
                  aria-hidden="true"
                >
                  <path
                    d="M23 24.5c0-5 4-9 9-9s9 4 9 9c0 7-4 9.2-9 9.2s-9-2.2-9-9.2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M16 41.5h12.6c2 0 3.9-.6 5.4-1.7l7.2-5.4a5 5 0 0 1 7.1 1c1.5 2 1.1 4.8-.8 6.4l-8.8 7.2a8 8 0 0 1-5.1 1.8H16a4.5 4.5 0 0 1 0-9Z"
                    fill="currentColor"
                  />
                  <path
                    d="M33.4 10.5v10M29.2 14.7h8.4"
                    stroke="#dbeafe"
                    stroke-width="4.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>

              <div class="mt-6 text-center sm:mt-7">
                <h2 class="role-card__title text-xl font-black tracking-tight sm:text-[1.9rem]">
                  {{ role.title }}
                </h2>
                <p
                  class="role-card__desc mt-2 text-[11px] leading-5 sm:mt-3 sm:text-sm sm:leading-6"
                >
                  {{ role.description }}
                </p>
              </div>

              <ul
                class="role-card__list mt-4 space-y-2.5 text-[11px] sm:mt-6 sm:space-y-3 sm:text-sm"
              >
                <li v-for="point in role.points" :key="point" class="flex items-start gap-2.5">
                  <span
                    class="role-card__check mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  >
                    ✓
                  </span>
                  <span class="leading-5 sm:leading-6">{{ point }}</span>
                </li>
              </ul>

              <div class="role-card__footer mt-4 flex items-center justify-between pt-3 sm:mt-5">
                <!-- <span
                  class="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400 sm:text-xs"
                >
                  {{ selectedRole === role.id ? 'Selected' : 'Tap to choose' }}
                </span>
                <span
                  class="inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm transition sm:h-8 sm:w-8"
                  :class="
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-200 text-slate-400'
                  "
                >
                  {{ selectedRole === role.id ? '✓' : '→' }}
                </span> -->
              </div>
            </div>
          </button>
        </div>
      </div>

      <div class="flex flex-col items-center gap-3 pb-1 pt-2 sm:gap-4 sm:pb-3">
        <!-- <p class="text-xs text-slate-300/78 sm:text-sm">
          当前选择:
          <span class="font-semibold text-white">{{ selectedRoleData?.title }}</span>
        </p> -->
        <button
          type="button"
          class="reveal reveal--footer cursor-pointer inline-flex min-w-[180px] items-center justify-center rounded-full border border-blue-300/55 bg-0px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(59,130,246,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(59,130,246,0.35)] focus:outline-none focus:ring-2 focus:ring-blue-300/70 focus:ring-offset-2 focus:ring-offset-slate-950 sm:min-w-[220px] sm:px-8 sm:py-3"
          @click="handleContinue"
        >
          继续体验
        </button>
      </div>
    </div>
  </section>
</template>
<style scoped>
.rolePanel {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.role-card {
  border: 1px solid rgba(226, 232, 240, 0.18);
  background: #315c8247;
  color: #fff;
}

.role-card__notch {
  border-left: 1px solid rgba(226, 232, 240, 0.22);
  border-right: 1px solid rgba(226, 232, 240, 0.22);
  border-bottom: 1px solid rgba(226, 232, 240, 0.22);
  background: rgba(10, 20, 34, 0.88);
}

.role-card__avatar {
  border-color: rgba(10, 20, 34, 0.92);
}

.role-card__title {
  color: rgba(255, 255, 255, 0.96);
}

.role-card__desc,
.role-card__list {
  color: #fff;
}

.role-card__check {
  background: rgba(96, 165, 250, 0.92);
}

.role-card__footer {
  border-top: 1px solid rgba(226, 232, 240, 0.16);
}

.reveal {
  opacity: 0;
  animation: revealUp 1.05s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--reveal-delay, 0ms);
}

.reveal--header {
  --reveal-delay: 120ms;
}

.reveal--footer {
  --reveal-delay: 760ms;
}

@keyframes revealUp {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.988);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    animation: none;
  }
}

.role-panel--exiting {
  pointer-events: none;
  animation: panelExitWobble 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transform-origin: center 72%;
}

@keyframes panelExitWobble {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
  22% {
    transform: translate3d(0, -4px, 0) rotate(-0.45deg) scale(0.998);
  }
  44% {
    transform: translate3d(0, 1px, 0) rotate(0.35deg) scale(0.996);
  }
  66% {
    opacity: 0.9;
    transform: translate3d(0, -1px, 0) rotate(-0.18deg) scale(0.992);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, 22px, 0) rotate(0deg) scale(0.985);
  }
}
</style>
