<script setup>
const pipeline = [
  { title: 'AI 招聘产品经理', count: 14, color: '#ffb165' },
  { title: '高级前端工程师', count: 9, color: '#4d7cff' },
  { title: '人才运营专家', count: 6, color: '#2ac58b' },
]
</script>

<template>
  <section class="job-board">
    <div class="job-board__intro">
      <h3>职位管理页</h3>
      <p>这里适合接职位列表、流程节点配置、JD 模板和渠道数据分析。</p>
    </div>

    <div class="job-board__list">
      <article v-for="item in pipeline" :key="item.title" class="job-item">
        <span class="job-item__dot" :style="{ backgroundColor: item.color }"></span>
        <div>
          <strong>{{ item.title }}</strong>
          <p>{{ item.count }} 位候选人正在流程中</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.job-board {
  display: grid;
  gap: 20px;
  border-radius: 28px;
  padding: 24px;
  border: 1px solid rgba(31, 36, 48, 0.08);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 16px 45px rgba(24, 28, 39, 0.06);
}

.job-board__intro h3 {
  color: #1f2430;
  font-size: 24px;
  font-weight: 700;
}

.job-board__intro p {
  margin-top: 10px;
  color: #6f7280;
}

.job-board__list {
  display: grid;
  gap: 14px;
}

.job-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  background: #f7f8fc;
}

.job-item__dot {
  width: 14px;
  height: 14px;
  flex: none;
  border-radius: 50%;
}

.job-item strong {
  display: block;
  color: #1f2430;
  font-size: 17px;
  font-weight: 700;
}

.job-item p {
  margin-top: 6px;
  color: #7b8191;
}
</style>
