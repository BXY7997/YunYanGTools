# Tool Runtime 合约

为保证新工具可扩展与可维护，统一采用 `ToolRuntimeContract`：

- 定义位置：`features/tools/shared/types/tool-runtime.ts`
- 构建器：`features/tools/shared/services/tool-runtime.ts`
- 统一注册表：`features/tools/shared/constants/tool-runtime-registry.ts`

每个工具模块需要提供 `services/<tool>-runtime.ts`，统一通过 `createToolRuntimeContract` 或 `createDiagramToolRuntimeContract` 构建，最少包含：

1. `toolId`
2. `schemaVersion`
3. `defaultExportPresetId`
4. `capabilities`（由构建器自动补齐）
5. `load()`（可选实现，默认本地空实现）
6. `sync()`（可选实现，默认本地空实现）
7. `generate()`
8. `export()`
9. `precheck()`
10. `buildPreview()`

当前已落地模块：

- `sql-to-table/services/sql-to-table-runtime.ts`
- `use-case-doc/services/use-case-doc-runtime.ts`
- `test-doc/services/test-doc-runtime.ts`
- `word-table/services/word-table-runtime.ts`
- `aigc-check/services/aigc-check-runtime.ts`
- `aigc-reduce/services/aigc-reduce-runtime.ts`
- `paper-rewrite/services/paper-rewrite-runtime.ts`
- `pseudo-code/services/pseudo-code-runtime.ts`
- `cover-card/services/cover-card-runtime.ts`
- `file-collector/services/file-collector-runtime.ts`
- `wallet/services/wallet-runtime.ts`
- `member/services/member-runtime.ts`
- `feature-structure/services/feature-structure-runtime.ts`
- `er-diagram/services/er-diagram-runtime.ts`
- `software-engineering/services/software-engineering-runtime.ts`
- `architecture-diagram/services/architecture-diagram-runtime.ts`
- `mind-map/services/mind-map-runtime.ts`

验收命令：

- `pnpm run tools:runtime-contract`
- `pnpm run tools:module-admission`
