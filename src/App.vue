<template>
  <div class="app-shell">
    <div class="app-shell__glow app-shell__glow--left"></div>
    <div class="app-shell__glow app-shell__glow--right"></div>
    <div class="app-shell__content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(232, 126, 54, 0.12), transparent 28%),
    radial-gradient(circle at 88% 12%, rgba(104, 146, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #151210 0%, #0e0c0b 100%);
}

.app-shell__glow {
  position: fixed;
  width: 32rem;
  height: 32rem;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.5;
  pointer-events: none;
}

.app-shell__glow--left {
  top: -10rem;
  left: -8rem;
  background: rgba(255, 157, 82, 0.18);
}

.app-shell__glow--right {
  right: -10rem;
  bottom: -14rem;
  background: rgba(88, 125, 255, 0.18);
}

.app-shell__content {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
}
</style>
