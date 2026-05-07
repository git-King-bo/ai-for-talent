<template>
  <section class="not-found">
    <span>404</span>
    <h2>页面不存在</h2>
    <p>当前地址没有匹配到页面，回到 Launchpad 继续搭建你的桌面项目。</p>
    <RouterLink to="/overview">返回概览</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 14px;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at top, rgba(235, 126, 54, 0.18), transparent 28%),
    linear-gradient(180deg, #17120f 0%, #0d0a08 100%);
}

.not-found span {
  color: var(--color-accent-soft);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.not-found h2 {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
}

.not-found p {
  color: var(--color-text-soft);
}

.not-found a {
  justify-self: center;
  padding: 12px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f6c58a, #eb7e36);
  color: #24160e;
  font-weight: 700;
}
</style>
