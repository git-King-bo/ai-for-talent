# Electron Launchpad

`Electron Launchpad` 是一个面向二次开发的 Electron 桌面模板：保留了生产环境常用的主进程安全设置、预加载桥接、Vite 渲染链路和安装包配置，同时把原先强业务化的演示页面清理成更通用的工作台 demo。

## 适合用来做什么

- 作为新的 Electron 项目起步仓
- 快速嵌入已有 Vue 页面或后台系统
- 先用浏览器开发，再切回 Electron 验证桌面行为
- 在安全的 preload 模式下逐步增加本地文件、菜单、系统能力

## 当前保留的生产级基础

- `Electron + Vue 3 + Vite` 桌面渲染链路
- `contextIsolation + sandbox + nodeIntegration: false`
- `preload` 桥接层，避免渲染进程直接拿 Node 权限
- 单实例应用控制
- 外链跳转白名单与导航拦截
- `electron-builder` 的 macOS / Windows / Linux 打包配置
- 文件协议下自动切换 `hash history`

## 目录结构

```text
.
├── electron
│   ├── launch.js
│   ├── main.js
│   └── preload.js
├── public
│   └── favicon.ico
├── src
│   ├── api
│   │   ├── http.js
│   │   └── index.js
│   ├── assets
│   │   ├── base.css
│   │   └── main.css
│   ├── layouts
│   │   ├── components
│   │   └── index.vue
│   ├── router
│   │   ├── index.js
│   │   └── routes.js
│   ├── utils
│   │   └── desktop.js
│   └── views
│       ├── desktop
│       └── NotFoundView.vue
├── electron-builder.yml
├── package.json
└── vite.config.js
```

## 启动方式

### 安装依赖

```bash
npm install
```

### 仅启动 Web 调试

```bash
npm run dev
```

默认地址为 `http://127.0.0.1:8066`。

### 启动 Electron 开发环境

```bash
npm run dev:electron
```

这会先启动 Vite，再由 Electron 连接本地开发服务器。

### 预览生产渲染结果

```bash
npm run preview:electron
```

### 生成安装包

```bash
npm run dist:electron
```

国内镜像版：

```bash
npm run dist:electron:cn
```

只检查打包目录结构时可使用：

```bash
npm run pack:electron
```

打包前清理缓存：

```bash
npm run clean:electron
```

### 代码格式化

```bash
npm run format
```

## 后续嵌套项目的推荐方式

### 方式 1：直接替换 `src/views/desktop`

适合把现有 Vue 页面逐步迁进来。保留 `electron/` 与 `src/layouts/`，替换路由和页面即可。

### 方式 2：保留模板布局，只替换主工作区

适合需要公共导航、系统信息页、桌面能力面板的后台系统。你可以把业务页面挂到 `src/router/routes.js` 的子路由里。

### 方式 3：继续扩充 preload / IPC

需要文件读写、系统菜单、窗口控制、本地数据库时：

1. 在 `electron/main.js` 注册新的 `ipcMain.handle`
2. 在 `electron/preload.js` 暴露安全 API
3. 在 `src/utils/desktop.js` 中封装调用
4. 在渲染层页面中消费这些 API

## 关键入口

- Electron 主进程：[electron/main.js](/Users/yuanshu/Desktop/webui/ai-for-talent/electron/main.js:1)
- Preload 桥接：[electron/preload.js](/Users/yuanshu/Desktop/webui/ai-for-talent/electron/preload.js:1)
- 路由配置：[src/router/routes.js](/Users/yuanshu/Desktop/webui/ai-for-talent/src/router/routes.js:1)
- 桌面 API 封装：[src/utils/desktop.js](/Users/yuanshu/Desktop/webui/ai-for-talent/src/utils/desktop.js:1)

## 环境变量

如需对接后端接口，可在 `.env` 中配置：

```bash
VITE_API_BASE_URL=https://api.example.com
```

对于桌面打包产物，建议使用绝对地址，而不是依赖相对 `/api`。
