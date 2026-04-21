<script setup>
import AppHeader from './components/AppHeader.vue'
import AppMain from './components/AppMain.vue'
import AppSidebar from './components/AppSidebar.vue'
</script>

<template>
  <div class="admin-layout">
    <AppSidebar />
    <div class="admin-layout__workspace">
      <AppHeader />
      <AppMain />
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(circle at 12% 6%, rgba(121, 184, 255, 0.12), transparent 20%),
    radial-gradient(circle at 84% 0%, rgba(247, 179, 106, 0.08), transparent 18%),
    linear-gradient(180deg, rgba(5, 10, 23, 0.26) 0%, rgba(4, 9, 20, 0.54) 100%);
}

.admin-layout__workspace {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(1px);
}

@media (max-width: 960px) {
  .admin-layout {
    flex-direction: column;
  }
}
</style>
