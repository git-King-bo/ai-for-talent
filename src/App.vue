<script setup>
import ShellBackground from '@/components/shell/ShellBackground.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <ShellBackground />
    <div class="app-shell__content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
}

.app-shell__content {
  position: relative;
  z-index: 1;
  width: 100vw;
  height: 100vh;
}
</style>
