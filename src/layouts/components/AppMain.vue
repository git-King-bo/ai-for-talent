<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="app-main">
    <RouterView v-slot="{ Component }">
      <Transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped>
.app-main {
  flex: 1;
  min-height: 0;
  padding: 0 32px 32px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 960px) {
  .app-main {
    padding: 0 16px 20px;
  }
}
</style>
