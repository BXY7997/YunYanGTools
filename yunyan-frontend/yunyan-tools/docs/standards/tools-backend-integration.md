# Tools 后端接入规范

## 目标

- 统一所有工具模块的后端接入方式，避免每个页面重复实现请求/回退逻辑。
- 保证真实后端上线时，只改 `services/*-api.ts` 协议映射，不改工作区 UI。
- 支持“远程优先 + 本地兜底”联调模式，确保前后端并行开发。

## 统一接入层

1. 端点注册：`features/tools/shared/constants/api-config.ts`
2. HTTP客户端：`features/tools/shared/services/tool-api-client.ts`
3. 协议兼容辅助：`features/tools/shared/services/tool-api-schema.ts`
4. 提示文案与回退提示：`features/tools/shared/constants/tool-copy.ts`

## 模块落位规则

每个工具模块必须具备：

- `services/<tool>-api.ts`：
  - 对外暴露业务动作（如 `generate*`、`detect*`、`export*`）
  - 实现 `preferRemote` 开关
  - 实现远程响应解析
  - 远程异常回退本地逻辑
- `services/<tool>-runtime.ts`：
  - 固定工具 runtime 合约入口
  - 提供 schemaVersion 与默认预设
- `components/<tool>-workspace.tsx`：
  - 只调用模块服务，不直接拼接接口 URL
  - 通知统一走 `tool-copy` 文案

## 当前模块映射

- `sql-to-table`:
  - API: `features/tools/sql-to-table/services/sql-to-table-api.ts`
  - 端点: `toolsApiEndpoints.sqlToTable`
- `use-case-doc`:
  - API: `features/tools/use-case-doc/services/use-case-doc-api.ts`
  - 端点: `toolsApiEndpoints.useCaseDoc`
- `test-doc`:
  - API: `features/tools/test-doc/services/test-doc-api.ts`
  - 端点: `toolsApiEndpoints.testDoc`
- `word-table`:
  - API: `features/tools/word-table/services/word-table-api.ts`
  - 端点: `toolsApiEndpoints.wordTable`
- `aigc-check`:
  - API: `features/tools/aigc-check/services/aigc-check-api.ts`
  - 端点: `toolsApiEndpoints.aigcCheck`

## 真实后端上线步骤

1. 在 `api-config.ts` 中确认端点路径与环境变量。
2. 在模块 `*-api.ts` 中补全真实字段映射（保留本地兜底逻辑）。
3. 在工作区点击流中开启 `preferRemote: true`。
4. 用 `ToolApiError.code/status` 补齐业务错误映射文案。
5. 回归执行：`pnpm run tools:module-admission` 与 `pnpm run tools:word-regression`。
