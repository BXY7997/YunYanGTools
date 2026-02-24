# PseudoCode

## 模块职责

- 负责 `pseudo-code` 工具的 AI 生成、手动编写、渲染配置与导出能力（PNG/SVG/Word）。
- 采用“远程优先 + 本地引擎回退”模式，保证后端未接入时也可完整运行。
- 复用 `features/tools/shared` 的草稿、提示、埋点、Footer 与 API 客户端能力。

## 目录结构

- `components/`: 伪代码工作台 UI（左右异构布局 + 粘性预览）。
- `constants/`: 模式配置、默认输入、FAQ 与 SEO 文案。
- `services/`: 生成 API、渲染引擎、导出逻辑、预检查、运行时契约。
- `types/`: 伪代码域模型定义。

## 后端接入点

- 生成入口：`services/pseudo-code-api.ts -> generatePseudoCodeData()`
- 图片导出：`services/pseudo-code-api.ts -> exportPseudoCodeImage()`
- Word 导出：`services/pseudo-code-api.ts -> exportPseudoCodeWord()`
- 统一端点：`features/tools/shared/constants/api-config.ts -> toolsApiEndpoints.pseudoCode`
- 统一客户端：`features/tools/shared/services/tool-api-client.ts`

## 设计说明

- 当前采用本地轻量引擎实现关键字高亮与排版导出，避免新增大体积依赖。
- 图片导出支持 PNG/SVG 下拉选择，并基于内容精确裁剪，避免多余空白与背景网格干扰。
- Word 导出遵循论文模板参数（题注、线宽层级、字号与分页基础设置）并保持与其他工具一致的导出守护。
- 若后续接入第三方渲染库，建议通过动态导入和独立子模块方式接入，避免污染主包体积。
