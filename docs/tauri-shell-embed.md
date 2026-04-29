# Tauri 壳嵌入说明

这条分支 `feature/tauri-shell-template` 已经把桌面壳相关的配置收拢成一层可复用结构。以后要把这套壳嵌入别的项目，优先复用下面这些文件和目录：

- `src-tauri/`
- `scripts/run-tauri.mjs`
- `scripts/run-vite-env.mjs`
- `scripts/package-macos-dmg.sh`
- `scripts/render-macos-dmg-background.mjs`
- `scripts/scaffold-shell-app.mjs`
- `scripts/validate-shell.mjs`
- `shell.config.json`
- `shell.config.example.json`
- `src/config/shell.js`
- `src/components/shell/ShellBackground.vue`
- `src/apps/`

## 壳层现在负责什么

- 统一 Tauri 原生元信息：应用名、窗口标题、包标识、发布描述、Windows 开始菜单目录
- 统一桌面启动页文案
- 统一桌面背景组件入口
- 统一桌面命令入口，让 `tauri dev/build` 自动带上壳配置覆盖层
- 提供“应用模块注册表”，让壳层和业务路由解耦
- 保留当前业务页面不动，让业务代码继续挂在这层壳里运行

## 新项目接入步骤

### 1. 复制壳层文件

把上面列出的目录和文件复制到你的新项目里。

如果你的新项目已经有自己的 `src-tauri/`，建议只挑下面这些能力合并：

- `tauri.conf.json`
- `tauri.macos.conf.json`
- `tauri.windows.conf.json`
- `src/main.rs`
- `scripts/run-tauri.mjs`
- `scripts/package-macos-dmg.sh`

### 2. 修改壳配置

优先改根目录的 `shell.config.json`，这是原生打包层的主入口。

如果你是第一次接入，建议先参考 `shell.config.example.json`。

关键字段说明：

- `app.name`：前端默认应用名
- `app.titleSuffix`：路由标题后缀
- `app.background`：背景组件名称，当前支持 `talent`、`stars`、`starfield`、`none`
- `app.activeAppId`：当前启用的应用模块 id
- `bootSplash.*`：桌面启动页文案
- `tauri.productName`：Tauri 打包产物名称
- `tauri.identifier`：包标识，例如 `com.company.product`
- `tauri.publisher`：发布方
- `tauri.windowTitle`：桌面窗口标题
- `tauri.windowsStartMenuFolder`：Windows 开始菜单目录名

### 3. 修改前端环境变量

桌面和 Web 的启动页与页面标题通过 `VITE_` 环境变量控制。至少需要同步这些字段：

- `VITE_APP_TITLE`
- `VITE_APP_NAME`
- `VITE_APP_TITLE_SUFFIX`
- `VITE_SHELL_APP_ID`
- `VITE_BOOT_BADGE`
- `VITE_BOOT_TITLE`
- `VITE_BOOT_SUBTITLE`
- `VITE_BOOT_STATUS`
- `VITE_BOOT_RUNTIME_LABEL`
- `VITE_SHELL_BACKGROUND`

当前项目已经在这些文件里给了默认值：

- `.env`
- `.env.test`
- `.env.pre`
- `.env.production`
- `.env.desktop-dev`
- `.env.desktop-test`
- `.env.desktop-pre`
- `.env.desktop-prod`

### 4. 替换背景组件

如果你的新项目不需要 `TalentBg`，有两种做法：

1. 把 `shell.config.json` 里的 `app.background` 改成 `none`
2. 在 `src/components/shell/ShellBackground.vue` 里注册你自己的背景组件

### 5. 接上你的业务路由

当前仓库已经有两个应用模块：

- `src/apps/ai-for-talent/`：现有 AI for Talent 示例业务
- `src/apps/starter/`：最小可替换的空壳示例

当前默认启用的还是 `AI for Talent`：

- `src/router/routes.js`
- `src/apps/ai-for-talent/`

迁到新项目时，通常只需要：

- 保留 `src/App.vue` 的壳结构
- 保留 `src/router/index.js` 的标题处理
- 复制 `src/apps/starter/` 作为你的新应用模块
- 或直接运行 `npm run shell:new -- your-app-id "Your App Name"` 生成脚手架
- 在 `src/apps/manifest.js` 里确认你的模块已注册
- 把 `shell.config.json` 和 `.env*` 里的 `activeAppId / VITE_SHELL_APP_ID` 切到你的模块 id

### 6. 替换图标与包信息

- 替换 `src-tauri/icons/app-icon.svg`
- 运行 `npm run desktop:icon`
- 如果项目要正式对外发布，再补签名、公证和自动更新

## 常用命令

```bash
npm run shell:check
npm run shell:new -- your-app-id "Your App Name"
npm run desktop:dev
npm run desktop:starter
npm run desktop:build
npm run desktop:build:starter
npm run desktop:package
npm run desktop:package:win
```

这些命令现在都会先经过 `scripts/run-tauri.mjs`，把 `shell.config.json` 转成运行时的 Tauri 配置覆盖层，再调用真实的 Tauri CLI。

`npm run shell:check` 会检查当前壳配置是否合法。

## 建议的项目边界

为了后面复用更轻松，推荐保持下面这个边界：

- `src/components/shell/`：只放通用桌面壳组件
- `src/config/shell.js`：只放壳层运行时配置读取
- `src/apps/`：每个业务项目一个独立模块
- `src-tauri/`：只放原生壳能力
- `src/views/...`：模块内部复用的具体业务页面
- `src/router/routes.js`：只做当前激活模块的路由拼装

这样以后换项目时，通常只替换业务层，不需要重写壳层。
