# Canvas Marketing Feature

## 目录结构

```text
features/canvas-marketing/
├─ components/           # 站点组件（导航、区块、UI 封装）
├─ lib/                  # 轻量工具函数（如路由前缀转换）
├─ modules/              # 功能模块目录（后续业务能力按模块沉淀）
├─ pages/                # 页面内容组件（由 app/canvas/* 路由装配）
└─ styles/               # 该站点专属样式（带 .canvas-marketing 作用域）
```

## 路由约定

- 所有站点页面统一挂载在 `/canvas/**`
- app router 入口位于 `app/canvas/**`
- 站内跳转统一使用 `components/canvas-link.tsx`
- 禁止在页面组件中硬编码 `/canvas`，统一走 `toCanvasHref`

## 组件约定

- `pages/*` 只负责页面内容，不处理壳层（导航、页脚）
- 壳层由 `components/canvas-site-shell.tsx` 统一管理
- 动画优先使用 CSS/Tailwind，避免新增重依赖

## 模块化约定

- 所有后续业务能力落在 `modules/<module-name>/*`
- 模块内部标准目录：`components/`、`sections/`、`hooks/`、`services/`、`constants/`、`types/`
- 新建模块统一使用命令：`pnpm canvas:module -- <module-name>`
- 迁移边界检查命令：`pnpm canvas:lint`

## 样式约定

- 该功能域主题变量统一定义在 `styles/app.css`
- 变量与基础样式使用 `.canvas-marketing` 作用域隔离
- 新增样式优先写在 `styles/*`，避免散落到全局样式
