# Canvas Marketing Modules

## 目标

- 为后续功能模块提供统一目录和边界，避免页面代码持续堆积。
- 保持现有官网效果不变，模块化仅影响代码组织方式。

## 模块目录标准

每个模块位于 `features/canvas-marketing/modules/<module-name>/`，并遵循：

- `components/`：模块内部可复用 UI 组件。
- `sections/`：页面区块组合组件。
- `hooks/`：模块相关 React hooks。
- `services/`：纯函数、数据拼装、接口适配。
- `constants/`：常量与 key。
- `types/`：模块类型定义。
- `index.ts`：模块公开出口。

## 新建模块

```bash
pnpm canvas:module -- <module-name>
```

示例：

```bash
pnpm canvas:module -- smart-diagram
```

## 验收命令

```bash
pnpm canvas:lint
pnpm lint
```
