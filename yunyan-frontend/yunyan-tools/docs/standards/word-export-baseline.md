# Word 导出规范基线

## 目标

- 统一 `apps/use-case-doc`、`apps/test-doc`、`apps/sql-to-table`、`apps/word-table` 的导出版式行为。
- 明确“论文标准对齐/全部居中”配置语义，保证预览与导出一致。
- 将高风险排版场景固化为可回归检查项，避免后续迭代破坏格式。
- 统一导出 preset 包（论文标准/企业文档），保证功能扩展时行为可预测。

## 适用范围

- `features/tools/*/services/*-word-export.ts`
- `features/tools/*/services/*-export-precheck.ts`
- `features/tools/*/components/*-workspace.tsx`
- `features/tools/shared/constants/word-export.ts`
- `features/tools/shared/constants/word-export-presets.ts`
- `features/tools/shared/constants/word-export-standard.ts`
- `features/tools/shared/components/word-export-controls.tsx`
- `features/tools/shared/components/word-export-config-panel.tsx`
- `features/tools/shared/services/word-export-engine.ts`
- `features/tools/shared/services/word-export-standard-guard.ts`

## 统一约束

1. 页面方向：
- 导出入口统一使用 `resolveWordPageOrientation(mode, autoOrientation)`。
- `auto` 由各模块的宽表判断函数决定（如 `shouldUseLandscapeForTestDoc`）。

2. 对齐模式：
- 全局类型：`WordCellAlignmentMode = "standard" | "all-center"`。
- 默认值：`defaultWordCellAlignmentMode = "standard"`。
- `standard`：表头居中，正文按语义对齐（文本类左对齐，编号/状态/短字段可居中）。
- `all-center`：正文单元格统一水平+垂直居中。

3. 导出 preset：
- `thesis-standard` 作为默认 preset，优先论文规范。
- `enterprise-report` 作为企业场景扩展 preset。
- 导出请求需支持 `presetId`，并透传到导出算法与 precheck。

4. 文本换行与稳态排版：
- 正文单元格必须包含 `word-break:break-word` 与 `overflow-wrap:anywhere`（或等效策略）。
- 宽表必须具备固定列策略（`<colgroup>` 或列宽映射）避免 Word 自动挤压导致错位。

5. 空值回退：
- 不能直接输出空字符串，必须有统一占位（如 `无`、`—`、`无字段数据`）。
- 空表场景必须输出完整行结构，避免导出后表格断裂。

6. 三线表与普通表：
- 三线表只保留顶线/中线/底线，辅助线按模块规则增设。
- 普通表格保留完整边框；同一工具导出两种格式时，内容结构必须一致。

7. 单路径导出与失败策略：
- 预览、图片、Word 必须共享同一渲染主路径。
- 禁止同一模块维护多套导出算法。
- 导出失败采用 fail-fast 策略，返回可读错误信息，不回退到“原文直接导出”。

8. Word 结构化策略：
- Word 导出正文必须是结构化元素（表格/段落），禁止图片式正文导出。
- 导出模板必须通过结构策略校验：包含表格结构标记，且不包含图片式正文标记。

## 模块基线矩阵

| 模块 | standard 正文对齐 | all-center 行为 | 宽表策略 | 空值策略 |
| --- | --- | --- | --- | --- |
| use-case-doc | 标签列居中，内容列左对齐 | 内容列改为水平/垂直居中 | 默认纵向，支持手动切换 | 段落回退 `无` |
| test-doc | 编号/状态居中，其余内容列左对齐 | 内容列居中 | `testDocCaseColumnSpecs + colgroup`，可自动横向 | 文本 `无`，编号占位 `—` |
| sql-to-table | `name/constraint/remark` 左对齐，其余短字段居中 | 所有字段居中 | 列宽映射 + 宽表自动横向 | 空表行 `无字段数据` |
| word-table | 表头居中，正文左对齐 | 正文居中 | `buildWordTableColumnWidths + colgroup`，可自动横向 | 单元格占位 `—` |

## 回归守护（必须通过）

执行：`pnpm tools:word-regression`

规则配置入口：`scripts/word-export-regression.config.js`
fixture 入口：`tests/fixtures/word-export/runtime-fixtures.json`

脚本需覆盖以下场景快照：

1. 长文本场景：
- 校验关键换行 token，确保长段落不撑破列宽。

2. 多列表场景：
- 校验列宽策略 token（`<colgroup>` 或列宽映射）存在。

3. 空值场景：
- 校验统一占位 token 与空表行 token 存在。

4. 超宽表场景：
- 校验自动横向判断与 precheck 提示 token 存在。

5. 对齐模式场景：
- 校验 `alignmentMode` 从配置、预检查、导出模板全链路接线。

## 变更流程

1. 修改导出算法前先更新本文件对应章节。
2. 修改后同步更新 `scripts/check-word-export-regression.js` 的断言。
3. 本地必须通过：
- `pnpm tools:word-regression`
- `pnpm tools:word-fixtures`
- `pnpm tools:module-admission`
- 如需视觉校验：`pnpm tools:visual-regression`（需 Playwright 环境）
- `pnpm lint`（或至少覆盖变更文件的 eslint 检查）
