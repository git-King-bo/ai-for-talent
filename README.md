# AI for Talent

`AI for Talent` 是一个基于 `Vue 3 + Vite` 构建的前端项目，当前主要用于展示 AI 驱动的人才匹配与智能创投交互流程。项目包含首页体验流、人才匹配、对话模拟、智能总结等页面，也保留了工作台、人才库、职位管理等后台式页面结构。

## 项目简介

当前项目以“AI for Talent / 智能创投”体验链路为核心，首页支持从角色选择开始，逐步进入场景问答、AI 对话与画像分析，再延展到匹配推荐、对话详情和总结报告页面。

主要特点：

- 基于 `Vue 3 Composition API` 开发
- 使用 `Vite` 作为构建工具
- 使用 `Vue Router` 管理页面路由
- 集成 `Pinia`，为状态管理预留能力
- 使用 `Tailwind CSS v4` 与 `Sass` 组织样式
- 使用 `ECharts` 展示图表数据
- 内置基础 HTTP 请求封装，支持请求/响应拦截
- 当前部分页面使用本地 JSON Mock 数据进行展示

## 技术栈

- `Vue 3`
- `Vite`
- `Vue Router`
- `Pinia`
- `Tailwind CSS 4`
- `Sass`
- `ECharts`
- `Prettier`

## 运行环境

根据项目 `package.json`，推荐使用以下 Node.js 版本：

- `Node.js ^20.19.0`
- 或 `Node.js >=22.12.0`

建议搭配：

- `npm` 作为包管理工具
- `VS Code` 作为开发 IDE

## 安装与启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认开发服务器配置在 `vite.config.js` 中：

- 监听地址：`0.0.0.0`
- 端口：`8066`

启动后可通过本机或局域网地址访问项目。

### 3. 打包生产环境

```bash
npm run build
```

### 4. 本地预览打包结果

```bash
npm run preview
```

### 5. 代码格式化

```bash
npm run format
```

当前格式化脚本仅针对 `src/` 目录执行。

## 路由说明

当前项目的核心路由定义位于 `src/router/routes.js`。

### AI for Talent 体验链路

- `/`
  首页入口，指向 `src/views/aiForTalent/index.vue`
- `/AiForTalent`
  首页别名，与 `/` 指向同一页面
- `/MatchingSearch`
  人才匹配页面
- `/TalentDialogue`
  人才对话页面
- `/IntelligentSummary`
  智能总结页面

### 预留的后台式页面

以下页面已定义为 `layoutChildrenRoutes`，但当前默认入口路由已被注释，暂未作为主导航流程启用：

- `dashboard`
  工作台
- `talent`
  人才库
- `jobs`
  职位管理

## 页面结构概览

### 1. 首页体验页

文件：`src/views/aiForTalent/index.vue`

首页是整个产品体验的主入口，内部采用步骤式切换，主要包含：

- 角色选择
- 场景问答
- AI 面谈对话
- 画像分析

### 2. 人才匹配页

文件：`src/views/aiForTalent/MatchingSearch.vue`

用于展示推荐对象列表、匹配度和后续操作入口。

### 3. 人才对话页

文件：`src/views/aiForTalent/TalentDialogue.vue`

模拟用户与目标人才/投资人的对话过程，当前结合本地 Mock 数据生成初始消息与回复节奏。

### 4. 智能总结页

文件：`src/views/aiForTalent/IntelligentSummary.vue`

展示对话总结、数据看板、后续行动建议及图表分析。

## 目录结构

```text
.
├── src
│   ├── api
│   │   ├── http.js
│   │   ├── index.js
│   │   └── modules
│   ├── assets
│   ├── components
│   │   ├── aiFortalent
│   │   ├── StarfieldBackground.vue
│   │   └── TalentBg.vue
│   ├── layouts
│   ├── router
│   ├── utils
│   └── views
│       ├── aiForTalent
│       ├── dashboard
│       ├── jobs
│       └── talent
├── package.json
├── vite.config.js
└── README.md
```

目录说明：

- `src/views/aiForTalent`
  AI for Talent 主业务页面
- `src/components/aiFortalent`
  首页体验链路相关组件
- `src/router`
  路由配置
- `src/api`
  接口请求封装与模块化 API
- `src/layouts`
  后台式布局结构
- `src/assets`
  全局样式与静态资源
- `src/utils`
  工具函数

## 接口与数据说明

### HTTP 封装

项目内置了一个轻量级请求封装，位于：

- `src/api/http.js`

能力包括：

- 支持 `GET / POST / PUT / DELETE`
- 自动拼接查询参数
- 默认超时时间为 `10000ms`
- 支持请求拦截器和响应拦截器
- 默认从 `localStorage` 中读取 `token` 并注入 `Authorization` 请求头
- 默认处理常见业务返回结构：当返回对象中存在 `code` 字段时，仅将 `code` 为 `0` 或 `200` 视为成功

### API Base URL

请求基础地址优先级如下：

1. `options.baseURL`
2. `import.meta.env.VITE_API_BASE_URL`
3. 默认值 `/api`

如果接入真实后端，建议在环境变量中配置：

```bash
VITE_API_BASE_URL=/api
```

### 当前 API 模块

- `src/api/modules/dashboard.js`
- `src/api/modules/talent.js`

目前已经抽象出示例接口：

- `getDashboardSummary`
- `getTalentList`
- `createTalent`

### Mock 数据

部分 AI for Talent 页面当前依赖本地数据进行展示：

- `src/views/aiForTalent/mockTalentPool.json`

如果后续切换到真实接口，建议优先替换这一层数据来源。

## 开发说明

### 别名配置

项目已在 `vite.config.js` 中配置路径别名：

- `@` -> `src`

示例：

```js
import router from '@/router'
```

### 全局入口

项目入口文件：

- `src/main.js`

当前已注册：

- `Pinia`
- `Vue Router`

### 根组件

根组件位于：

- `src/App.vue`

当前会渲染全局背景组件，并通过 `<RouterView />` 承载页面。

## 开发建议

- 新增业务页面时，优先放在 `src/views` 下，并在 `src/router/routes.js` 中注册
- 可复用组件建议放在 `src/components`，避免在页面中堆积过多逻辑
- 如果后续接口数量增加，建议继续按业务域拆分 `src/api/modules`
- 若需要统一鉴权、错误提示或埋点逻辑，可以在 `src/api/http.js` 的拦截器中扩展
- 当前项目尚未看到测试脚本，如需增强稳定性，建议补充单元测试或端到端测试

## 已知现状

- 当前默认首页为 AI for Talent 体验页
- `/` 与 `/AiForTalent` 已同时指向首页
- 后台式布局路由已保留，但默认入口暂未启用
- 一部分页面是演示型页面，内容包含静态数据与本地 Mock 数据

## 常见问题

### 1. 为什么访问首页会进入 AI for Talent 页面？

因为当前主入口路由已设置为：

- `/`
- `/AiForTalent`

两者都会加载 `src/views/aiForTalent/index.vue`。

### 2. 如何切回后台布局首页？

可以重新启用 `src/router/routes.js` 中原先注释掉的布局路由：

```js
{
  path: '/',
  component: () => import('@/layouts/index.vue'),
  redirect: '/dashboard',
  children: layoutChildrenRoutes,
}
```

启用前建议先确认是否仍需要保留 AI for Talent 作为默认首页。

### 3. 项目现在是纯前端吗？

从当前代码结构看，项目以前端展示为主，API 层已预留，但部分核心页面仍使用本地 Mock 数据驱动。

## 后续可扩展方向

- 接入真实登录与权限体系
- 将 AI for Talent 流程中的静态数据替换为后端接口
- 为匹配页、对话页、总结页增加真实业务状态管理
- 为后台工作台、人才库、职位管理恢复完整导航入口
- 增加测试、CI 和部署说明

## License

当前仓库未在 `package.json` 或根目录中看到明确 License 声明。如需开源或对外分发，建议补充许可证文件。
