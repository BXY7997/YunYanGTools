# Course Code

## 模块职责

- 负责 `/apps/code-runner` 的多语言在线代码运行与源码导出。
- 对齐 `https://tools.anqstar.com/tools/code-running` 的核心流程：语言选择、代码编辑、运行结果反馈。
- 采用“远程优先 + 本地回退”结构，方便后续接入真实编译执行后端。

## 目录结构

- `components/`: 代码运行工作区 UI。
- `constants/`: 语言选项、默认示例、FAQ 与 SEO 文案。
- `services/`: 运行、导出、预检与运行时契约。
- `types/`: 模块类型定义。

## 关键入口

- `components/code-runner-workspace.tsx`: 主工作区。
- `services/code-runner-api.ts`: 示例加载/运行/导出的接口与回退实现。
- `services/code-runner-model.ts`: 本地模拟运行与多语言输出解析。
- `services/code-runner-runtime.ts`: 运行时契约，接入统一注册体系。

## 后端接入约定

- 运行接口：`/tools/code-runner/run`
- 导出接口：`/tools/code-runner/export-code`
- 前端已按统一 request/response 结构实现，可直接切换至真实编译执行后端。
