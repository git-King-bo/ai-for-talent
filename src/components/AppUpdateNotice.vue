<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const CHECK_INTERVAL = 60 * 1000

const dismissed = ref(false)
let intervalId = null

const {
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegisteredSW(_swUrl, registration) {
    if (!registration || intervalId) {
      return
    }

    intervalId = window.setInterval(() => {
      if (!navigator.onLine) {
        return
      }

      registration.update()
    }, CHECK_INTERVAL)
  },
})

const visible = computed(() => needRefresh.value && !dismissed.value)

watch(needRefresh, (value) => {
  if (value) {
    dismissed.value = false
  }
})

onBeforeUnmount(() => {
  if (intervalId) {
    window.clearInterval(intervalId)
  }
})

function closeNotice() {
  dismissed.value = true
}

async function refreshApp() {
  await updateServiceWorker(true)
}
</script>

<template>
  <Transition name="update-notice">
    <aside v-if="visible" class="update-notice" role="status" aria-live="polite">
      <div class="update-notice__badge">New</div>
      <div class="update-notice__content">
        <strong>发现新的版本</strong>
        <p>检测到应用已发版，是否立即更新到最新内容？</p>
      </div>
      <div class="update-notice__actions">
        <button type="button" class="update-notice__button update-notice__button--ghost" @click="closeNotice">
          稍后
        </button>
        <button type="button" class="update-notice__button update-notice__button--primary" @click="refreshApp">
          立即更新
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.update-notice {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1200;
  width: min(360px, calc(100vw - 32px));
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(126, 220, 174, 0.24);
  background:
    linear-gradient(135deg, rgba(8, 16, 31, 0.96), rgba(10, 24, 42, 0.94)),
    rgba(8, 16, 31, 0.92);
  box-shadow: 0 24px 60px rgba(2, 8, 20, 0.4);
  backdrop-filter: blur(18px);
}

.update-notice__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 28px;
  margin-bottom: 14px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(65, 214, 144, 0.16);
  color: #8df0be;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.update-notice__content strong {
  display: block;
  color: #f5f8ff;
  font-size: 18px;
  font-weight: 700;
}

.update-notice__content p {
  margin-top: 8px;
  color: rgba(214, 228, 250, 0.78);
  line-height: 1.6;
}

.update-notice__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.update-notice__button {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.update-notice__button:hover {
  transform: translateY(-1px);
}

.update-notice__button--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(229, 238, 252, 0.9);
}

.update-notice__button--ghost:hover {
  background: rgba(255, 255, 255, 0.12);
}

.update-notice__button--primary {
  background: linear-gradient(135deg, #4ade80, #2fb6ff);
  color: #041120;
  box-shadow: 0 12px 24px rgba(47, 182, 255, 0.24);
}

.update-notice__button--primary:hover {
  box-shadow: 0 16px 26px rgba(47, 182, 255, 0.3);
}

.update-notice-enter-active,
.update-notice-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.update-notice-enter-from,
.update-notice-leave-to {
  opacity: 0;
  transform: translate3d(0, -12px, 0);
}

@media (max-width: 768px) {
  .update-notice {
    top: 16px;
    right: 16px;
    left: 16px;
    width: auto;
  }

  .update-notice__actions {
    justify-content: stretch;
  }

  .update-notice__button {
    flex: 1;
  }
}
</style>
