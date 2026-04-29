<template>
  <Transition name="fade">
    <div v-if="isGenerating" class="generation-overlay">
      <div class="loader-card">
        <div class="orbit-spinner"></div>
        <div class="generation-text">
          <span>正在生成总结报告</span>
          <div class="pulse-dots"><span></span><span></span><span></span></div>
        </div>
        <p class="loading-sub">分析会议数据 · 整合投资信息</p>
      </div>
    </div>
  </Transition>

  <!-- 主报告内容 -->
  <div v-show="!isGenerating" class="report-container">
    <div class="header-section">
      <h1 class="main-title">AI4S 投资会议总结报告</h1>
      <p class="subtitle">高匹配度对接 · 建议尽快联系</p>
    </div>

    <div class="dashboard-grid">
      <!-- 左侧主要内容区 -->
      <div class="left-panel">
        <!-- 会议纪要卡片 -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-icon">📋</span>
            <h3>会议纪要</h3>
          </div>
          <div class="meta-info">
            <span>📅 2026.01.07</span>
            <span>⏱️ 25分钟</span>
            <span>👥 投资人 & 创业者</span>
          </div>
          <div class="sub-header">对话要点</div>
          <ul class="point-list">
            <li v-for="point in dialogPoints" :key="point">{{ point }}</li>
          </ul>
        </div>

        <!-- 核心数据卡片 -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h3>核心数据</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">$300亿</div>
              <div class="stat-label">AI4S市场规模</div>
              <div class="stat-trend">年增长35%</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">5项</div>
              <div class="stat-label">核心技术专利</div>
              <div class="stat-trend">科研加速算法</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">100家</div>
              <div class="stat-label">首年服务科研机构</div>
              <div class="stat-trend">月活预期70%</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">8人</div>
              <div class="stat-label">核心团队</div>
              <div class="stat-trend">顶级科技/学术背景</div>
            </div>
          </div>
          <div class="highlight-row">
            <div><span>A轮融资共识</span><strong>500万美元</strong></div>
            <div><span>盈亏平衡预期</span><strong>18个月内实现</strong></div>
          </div>
        </div>

        <!-- 后续行动计划卡片 -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-icon">📌</span>
            <h3>后续行动计划</h3>
          </div>
          <div class="action-list">
            <div class="action-item" v-for="(step, idx) in actionSteps" :key="idx">
              <div class="action-num">{{ idx + 1 }}</div>
              <div class="action-text">{{ step }}</div>
            </div>
          </div>
          <div class="footnote">尽职调查排期：技术尽调 / 财务模型验证 / 客户访谈 — 2周内启动</div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 精美名片（带头像） -->
        <div class="business-card">
          <div class="badge">{{ roleCardBadge }}</div>
          <div class="card-inner">
            <div class="avatar">
              <img :src="selectedTalent?.avatar" :alt="selectedTalent?.name" />
            </div>
            <div class="contact-info">
              <div class="name">{{ selectedTalent?.name }}</div>
              <div class="title">{{ roleCardTitle }}</div>
              <div v-for="meta in roleCardMeta" :key="meta" class="contact-row">
                <span class="contact-icon">•</span> {{ meta }}
              </div>
              <div class="tags">
                <span v-for="tag in roleCardTags" :key="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">{{ roleCardFooter }}</div>
        </div>
        <!-- 五维匹配度雷达图 -->
        <div class="glass-card chart-card">
          <div class="card-header">
            <span class="card-icon">🎯</span>
            <h3>匹配度分析</h3>
          </div>
          <div ref="radarChartRef" class="chart-box"></div>
        </div>
        <!-- 竞争优势与里程碑 -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-icon">⚡</span>
            <h3>核心竞争优势</h3>
          </div>
          <ul class="point-list compact">
            <li>5项AI4S关键专利 + 自主科学计算框架</li>
            <li>团队背景：DeepMind / 清华 / 斯坦福核心骨干</li>
          </ul>
          <div class="sub-header" style="margin-top: 1rem">关键里程碑</div>
          <div class="milestone-box">
            <div>▪ Q2 发布AI4S 2.0公测版</div>
            <div>▪ Q3 签约30+科研机构/高校</div>
            <div>▪ Q4 启动B轮筹备 & 海外拓展</div>
          </div>
        </div>
        <!-- 商业前景柱状图 -->
        <div class="glass-card chart-card">
          <div class="card-header">
            <span class="card-icon">📈</span>
            <h3>商业前景</h3>
          </div>
          <div ref="growthChartRef" class="chart-box small-chart"></div>
        </div>
      </div>
    </div>
    <footer>基于{{}}投资会议生成 · 数据驱动决策</footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import rawTalentPool from './mockTalentPool.json'

const route = useRoute()
const isGenerating = ref(true)
const radarChartRef = ref(null)
const growthChartRef = ref(null)
let radarChartInstance = null
let growthChartInstance = null
let echartsModulePromise = null

const getEcharts = async () => {
  if (!echartsModulePromise) {
    echartsModulePromise = import('@/utils/echarts').then((module) => module.default)
  }

  return echartsModulePromise
}

const selectedTalent = computed(
  () => rawTalentPool.find((talent) => talent.id === route.query.id) ?? rawTalentPool[0] ?? null,
)

const roleCardBadge = computed(() =>
  selectedTalent.value?.roleType === 'investor' ? '联系方式已解锁' : '联系方式已解锁',
)

const roleCardTitle = computed(() => {
  if (!selectedTalent.value) return '角色信息生成中'
  return `${selectedTalent.value.organization} · ${selectedTalent.value.title}`
})

const roleCardMeta = computed(() => {
  const talent = selectedTalent.value
  if (!talent) return []

  return [talent.field || talent.investmentFields?.slice(0, 2).join(' / '), talent.location].filter(
    Boolean,
  )
})

const roleCardTags = computed(() => {
  const talent = selectedTalent.value
  if (!talent) return []

  return (talent.tags?.slice(0, 2) ?? talent.investmentFields?.slice(0, 2) ?? []).filter(Boolean)
})

const roleCardFooter = computed(() =>
  selectedTalent.value?.roleType === 'investor'
    ? '已验证投资人画像 · 聚焦长期产业协同'
    : '已验证创业者画像 · 聚焦核心技术与长期价值',
)

// 静态数据
const dialogPoints = [
  '创业者详解AI4S平台商业模式，预计18个月内盈亏平衡',
  'A轮融资目标500万美元达成初步共识',
  '投资人对团队技术背景及市场验证数据高度认可',
  '探讨未来12个月关键里程碑与资源需求',
  '确定尽调时间表及核心审查项 (技术/财务/客户)',
  '双方讨论了科研机构早期付费意愿与典型采购流程，确认先从重点实验室切入更可行',
  '投资人重点追问现阶段产品验证指标，包括模型效果、部署周期与复购可能性',
  '创业者补充说明当前已有试点客户反馈，准确率与效率指标均优于现有替代方案',
  '双方对未来海外科研市场扩展的节奏进行了初步交流，认为可在国内验证后逐步复制',
  '投资人建议在下一轮沟通中补充财务假设、获客成本结构和阶段性融资使用计划',
  '会议末尾确认双方对长期合作意愿积极，后续以尽调材料交换和技术演示为推进重点',
]

const actionSteps = [
  '首次线下demo展示：AI4S平台产品规划与路线图',
  '准备18个月精细化财务模型及里程碑计划',
  '邀请投资人参观实验室，与核心算法团队交流',
]

// 雷达图数据
const matchValues = [95, 92, 88, 90, 82]
const indicators = [
  { name: '投资预期匹配', max: 100 },
  { name: '行业经验匹配', max: 100 },
  { name: '资源互补性', max: 100 },
  { name: '价值观契合度', max: 100 },
  { name: '沟通风格匹配', max: 100 },
]

// 商业前景数据
const marketYears = ['落地验证', '客户扩张', '产业协同']
const marketValues = [72, 84, 91]

// 初始化ECharts图表
const handleChartsResize = () => {
  radarChartInstance?.resize()
  growthChartInstance?.resize()
}

const initCharts = async () => {
  const echarts = await getEcharts()

  if (radarChartRef.value) {
    radarChartInstance?.dispose()
    radarChartInstance = echarts.init(radarChartRef.value)
    radarChartInstance.setOption({
      backgroundColor: 'transparent',
      radar: {
        indicator: indicators,
        shape: 'circle',
        center: ['50%', '50%'],
        radius: '65%',
        name: {
          textStyle: { color: '#cbd5ff', fontSize: 10, fontWeight: 500 },
        },
        splitArea: {
          areaStyle: { color: ['rgba(70, 110, 200, 0.15)', 'rgba(50, 80, 160, 0.08)'] },
        },
        axisLine: { lineStyle: { color: 'rgba(150, 180, 255, 0.4)' } },
        splitLine: { lineStyle: { color: 'rgba(100, 140, 255, 0.25)' } },
      },
      series: [
        {
          type: 'radar',
          data: [{ value: matchValues, name: '匹配度' }],
          areaStyle: { color: 'rgba(79, 110, 255, 0.3)' },
          lineStyle: { width: 2, color: '#5f8aff' },
          itemStyle: { color: '#8cb0ff', borderColor: '#fff', borderWidth: 1.5 },
          symbolSize: 6,
        },
      ],
      tooltip: { trigger: 'item', backgroundColor: 'rgba(10,20,40,0.9)', borderColor: '#5f8aff' },
    })
  }

  if (growthChartRef.value) {
    growthChartInstance?.dispose()
    growthChartInstance = echarts.init(growthChartRef.value)
    growthChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(0,0,0,0.7)',
      },
      grid: { top: 28, left: 42, right: 16, bottom: 18, containLabel: true },
      xAxis: {
        type: 'category',
        data: marketYears,
        axisLabel: { color: '#cbd5ff', fontWeight: 500 },
        axisLine: { lineStyle: { color: '#5f8aff' } },
      },
      yAxis: {
        type: 'value',
        name: '前景评分',
        max: 100,
        nameTextStyle: { color: '#a5bbec' },
        axisLabel: { color: '#ccd9ff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [
        {
          data: marketValues,
          type: 'bar',
          barWidth: '35%',
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#6c8eff' },
                { offset: 1, color: '#3f54c4' },
              ],
            },
            shadowColor: '#5f8aff80',
            shadowBlur: 12,
          },
          label: {
            show: true,
            position: 'top',
            color: '#eef2ff',
            fontWeight: 'bold',
            formatter: '{c}',
          },
        },
      ],
    })
  }
}

// 模拟加载动画
onMounted(() => {
  const minDisplayTime = 700
  const startTime = Date.now()
  const finishLoading = () => {
    const elapsed = Date.now() - startTime
    const delay = Math.max(0, minDisplayTime - elapsed)
    window.setTimeout(async () => {
      isGenerating.value = false
      await nextTick()
      await initCharts()
      window.addEventListener('resize', handleChartsResize)
    }, delay)
  }
  finishLoading()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleChartsResize)
  radarChartInstance?.dispose()
  growthChartInstance?.dispose()
})
</script>

<style scoped>
/* 生成动画层 */
.generation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 6, 23, 0.95);
  backdrop-filter: blur(16px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: opacity 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loader-card {
  text-align: center;
  background: rgba(15, 25, 55, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  padding: 2rem 3rem;
  border: 1px solid rgba(100, 140, 255, 0.5);
  box-shadow: 0 0 50px rgba(79, 110, 255, 0.3);
}

.orbit-spinner {
  width: 70px;
  height: 70px;
  border: 3px solid rgba(100, 150, 255, 0.2);
  border-top: 3px solid #5f8aff;
  border-right: 3px solid #b77cff;
  border-radius: 50%;
  animation: spin 0.9s infinite cubic-bezier(0.55, 0.15, 0.45, 0.85);
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.generation-text {
  color: #e0e7ff;
  font-weight: 500;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.pulse-dots {
  display: inline-flex;
  gap: 6px;
}
.pulse-dots span {
  width: 7px;
  height: 7px;
  background: #94a3f8;
  border-radius: 50%;
  animation: pulse 1.2s infinite;
}
.pulse-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.pulse-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    background: white;
  }
}

.loading-sub {
  color: #8fa2dc;
  font-size: 0.8rem;
  margin-top: 1rem;
}

/* 主报告容器 */
.report-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  animation: fadeSlideUp 0.9s ease-out;
  padding: 0 20px;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部 */
.header-section {
  margin-bottom: 2rem;
  text-align: center;
}
.main-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff, #a0bcff, #6c8eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
}
.subtitle {
  color: #a5bbec;
  margin-top: 0.5rem;
  font-size: 1rem;
}

/* 网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* 卡片通用样式 */
.glass-card {
  background: rgba(12, 20, 35, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 1.8rem;
  border: 1px solid rgba(72, 120, 255, 0.3);
  box-shadow:
    0 20px 35px -12px rgba(0, 0, 0, 0.4),
    0 0 0 0.5px rgba(255, 255, 255, 0.05) inset;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s;
  padding: 1.6rem 1.8rem;
  margin-bottom: 1.8rem;
}
.glass-card:hover {
  transform: translateY(-3px);
  border-color: rgba(100, 150, 255, 0.6);
  background: rgba(15, 25, 45, 0.75);
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.2rem;
  border-left: 3px solid #5f8aff;
  padding-left: 0.8rem;
}
.card-icon {
  font-size: 1.4rem;
}
.card-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #f0f3ff;
  margin: 0;
}

/* 会议元信息 */
.meta-info {
  display: flex;
  gap: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.6rem 1rem;
  border-radius: 1.2rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.sub-header {
  font-size: 1rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: #b7cdff;
}

/* 列表符号 */
.point-list {
  list-style: none;
}
.point-list li {
  margin-bottom: 0.8rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #d9e2ff;
}
.point-list li::before {
  content: '●';
  color: #7f9eff;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}
.point-list.compact li {
  margin-bottom: 0.6rem;
}

/* 统计数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.stat-item {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 1.2rem;
  padding: 0.8rem;
  text-align: center;
  border: 1px solid rgba(95, 138, 255, 0.3);
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff, #9bb6ff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
.stat-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #bfc9f0;
}
.stat-trend {
  font-size: 0.65rem;
  color: #9bb6ff;
  margin-top: 4px;
}

.highlight-row {
  display: flex;
  justify-content: space-between;
  background: rgba(79, 110, 229, 0.2);
  border-radius: 1rem;
  padding: 0.7rem 1rem;
  border-left: 3px solid #5f8aff;
  margin-top: 0.5rem;
}
.highlight-row span {
  font-size: 0.85rem;
  color: #ccd9ff;
}
.highlight-row strong {
  font-size: 0.9rem;
  color: white;
}

/* 行动计划 */
.action-list {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 1.2rem;
  padding: 0.8rem 1rem;
}
.action-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.8rem;
  align-items: flex-start;
}
.action-num {
  background: #4f6eff;
  width: 28px;
  height: 28px;
  border-radius: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.action-text {
  font-size: 0.88rem;
  color: #dee5ff;
  line-height: 1.4;
}
.footnote {
  margin-top: 1rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.2);
  padding-top: 0.8rem;
  font-size: 0.75rem;
  color: #b8ccff;
}

/* 名片区域 (高大上设计) */
.business-card {
  background: linear-gradient(135deg, rgba(20, 30, 55, 0.95), rgba(10, 18, 35, 0.98));
  border-radius: 2rem;
  border: 1px solid rgba(100, 150, 255, 0.7);
  box-shadow:
    0 20px 35px -12px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(79, 110, 255, 0.3);
  margin-bottom: 1.8rem;
  overflow: hidden;
  backdrop-filter: blur(8px);
}
.badge {
  background: #10b98130;
  color: #86efac;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-block;
  padding: 0.2rem 1rem;
  border-radius: 0 0 20px 20px;
  margin-left: 1.5rem;
  width: fit-content;
  border: 0.5px solid #34d39970;
  backdrop-filter: blur(4px);
}
.card-inner {
  display: flex;
  gap: 1.5rem;
  padding: 1.8rem 1.8rem 1.2rem;
}
.avatar {
  flex-shrink: 0;
}
.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #5f8aff;
  box-shadow: 0 0 15px rgba(95, 138, 255, 0.5);
  object-position: center top;
}
.contact-info {
  flex: 1;
}
.name {
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(120deg, #ffffff, #b2ccff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  line-height: 1.2;
}
.title {
  font-size: 0.85rem;
  color: #8aa9ff;
  margin: 0.2rem 0 0.6rem;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: #ccd9ff;
  margin: 0.5rem 0;
}
.contact-icon {
  font-size: 0.9rem;
}
.tags {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.6rem;
  font-size: 0.7rem;
  color: #9bb0da;
}
.card-footer {
  background: rgba(0, 0, 0, 0.4);
  padding: 0.6rem;
  text-align: center;
  font-size: 0.7rem;
  color: #8aa9ff;
  border-top: 1px solid rgba(95, 138, 255, 0.3);
}

/* 图表卡片 */
.chart-card {
  padding-bottom: 1rem;
  overflow: visible;
}
.chart-box {
  width: 100%;
  height: 268px;
  overflow: visible;
}
.small-chart {
  height: 228px;
}

.chart-box :deep(canvas) {
  display: block;
}
.chart-caption,
.trend-note {
  font-size: 0.7rem;
  text-align: center;
  margin-top: 0.5rem;
  color: #9bb0da;
}
.trend-note {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
}

/* 里程碑盒子 */
.milestone-box {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 1rem;
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #dee5ff;
}

footer {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.7rem;
  color: #7b8cae;
}
</style>
