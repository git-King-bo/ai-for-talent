<script setup>
const candidates = [
  { name: '王晨曦', role: '前端开发工程师', stage: '一面待反馈', score: '92' },
  { name: 'Luna Chen', role: '算法产品经理', stage: '简历评估中', score: '88' },
  { name: '赵嘉楠', role: '数据分析师', stage: 'Offer 沟通', score: '95' },
]
</script>

<template>
  <section class="page-card">
    <div class="page-card__header">
      <div>
        <h3>人才库列表页</h3>
        <p>这里可以继续扩展搜索表单、人才标签、分页器和详情抽屉。</p>
      </div>
      <button type="button">新增候选人</button>
    </div>

    <div class="table-shell">
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>目标岗位</th>
            <th>当前阶段</th>
            <th>匹配度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in candidates" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.role }}</td>
            <td>{{ item.stage }}</td>
            <td>{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.page-card {
  border-radius: 28px;
  padding: 24px;
  border: 1px solid rgba(31, 36, 48, 0.08);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 16px 45px rgba(24, 28, 39, 0.06);
}

.page-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.page-card__header h3 {
  color: #1f2430;
  font-size: 24px;
  font-weight: 700;
}

.page-card__header p {
  margin-top: 8px;
  color: #6f7280;
}

.page-card__header button {
  padding: 12px 18px;
  border: 0;
  border-radius: 16px;
  background: #1f2430;
  color: #fff7ef;
  cursor: pointer;
}

.table-shell {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(31, 36, 48, 0.08);
}

th {
  color: #7a7f8c;
  font-size: 13px;
  font-weight: 600;
}

td {
  color: #313848;
}

@media (max-width: 720px) {
  .page-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
