# Tool Runtime 合约

为保证新工具可扩展与可维护，统一采用 `ToolRuntimeContract`：

- 定义位置：`features/tools/shared/types/tool-runtime.ts`
- 构建器：`features/tools/shared/services/tool-runtime.ts`

每个工具模块需要提供 `services/<tool>-runtime.ts`，最少包含：

1. `toolId`
2. `schemaVersion`
3. `defaultExportPresetId`
4. `generate()`
5. `export()`
6. `precheck()`
7. `buildPreview()`

当前已落地模块：

- `use-case-doc/services/use-case-doc-runtime.ts`
- `test-doc/services/test-doc-runtime.ts`
- `sql-to-table/services/sql-to-table-runtime.ts`
- `word-table/services/word-table-runtime.ts`
- `aigc-check/services/aigc-check-runtime.ts`
