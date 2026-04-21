<script setup>
const summaryCards = [
  { label: '活跃职位', value: '18', trend: '+4 本周新增' },
  { label: '人才总数', value: '2,486', trend: '+12.6% 简历入库' },
  { label: '待推进流程', value: '37', trend: '6 个今日到期' },
]

const todoList = [
  '接入真实登录态与 token 刷新策略',
  '将页面占位内容替换为真实业务组件',
  '补充 Pinia 模块与权限菜单映射',
]
</script>

<template>
  <section class="page">
    <div class="hero-card">
      <div>
        <span class="hero-card__tag">Scaffold Ready</span>
        <h3>Vue 3 后台基础框架已经就位</h3>
        <p>
          当前项目已具备布局骨架、嵌套路由、页面占位和 API 请求封装。后续可以直接在各业务模块中补真实接口与组件。
        </p>
      </div>
      <div class="hero-card__grid">
        <article v-for="item in summaryCards" :key="item.label" class="metric-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.trend }}</small>
        </article>
      </div>
    </div>

    <div class="panel-grid">
      <section class="panel">
        <div class="panel__header">
          <h4>推荐下一步</h4>
          <span>Implementation Checklist</span>
        </div>
        <ul class="todo-list">
          <li v-for="item in todoList" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="panel panel--accent">
        <div class="panel__header">
          <h4>目录建议</h4>
          <span>Maintainable Structure</span>
        </div>
        <pre class="code-block">src/
├─ api/
├─ layouts/
├─ router/
├─ views/
└─ assets/</pre>
      </section>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 20px;
}

.hero-card,
.panel {
  border-radius: 28px;
  padding: 24px;
  border: 1px solid rgba(31, 36, 48, 0.08);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 45px rgba(24, 28, 39, 0.06);
}

.hero-card {
  display: grid;
  gap: 24px;
}

.hero-card__tag {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 177, 101, 0.16);
  color: #8d4c1f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-card h3 {
  color: #1f2430;
  font-size: clamp(24px, 4vw, 34px);
  line-height: 1.15;
  font-weight: 700;
}

.hero-card p {
  margin-top: 12px;
  max-width: 760px;
  color: #6f7280;
}

.hero-card__grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-card {
  padding: 18px;
  border-radius: 22px;
  background: #1f2430;
  color: #f5efe5;
}

.metric-card span,
.metric-card small {
  display: block;
}

.metric-card span {
  color: rgba(245, 239, 229, 0.66);
  font-size: 13px;
}

.metric-card strong {
  display: block;
  margin: 12px 0 6px;
  font-size: 32px;
  line-height: 1;
  font-weight: 700;
}

.metric-card small {
  color: #ffb165;
}

.panel-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1.2fr 0.8fr;
}

.panel__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.panel__header h4 {
  color: #1f2430;
  font-size: 18px;
  font-weight: 700;
}

.panel__header span {
  color: #9ca3af;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.todo-list {
  padding-left: 18px;
  color: #485060;
}

.todo-list li + li {
  margin-top: 10px;
}

.panel--accent {
  background: linear-gradient(180deg, rgba(255, 241, 227, 0.92), rgba(255, 255, 255, 0.82));
}

.code-block {
  overflow-x: auto;
  padding: 18px;
  border-radius: 20px;
  background: rgba(31, 36, 48, 0.95);
  color: #f5efe5;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .hero-card__grid,
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
