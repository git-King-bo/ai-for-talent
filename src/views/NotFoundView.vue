<template>
  <section class="not-found">
    <span>404</span>
    <h2>页面不存在</h2>
    <p>当前地址没有匹配到页面，返回工作台继续开发吧。</p>
    <RouterLink to="/dashboard">返回工作台</RouterLink>
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
  background: linear-gradient(180deg, #f6f2ea 0%, #f7f8fc 100%);
}

.not-found span {
  color: #8d735d;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.not-found h2 {
  color: #1f2430;
  font-size: 40px;
  font-weight: 700;
}

.not-found p {
  color: #6f7280;
}

.not-found a {
  justify-self: center;
  padding: 12px 18px;
  border-radius: 16px;
  background: #1f2430;
  color: #fff7ef;
}
</style>
