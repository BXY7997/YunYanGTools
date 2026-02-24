# yunyan-canvas 迁入 yunyan-tools

## 背景

- 目标：减少多前端项目并行维护成本
- 范围：仅迁移官网展示层（marketing），保留后续功能扩展空间

## 已落地的迁移策略

1. 使用复制方式迁移源码与资源
2. 使用 Next App Router 承载路由，不再引入 Vite Router
3. 将迁移内容收敛到 `features/canvas-marketing` 功能域
4. 通过 `CanvasLink + toCanvasHref` 强制路由规范
5. 用 `app/canvas/layout.tsx` 统一壳层与样式作用域

## 路由映射

- `/canvas` -> 官网首页
- `/canvas/about` -> 关于页
- `/canvas/template` -> 模板页
- `/canvas/editor` -> 编辑器页（官网介绍页）
- `/canvas/er-diagram` -> ER 图介绍页
- `/canvas/diagram/[type]` -> 图类型介绍页

## 兼容处理

- 移除了 `react-router-dom` 依赖
- 移除了 `@radix-ui/react-icons` 依赖（改为 `lucide-react`）
- `hx-huitu` 工具入口重定向到 `/canvas`

## 首页还原补丁（2026-02-23）

- 按 `yunyan-canvas` 原版恢复首页渲染链路（`Home + Hero3D + HomePageBackdrop`）
- 恢复首页分段懒加载与原版滚动动画实现（`framer-motion`）
- 保留 Next 路由与 `CanvasLink` 迁移边界

## 后续扩展建议

1. 若开始接入真实功能，将 `pages/*` 中展示组件拆为 `sections/*` + `features/*`
2. 将 CTA 和价格等静态内容转为 `config/content.ts` 配置驱动
3. 增加 `features/canvas-marketing/tests` 做基础路由与渲染快照

## 规范增强（2026-02-23）

- 新增 `pnpm canvas:lint`：校验迁移边界与关键文件完整性
- 新增 `pnpm canvas:module -- <module-name>`：按标准目录生成模块脚手架
- 新增 `docs/standards/canvas-marketing-modules.md`：模块化分层与边界规则

## 工具模块规范增强（2026-02-24）

- 新增 `pnpm tools:module -- <tool-id>`：生成 `features/tools/<tool-id>` 标准脚手架
- 新增 `docs/standards/tools-modules.md`：工具模块分层、接入流程与回归守护规则
- 新增 CI 工作流：自动执行 `tools:word-regression`，防止导出模板回归
