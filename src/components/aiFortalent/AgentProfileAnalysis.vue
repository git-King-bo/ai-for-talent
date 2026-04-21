<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  role: {
    type: Object,
    default: null,
  },
  sceneAnswers: {
    type: Array,
    default: () => [],
  },
  chatAnswers: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['restart', 'start-matching'])

const isLoading = ref(true)
const currentStage = ref(0)
const note = ref('')

const loadingStages = [
  'AI 正在分析你的回答结构...',
  '提取隐性特质与协作偏好...',
  '组合你的专属 Agent 画像...',
]

const profileMap = {
  founder: {
    id: '00001',
    userNo: '00001',
    matchingId: 'talent-zhang-linfeng',
    userName: '张林峰',
    avatar: '/images/ai-for-talent/zhang-linfeng.jpg',
    roleLabel: ' AI4S 创业者',
    coreTraits: [
      '技术理想主义（80%）',
      '务实',
      '深度思考',
      '抗拒无效社交',
      '跨学科复合思维',
      '家国情怀',
    ],
    behaviorCards: [
      {
        label: '沟通风格',
        title: '深度叙事型',
        desc: '倾向于从原理和愿景切入，而非短期数据，擅长结合科研逻辑与产业价值拆解问题，语言兼具学术严谨性与理想感染力，不热衷空泛寒暄，沟通聚焦AI for Science的长期价值与技术落地细节，能清晰传递“科学发现基础设施”的核心愿景，同时愿意倾听跨学科团队的不同观点，尤其重视科研团队的学术交流质感。',
      },
      {
        label: '决策偏好',
        title: '长期主义',
        desc: '在利益冲突时，倾向于保护核心技术壁垒，优先投入底层技术研发与科研人才培养，拒绝为短期盈利牺牲技术长期演进空间；决策基于跨学科视野与科学规律，不盲目跟风赛道热点，注重技术与产业需求的深度匹配，坚持“解决真实科学问题、释放科学价值”的核心原则，哪怕短期投入大、回报周期长，也会坚定推进关键技术突破，比如持续打磨科学发现智能引擎。',
      },
      {
        label: '对资本态度',
        title: '寻求战略共鸣',
        desc: '宁可估值低，也要找懂行业的人，优先选择能提供产业资源、理解AI for Science长期属性的资本，拒绝纯财务导向、要求短期快速变现的机构；认为资本是推动技术落地的助力而非主导，融资核心目的是夯实技术壁垒、拓展科研与产业应用场景，而非单纯追求估值提升，多次强调融资要服务于“打造源自中国、引领世界的科技公司”的目标。',
      },
      {
        label: '团队管理',
        title: '价值观导向型',
        desc: '选人优先考量价值观与长期理念一致性，重视团队成员的科研热忱与务实态度，尤其青睐真正对AI for Science感兴趣、愿意做有意义事情的人；管理风格兼具学术严谨性与人文温度，与团队成员保持平等沟通，定期开展深度组会，针对不同成员的特点因材施教，既注重科研成果的产出，也关注团队成员的成长与心态，营造开放、专注的科研与创业氛围。',
      },
    ],
    preferences: [
      {
        type: 'positive',
        text: '强烈推荐：技术/产业背景的合伙人型投资人，尤其是懂AI for Science、计算科学、生命科学或材料科学领域的机构',
      },
      {
        type: 'positive',
        text: '适合：愿意陪跑 3 年以上的长期资本，能提供产业资源、助力技术落地与全球化拓展的投资方',
      },
      {
        type: 'positive',
        text: '青睐：跨学科背景的科研与创业人才（物理、数学、计算机、生物、化学等方向），具备科研热忱与务实执行力的团队成员',
      },
      {
        type: 'negative',
        text: '回避：纯财务导向、要求短期快速变现的机构，急于求成、忽视技术壁垒建设的合作方',
      },
      {
        type: 'negative',
        text: '拒绝：阻碍技术开源、限制科学发现共享，不利于AI for Science生态建设的合作行为',
      },
    ],
    radar: {
      labels: ['技术深度', '商业敏感', '愿景驱动', '生态搭建', '执行力', '家国情怀'],
      values: [88, 85, 94, 90, 86, 92],
    },
    worldView: {
      core: 'AI for Science不是新兴赛道，而是面向未来几十年科学发现的基础设施建设工程，科技的价值在于推动人类科学进步、解决真实产业需求，而非单纯追求商业利益',
      scienceView:
        '科研的核心是探索未知、解决真正的科学难题，注重底层逻辑与跨学科融合，反对形式主义科研，坚持“从原理出发、向应用落地”，相信AI能重构科研范式，让科学发现更高效、更普惠',
      entrepreneurshipView:
        '创业是实现科研价值的载体，而非目的，坚持“技术为本、长期主义”，拒绝短期投机，致力于打造源自中国、引领世界的科技公司，推动科研成果从实验室走向产业，释放科学价值',
      lifeView:
        '保持专注与清醒，不被外界名利干扰，重视个人成长与团队共赢，既追求科研与创业的突破，也注重对学生的培养，坚信“双向奔赴、共同成长”的力量，秉持开放、务实、热忱的人生态度',
      socialView:
        '倡导开源协作，推动科研资源共享，助力构建人类命运共同体，希望通过技术创新打破科研壁垒，让更多人受益于AI for Science的发展，同时关注国家科技发展需求，助力中国在全球科技竞争中占据领先地位',
    },
    background: {
      education:
        '北京大学元培学院本科（主修物理、数学、计算机），普林斯顿大学应用数学系博士，师从中国科学院院士鄂维南与美国科学院院士Roberto Car，曾获微软学者奖学金，发表高水平学术论文超20篇，被引用近2000次',
      workExperience:
        '2018年与孙伟杰联合创立深势科技，任创始人兼首席科学家；2020年带领团队获“戈登·贝尔奖”（超算界诺贝尔奖），成果入选2020中国十大科技进展；2024年入职上海交通大学人工智能学院，任助理教授、博士生导师，同时担任多个国际顶级学术会议审稿人；主导深势科技多轮融资，推动科学发现智能引擎的研发与产业落地',
      keyAchievements:
        '提出深度势能分子动力学（DeePMD）方法，推动AI在量子计算领域的应用；带领深势科技构建“深势·宇知”大模型体系与玻尔科研空间站，服务全球千余所高校及数十家龙头企业；入围胡润U30中国创业先锋榜单、《财富》中国40位40岁以下商界精英榜单',
    },
  },
  investor: {
    id: '00002',
    name: '魏凡杰',
    matchingId: 'investor-weifanjie',
    userNo: '00002',
    roleLabel: '上海未来产业基金总经理',
    coreTraits: [
      '耐心资本践行者（85%）',
      '务实理性',
      '深度认知导向',
      '生态思维',
      '家国情怀',
      '尊重科学规律',
    ],

    userName: '魏凡杰',
    avatar: '/images/ai-for-talent/weifanjie.jpg',
    roleLabel: '上海未来产业基金总经理',
    roleTitle: '上海国投未来产业基金 · 管理人',
    coreTraits: [
      '耐心资本践行者（85%）',
      '务实理性',
      '深度认知导向',
      '生态思维',
      '家国情怀',
      '尊重科学规律',
    ],
    behaviorCards: [
      {
        label: '沟通风格',
        title: '理性赋能型',
        desc: '倾向于从产业逻辑、技术拐点与商业化可能性切入，兼顾科学原理与资本价值，语言务实严谨，不搞空泛概念炒作，善于倾听创业者的核心诉求与技术构想，同时主动输出产业资源对接思路与长期发展建议；重视与优秀创业者、科学家的深度交流，认为“跟优秀的人聊天是保持前沿敏感性的关键”，沟通聚焦0-1原始创新的培育与成果转化，既尊重科学规律，也不回避商业化现实难题，能清晰传递“耐心资本+生态赋能”的投资理念。',
      },
      {
        label: '决策偏好',
        title: '拐点捕捉+长期陪跑',
        desc: '坚持“投早投小、投硬科技”，聚焦0-1原始创新阶段，优先布局AI for Science、量子计算、可控核聚变、脑机接口等前沿赛道，决策核心是捕捉“科学突破与商业化可能性兼具”的拐点，不盲目跟风热门赛道明星项目；不看重DPI等短期经济指标，愿意等待5-10年甚至更长周期，优先选择具备核心技术、尊重发展规律且全职投入的创业团队，坚决回避估值虚高、创始人权责不清、急于求成的项目，注重科研成果转化的完整性，兼顾成本与供应链安全等现实因素。',
      },
      {
        label: '对创业者的态度',
        title: '耐心陪伴+赋能共生',
        desc: '优先青睐全职投入、具备核心技术与长期信念的创业者，尤其认可AI for Science等前沿领域的科学家创业团队，看重创业者的认知深度、务实态度与坚守初心的品质。针对创业者的阶段性困难，不盲目止损，而是依托上海未来产业基金的资源与“未来启点社区”生态，为创业者提供认知赋能、资源链接、政策对接等全方位支持，助力创业者突破技术转化、人才招聘等瓶颈，追求与创业者长期共生、共赢，助力创业者将科研理想转化为产业价值，打造源自中国的引领性科技企业。',
      },
      {
        label: '抗压模式',
        title: '乐观坚韧+理性调整',
        desc: '面对一级市场的悲观情绪与0-1创新的高风险，始终保持乐观心态，坚信中国0-1原始创新迎来最好时代，认为困难是暂时的，长期来看科创投资前景可期；抗压时注重与团队、合作伙伴的协同，通过深度交流梳理投资逻辑，坚持长期布局的初心，不被短期市场波动干扰。',
      },
      {
        label: '团队管理',
        title: '认知导向型',
        desc: '选人优先考量对前沿科技的深度认知、对硬科技投资的热忱与务实态度，青睐具备跨学科视野、能快速捕捉技术拐点的人才；管理风格开放扁平化，鼓励团队深入高校院所、科创企业挖掘优质项目，同时搭建学习交流平台，促进团队与科学家、创业者的认知同频，营造理性、专业、开放的投资氛围。',
      },
    ],
    preferences: [
      {
        type: 'positive',
        text: '强烈推荐：全职投入、尊重发展规律、具备核心技术的硬科技创业者，尤其是AI for Science、量子计算等领域的科学家创业团队',
      },
      {
        type: 'positive',
        text: '适合：聚焦0-1原始创新、愿意长期深耕，重视科研成果转化完整性（含成本、供应链安全）的创业项目',
      },
      {
        type: 'positive',
        text: '青睐：具备跨学科视野、有深度认知、务实专业的创业团队与合作伙伴，能联动多方资源的科创生态参与者',
      },
      {
        type: 'positive',
        text: '倾向：愿意与基金长期陪跑、理念同频，不追求短期估值套利，重视技术持续迭代的创业团队',
      },
      {
        type: 'negative',
        text: '回避：估值虚高、权责不清的项目，纯财务导向、追求短期快速变现的合作方',
      },
      {
        type: 'negative',
        text: '拒绝：空泛概念炒作、忽视科学规律、急于求成的创业项目，不愿共享资源的合作行为',
      },
    ],
    radar: {
      labels: ['认知深度', '商业敏感', '愿景驱动', '生态搭建', '风险管理', '家国情怀'],
      values: [94, 90, 92, 91, 88, 93],
    },
    worldView: {
      core: '资本的价值在于赋能原始创新、搭建科创生态，0-1原始创新是中国科技崛起的核心突破口，科技投资的本质是陪伴优秀者成长，实现科学价值、产业价值与资本价值的共赢，而非短期套利',
      scienceView:
        '尊重科学规律，认可科研的探索性与长期性，反对形式主义科研，坚信AI等新技术能加速科研范式重构，认为高校院所是0-1创新的“金矿”，要通过耐心资本与生态赋能，推动科研成果从实验室走向产业，释放科学价值',
      investmentView:
        '投资不是简单的资金注入，而是“耐心陪伴+认知赋能+资源链接”的综合过程，硬科技投资要坚守长期主义，聚焦0-1原始创新的薄弱环节，以政府引导基金为纽带，联动社会资本，打造“投资-孵化-转化”的完整生态，助力中国实现从跟随创新到引领创新的跨越',
      lifeView:
        '保持乐观坚韧的心态，重视认知提升与团队共赢，坚信未来属于年轻的科学家、创业者与投资人，愿意为他们提供机会与空间，秉持务实、开放、包容的人生态度，在赋能科创的过程中实现个人价值与社会价值的统一',
      socialView:
        '倡导科创生态协同与资源共享，致力于搭建京沪创新协同桥梁，打造“未来启点社区”等创新生态平台，推动形成“人才-认知-范式-连接”的科创生态闭环，助力中国在未来产业领域占据全球领先地位，同时欢迎国际资本参与中国科创投资，共促全球科技进步',
    },
    background: {
      education:
        '具备深厚的经济学、管理学与前沿科技相关背景，深耕科创投资领域多年，积累了扎实的产业认知与投资经验，熟悉政府引导基金的运作模式与硬科技领域的发展规律，注重跨学科知识的学习与积累，持续提升对前沿科技赛道的认知深度',
      workExperience:
        '曾参与组建北京科创基金，推动中国科学家创业热潮；现执掌上海未来产业基金，任总经理；牵头筹建“未来启点社区”，致力于构建颠覆式创新生态平台；深耕科创投资领域，聚焦AI for Science、量子计算、可控核聚变等未来产业赛道，推动政府资本与社会资本协同，开展0-1原始创新项目的早期投资与深度孵化，联动高校院所、科创企业、投资人，搭建京沪创新“超级连接器”，助力科创成果转化与科创生态建设，多次参与浦江创新论坛等行业盛会，分享硬科技投资理念与未来产业发展趋势',
      keyAchievements:
        '主导上海未来产业基金完成中国证券投资基金业协会备案，推动基金聚焦六大未来产业领域布局；牵头搭建“未来启点社区”创新生态平台，打造人才与认知的超级入口、资源的超级链接器；推动基金与市场化机构合作设立子基金，引导资金投向高校院所早期项目，挖掘0-1创新“金矿”；深耕硬科技投资，助力多个AI for Science、量子计算领域早期项目成长，推动科研成果转化为新质生产力，为中国0-1原始创新发展提供重要资本支撑与生态赋能',
    },
  },
}

const activeRoleId = computed(() => (props.role?.id === 'investor' ? 'investor' : 'founder'))
const profile = computed(() => profileMap[activeRoleId.value])

const realAnswerCount = computed(() => {
  const chatCount = Array.isArray(props.chatAnswers?.answers) ? props.chatAnswers.answers.length : 0
  return props.sceneAnswers.length + chatCount
})

const displayedAnswerCount = computed(() => Math.max(15, realAnswerCount.value))

const radarPoints = computed(() => {
  const { values } = profile.value.radar
  const centerX = 120
  const centerY = 120
  const radius = 78
  const total = values.length

  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
      const currentRadius = (value / 100) * radius
      const x = centerX + Math.cos(angle) * currentRadius
      const y = centerY + Math.sin(angle) * currentRadius
      return `${x},${y}`
    })
    .join(' ')
})

const radarGridLevels = [20, 40, 60, 80, 100]

function radarGridPoints(level) {
  const centerX = 120
  const centerY = 120
  const radius = 78 * (level / 100)
  const total = profile.value.radar.labels.length

  return profile.value.radar.labels
    .map((_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      return `${x},${y}`
    })
    .join(' ')
}

function radarAxis(labelIndex) {
  const centerX = 120
  const centerY = 120
  const radius = 88
  const total = profile.value.radar.labels.length
  const angle = -Math.PI / 2 + (Math.PI * 2 * labelIndex) / total

  return {
    x2: centerX + Math.cos(angle) * radius,
    y2: centerY + Math.sin(angle) * radius,
    labelX: centerX + Math.cos(angle) * (radius + 18),
    labelY: centerY + Math.sin(angle) * (radius + 18),
  }
}

let stageTimer = null
let loadingTimer = null

onMounted(() => {
  stageTimer = window.setInterval(() => {
    currentStage.value = (currentStage.value + 1) % loadingStages.length
  }, 1100)

  loadingTimer = window.setTimeout(() => {
    isLoading.value = false
    if (stageTimer) {
      window.clearInterval(stageTimer)
      stageTimer = null
    }
  }, 3200)
})

onBeforeUnmount(() => {
  if (stageTimer) window.clearInterval(stageTimer)
  if (loadingTimer) window.clearTimeout(loadingTimer)
})
</script>

<template>
  <section
    class="analysis-shell h-full overflow-auto"
    :class="{ 'analysis-shell--ready': !isLoading }"
  >
    <div v-if="isLoading" class="analysis-loading">
      <div class="analysis-loading__card">
        <div class="signal">
          <span class="signal__arc signal__arc--one"></span>
          <span class="signal__arc signal__arc--two"></span>
          <span class="signal__arc signal__arc--three"></span>
        </div>
        <h1 class="analysis-loading__title">正在生成你的专属 Agent...</h1>
        <p class="analysis-loading__desc">{{ loadingStages[currentStage] }}</p>
        <p class="analysis-loading__meta">
          AI 正在分析你的 {{ displayedAnswerCount }} 个行为反应，提取隐性特质...
        </p>
        <p class="analysis-loading__meta">分析维度：沟通风格、价值观、抗压能力、决策偏好</p>
      </div>
    </div>

    <div v-else class="portrait-page">
      <header class="portrait-header">
        <h1 class="portrait-header__title">你的专属 Agent 画像</h1>
        <p class="portrait-header__subtitle">
          AI 基于你的 {{ displayedAnswerCount }} 个行为反应分析生成
        </p>
      </header>

      <section class="portrait-card">
        <aside class="identity-panel">
          <div class="identity-panel__stars"></div>
          <div class="identity-panel__avatar">
            <div class="identity-panel__avatar-ring">
              <img
                v-if="profile.avatar"
                :src="profile.avatar"
                :alt="profile.userName"
                class="identity-panel__avatar-image"
              />
              <svg
                v-else
                viewBox="0 0 80 80"
                aria-hidden="true"
                class="identity-panel__avatar-icon"
              >
                <circle cx="40" cy="28" r="12" fill="currentColor" opacity="0.96" />
                <path
                  d="M20 59c0-10 8.5-17 20-17s20 7 20 17v5H20v-5Z"
                  fill="currentColor"
                  opacity="0.96"
                />
                <circle cx="50" cy="22" r="8.5" fill="#2f3747" />
                <path
                  d="M50 17.5v9M45.5 22h9"
                  stroke="white"
                  stroke-width="2.6"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>

          <!-- <p class="identity-panel__id">ID：{{ profile.id }}</p> -->
          <h2 class="identity-panel__name">{{ profile.userName }}</h2>
          <span class="identity-panel__tag">{{ profile.roleLabel }}</span>
          <p class="identity-panel__headline">{{ profile.roleTitle }}</p>
          <div class="identity-panel__traits">
            <span
              v-for="(trait, index) in profile.coreTraits"
              :key="trait"
              class="identity-panel__trait"
              :class="{ 'identity-panel__trait--primary': index === 0 || index === 2 }"
            >
              {{ trait }}
            </span>
          </div>

          <div class="identity-panel__radar">
            <svg viewBox="0 0 260 260" class="radar-chart" aria-hidden="true">
              <polygon
                v-for="level in radarGridLevels"
                :key="level"
                :points="radarGridPoints(level)"
                class="radar-chart__grid"
                pathLength="100"
              />
              <line
                v-for="(_, index) in profile.radar.labels"
                :key="`axis-${index}`"
                x1="120"
                y1="120"
                :x2="radarAxis(index).x2"
                :y2="radarAxis(index).y2"
                class="radar-chart__axis"
                pathLength="100"
              />
              <polygon :points="radarPoints" class="radar-chart__shape" pathLength="100" />
              <circle
                v-for="(_, index) in profile.radar.labels"
                :key="`point-${index}`"
                :cx="radarPoints.split(' ')[index].split(',')[0]"
                :cy="radarPoints.split(' ')[index].split(',')[1]"
                r="3.5"
                class="radar-chart__point"
                :style="{ '--radar-delay': `${0.78 + index * 0.08}s` }"
              />
              <text
                v-for="(label, index) in profile.radar.labels"
                :key="`label-${label}`"
                :x="radarAxis(index).labelX"
                :y="radarAxis(index).labelY"
                class="radar-chart__label"
                text-anchor="middle"
                :style="{ '--radar-delay': `${0.92 + index * 0.08}s` }"
              >
                {{ label }}
              </text>
            </svg>
          </div>
        </aside>

        <div class="portrait-main">
          <section class="portrait-section">
            <h3 class="portrait-section__title">
              <span class="portrait-section__icon">⚙</span>
              行为风格分析
            </h3>
            <div class="behavior-grid">
              <article
                v-for="card in profile.behaviorCards"
                :key="card.label"
                class="behavior-card"
              >
                <p class="behavior-card__label">{{ card.label }}</p>
                <h4 class="behavior-card__title">{{ card.title }}</h4>
                <p class="behavior-card__desc">{{ card.desc }}</p>
              </article>
            </div>
          </section>

          <section class="portrait-section">
            <h3 class="portrait-section__title">
              <span class="portrait-section__icon portrait-section__icon--heart">♥</span>
              匹配偏好 (Beta)
            </h3>
            <div class="match-list">
              <div v-for="item in profile.preferences" :key="item.text" class="match-list__item">
                <span
                  class="match-list__badge"
                  :class="
                    item.type === 'negative'
                      ? 'match-list__badge--negative'
                      : 'match-list__badge--positive'
                  "
                >
                  {{ item.type === 'negative' ? '×' : '✓' }}
                </span>
                <span class="match-list__text">{{ item.text }}</span>
              </div>
            </div>
          </section>

          <section class="portrait-note">
            <span class="portrait-note__icon">i</span>
            <p>
              注：以上画像基于你的情境选择生成，核心参数不可手动修改以保证真实性。你可以补充个性化备注。
            </p>
          </section>

          <section class="portrait-section portrait-section--compact">
            <h3 class="portrait-section__title portrait-section__title--small">补充备注 (可选)</h3>
            <textarea
              v-model="note"
              class="portrait-note-input"
              rows="4"
              placeholder="有什么想特别说明的吗？比如特定的行业专注点..."
            ></textarea>
          </section>
        </div>
      </section>

      <div class="portrait-actions">
        <button type="button" class="portrait-actions__secondary" @click="emit('restart')">
          重测
        </button>
        <button
          type="button"
          class="portrait-actions__primary"
          @click="emit('start-matching', { role: activeRoleId, centerId: profile.matchingId })"
        >
          确认画像并开始匹配 →
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.analysis-shell {
  min-height: 100vh;
  padding: 1.1rem 1rem 0.9rem;
}

.analysis-loading,
.portrait-page {
  margin: 0 auto;
  width: min(1040px, 100%);
}

.analysis-loading {
  display: grid;
  min-height: calc(100vh - 3.5rem);
  place-items: center;
}

.analysis-loading__card {
  display: flex;
  min-height: 23rem;
  width: min(720px, 100%);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(48, 57, 73, 0.92), rgba(38, 45, 59, 0.88)), rgba(15, 23, 42, 0.78);
  box-shadow:
    0 24px 60px rgba(2, 6, 23, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 2rem;
  text-align: center;
}

.signal {
  position: relative;
  height: 4.5rem;
  width: 6.25rem;
  margin-bottom: 2rem;
}

.signal__arc {
  position: absolute;
  left: 50%;
  border-top: 4px solid;
  border-radius: 999px 999px 0 0;
  transform: translateX(-50%);
  animation: pulseArc 1.8s ease-in-out infinite;
}

.signal__arc--one {
  bottom: 0;
  width: 2.6rem;
  height: 1.2rem;
  border-color: #69d2ff;
  animation-delay: 0s;
}

.signal__arc--two {
  bottom: 0.55rem;
  width: 3.9rem;
  height: 1.75rem;
  border-color: #6f87ff;
  animation-delay: 0.18s;
}

.signal__arc--three {
  bottom: 1.15rem;
  width: 5.3rem;
  height: 2.35rem;
  border-color: #2563ff;
  animation-delay: 0.34s;
}

.analysis-loading__title {
  margin: 0;
  color: rgba(255, 255, 255, 0.98);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 850;
  letter-spacing: -0.04em;
}

.analysis-loading__desc {
  margin: 1rem 0 0;
  color: rgba(226, 232, 240, 0.9);
  font-size: 1.12rem;
}

.analysis-loading__meta {
  margin: 0.85rem 0 0;
  color: rgba(203, 213, 225, 0.76);
  font-size: 1rem;
}

.portrait-page {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.portrait-header {
  padding-top: 0.15rem;
  text-align: center;
}

.portrait-header__title {
  margin: 0;
  color: rgba(255, 255, 255, 0.97);
  font-size: clamp(2rem, 3.4vw, 3rem);
  font-weight: 850;
  letter-spacing: -0.06em;
}

.portrait-header__subtitle {
  margin: 0.45rem 0 0;
  color: rgba(203, 213, 225, 0.72);
  font-size: 0.95rem;
}

.portrait-card {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
}

.identity-panel {
  position: relative;
  display: flex;
  min-height: 700px;
  flex-direction: column;
  align-items: center;
  padding: 1.7rem 1.35rem 1.35rem;
  color: #fff;
  border-radius: 1.7rem;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px),
    linear-gradient(180deg, #253146 0%, #2e3a50 100%);
  background-size:
    46px 46px,
    auto;
  box-shadow: 0 20px 50px rgba(2, 6, 23, 0.22);
}

.identity-panel__avatar {
  margin-top: 0.25rem;
}

.identity-panel__avatar-ring {
  display: grid;
  height: 104px;
  width: 104px;
  place-items: center;
  overflow: hidden;
  border-radius: 999px;
  border: 4px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 12px 24px rgba(15, 23, 42, 0.12);
}

.identity-panel__avatar-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.identity-panel__avatar-icon {
  height: 60px;
  width: 60px;
  color: white;
}

.identity-panel__id {
  margin: 0.9rem 0 0;
  color: rgba(214, 219, 231, 0.72);
  font-size: 0.85rem;
  letter-spacing: 0.16em;
}

.identity-panel__name {
  margin: 0.45rem 0 0;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.05em;
}

.identity-panel__tag {
  margin-top: 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  padding: 0.45rem 0.9rem;
  color: rgba(242, 245, 252, 0.92);
  font-size: 0.84rem;
}

.identity-panel__headline {
  margin: 0.7rem 0 0;
  color: rgba(226, 232, 240, 0.76);
  font-size: 0.88rem;
  line-height: 1.55;
}

.identity-panel__traits {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.identity-panel__trait {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.42rem 0.76rem;
  color: rgba(241, 245, 249, 0.88);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  backdrop-filter: blur(8px);
}

.identity-panel__trait--primary {
  background: rgba(147, 197, 253, 0.2);
  color: #dbeafe;
  box-shadow: inset 0 0 0 1px rgba(191, 219, 254, 0.14);
}

.identity-panel__radar {
  margin-top: 2rem;
  width: 100%;
  padding-top: 1.2rem;
}

.radar-chart {
  width: 100%;
  height: auto;
  overflow: visible;
}

.radar-chart__grid,
.radar-chart__axis {
  fill: none;
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 1;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: radarDraw 1.05s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.radar-chart__shape {
  fill: rgba(255, 255, 255, 0.15);
  stroke: rgba(255, 255, 255, 0.88);
  stroke-width: 2.8;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  fill-opacity: 0;
  animation:
    radarDraw 1.15s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards,
    radarFill 0.55s ease-out 1s forwards;
}

.radar-chart__point {
  fill: white;
  opacity: 0;
  transform-origin: center;
  animation: radarPop 0.32s ease-out var(--radar-delay, 0.8s) forwards;
}

.radar-chart__label {
  fill: rgba(236, 240, 248, 0.86);
  font-size: 11px;
  opacity: 0;
  animation: fadeInLabel 0.4s ease-out var(--radar-delay, 0.9s) forwards;
}

.portrait-main {
  border-radius: 1.7rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
  padding: 1.35rem 1.45rem 1.2rem;
}

.portrait-section + .portrait-section,
.portrait-note + .portrait-section {
  margin-top: 1.1rem;
}

.portrait-section__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 0.8rem;
  color: #4f5463;
  font-size: 1.15rem;
  font-weight: 700;
}

.portrait-section__title--small {
  font-size: 0.95rem;
}

.portrait-section__icon {
  color: #2478ff;
  font-size: 1rem;
}

.portrait-section__icon--heart {
  color: #2478ff;
}

.behavior-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.behavior-card {
  border-radius: 1rem;
  background: #f4f5f8;
  padding: 0.9rem 0.95rem;
}

.behavior-card__label {
  margin: 0;
  color: #9aa0af;
  font-size: 0.82rem;
}

.behavior-card__title {
  margin: 0.45rem 0 0;
  color: #20242c;
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.behavior-card__desc {
  margin: 0.5rem 0 0;
  color: #a1a6b3;
  font-size: 0.88rem;
  line-height: 1.65;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.match-list__item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid #e8eaf0;
  padding: 0.62rem 0;
}

.match-list__badge {
  display: inline-flex;
  height: 20px;
  width: 20px;
  flex: 0 0 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.match-list__badge--positive {
  background: #3cbc63;
}

.match-list__badge--negative {
  background: #ff4a43;
}

.match-list__text {
  color: #353a45;
  font-size: 0.92rem;
  line-height: 1.6;
}

.portrait-note {
  display: flex;
  gap: 0.75rem;
  border-left: 4px solid #ff9811;
  border-radius: 0.9rem;
  background: #fff4e9;
  padding: 0.82rem 0.9rem 0.82rem 0.88rem;
  color: #8f95a5;
  font-size: 0.88rem;
  line-height: 1.6;
}

.portrait-note__icon {
  display: inline-flex;
  height: 20px;
  width: 20px;
  flex: 0 0 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(143, 149, 165, 0.16);
  color: #7b8190;
  font-size: 12px;
  font-weight: 700;
}

.portrait-note p {
  margin: 0;
}

.portrait-note-input {
  width: 100%;
  resize: vertical;
  border: 1px solid #cfd4df;
  border-radius: 0.95rem;
  background: #fff;
  min-height: 88px;
  padding: 0.85rem 0.95rem;
  color: #2b313b;
  font: inherit;
  outline: none;
}

.portrait-note-input::placeholder {
  color: #9aa0af;
}

.portrait-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 0.1rem;
}

.portrait-actions__primary,
.portrait-actions__secondary {
  border-radius: 1rem;
  padding: 0.82rem 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.portrait-actions__primary {
  border: 0;
  background: linear-gradient(135deg, #2478ff, #1669ef);
  color: #fff;
  box-shadow: 0 14px 34px rgba(36, 120, 255, 0.24);
}

.portrait-actions__secondary {
  border: 0;
  background: #e8ebf1;
  color: #414753;
}

.portrait-actions__primary:hover,
.portrait-actions__secondary:hover {
  transform: translateY(-1px);
}

@keyframes pulseArc {
  0%,
  100% {
    opacity: 0.45;
    transform: translateX(-50%) scale(0.96);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.02);
  }
}

@keyframes radarDraw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes radarFill {
  to {
    fill-opacity: 1;
  }
}

@keyframes radarPop {
  0% {
    opacity: 0;
    transform: scale(0.2);
  }
  70% {
    opacity: 1;
    transform: scale(1.12);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInLabel {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .analysis-shell {
    padding: 1rem 0.85rem 1.2rem;
  }

  .portrait-card {
    grid-template-columns: 1fr;
  }

  .identity-panel {
    min-height: auto;
  }

  .identity-panel__radar {
    margin-top: 1.8rem;
  }

  .portrait-main {
    padding: 1.15rem;
  }

  .behavior-grid {
    grid-template-columns: 1fr;
  }

  .portrait-actions {
    flex-direction: column;
  }
}

@media (min-width: 981px) and (max-height: 920px) {
  .analysis-shell {
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
  }

  .portrait-page {
    gap: 0.8rem;
  }

  .portrait-header__title {
    font-size: 2.45rem;
  }

  .portrait-card {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .identity-panel {
    min-height: 640px;
    padding: 1.35rem 1.1rem 1.1rem;
  }

  .portrait-main {
    padding: 1.1rem 1.15rem 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .radar-chart__grid,
  .radar-chart__axis,
  .radar-chart__shape,
  .radar-chart__point,
  .radar-chart__label {
    animation: none;
    opacity: 1;
    stroke-dashoffset: 0;
    fill-opacity: 1;
  }
}
</style>
