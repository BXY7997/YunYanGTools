# Canvas Marketing 模块化规范

## 目标

- 保持当前官网展示效果 1:1 不变。
- 在不影响页面行为的前提下，提升可维护性与扩展速度。

## 分层结构

```text
app/canvas/*                     # Next App Router 路由层（只负责路由装配）
features/canvas-marketing/
├─ pages/*                       # 页面内容编排层
├─ components/*                  # 跨页面共享站点组件与 UI
├─ modules/<module-name>/*       # 业务功能模块层（后续扩展主战场）
├─ lib/*                         # 通用轻量工具
└─ styles/*                      # 主题与作用域样式
```

## 边界规则

- `pages/*` 可以组合 `components/*` 与 `modules/*`。
- `modules/*` 禁止依赖 `app/*` 和全局 `@/*` 别名。
- `modules/*` 内部优先使用相对路径或 `@canvas/*`。
- 站内跳转统一使用 `CanvasLink`，禁止直接在模块内使用 `next/link`。
- 路由前缀统一使用 `toCanvasHref`，避免硬编码页面路径策略。

## 开发流程

1. 创建模块：`pnpm canvas:module -- <module-name>`
2. 在 `pages/*` 中接入模块 `sections/*` 组件
3. 运行规范检查：`pnpm canvas:lint`
4. 运行项目 lint：`pnpm lint`

## 迁移守护

`pnpm canvas:lint` 会校验以下内容：

1. Canvas 路由关键文件是否齐全。
2. 是否误引入 `react-router-dom` / `framer-motion`。
3. 是否在 Canvas 功能域中误用 `@/` 全局别名。
4. 是否在白名单外直接引用 `next/link`。
