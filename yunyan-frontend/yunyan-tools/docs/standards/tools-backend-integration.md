# Tools 后端接入规范

## 目标

- 统一所有工具模块的后端接入方式，避免每个页面重复实现请求/回退逻辑。
- 保证真实后端上线时，只改 `services/*-api.ts` 协议映射，不改工作区 UI。
- 支持“远程优先 + 本地兜底”联调模式，确保前后端并行开发。

## 统一接入层

1. 端点注册：`features/tools/shared/constants/api-config.ts`
2. HTTP客户端：`features/tools/shared/services/tool-api-client.ts`
3. 远程开关与导出命名：`features/tools/shared/services/tool-api-runtime.ts`
4. 协议兼容辅助：`features/tools/shared/services/tool-api-schema.ts`
5. 提示文案与回退提示：`features/tools/shared/constants/tool-copy.ts`
6. runtime 注册表：`features/tools/shared/constants/tool-runtime-registry.ts`
7. 后端能力清单：`features/tools/shared/constants/tool-backend-manifest.ts`

## 模块落位规则

每个工具模块必须具备：

- `services/<tool>-api.ts`：
  - 对外暴露业务动作（如 `generate*`、`detect*`、`export*`）
  - 实现 `preferRemote` 开关
  - 引用 `services/<tool>-contract.ts` 完成远程响应解析与协议映射
  - 远程异常回退本地逻辑
- `services/<tool>-contract.ts`：
  - 聚合远程接口 schema（`zod`）与 payload 解析规则
  - 作为后端真实接口对齐的唯一协议层
- `services/<tool>-runtime.ts`：
  - 固定工具 runtime 合约入口
  - 提供 schemaVersion 与默认预设
- `components/<tool>-workspace.tsx`：
  - 只调用模块服务，不直接拼接接口 URL
  - 通知统一走 `tool-copy` 文案

## 当前模块映射

- `sql-to-table`:
  - Contract: `features/tools/sql-to-table/services/sql-to-table-contract.ts`
  - API: `features/tools/sql-to-table/services/sql-to-table-api.ts`
  - 端点: `toolsApiEndpoints.sqlToTable`
- `use-case-doc`:
  - Contract: `features/tools/use-case-doc/services/use-case-doc-contract.ts`
  - API: `features/tools/use-case-doc/services/use-case-doc-api.ts`
  - 端点: `toolsApiEndpoints.useCaseDoc`
- `test-doc`:
  - Contract: `features/tools/test-doc/services/test-doc-contract.ts`
  - API: `features/tools/test-doc/services/test-doc-api.ts`
  - 端点: `toolsApiEndpoints.testDoc`
- `word-table`:
  - Contract: `features/tools/word-table/services/word-table-contract.ts`
  - API: `features/tools/word-table/services/word-table-api.ts`
  - 端点: `toolsApiEndpoints.wordTable`
- `aigc-check`:
  - API: `features/tools/aigc-check/services/aigc-check-api.ts`
  - 端点: `toolsApiEndpoints.aigcCheck`
- `aigc-reduce`:
  - API: `features/tools/aigc-reduce/services/aigc-reduce-api.ts`
  - 端点: `toolsApiEndpoints.aigcReduce`
- `paper-rewrite`:
  - API: `features/tools/paper-rewrite/services/paper-rewrite-api.ts`
  - 端点: `toolsApiEndpoints.paperRewrite`
- `pseudo-code`:
  - Contract: `features/tools/pseudo-code/services/pseudo-code-contract.ts`
  - API: `features/tools/pseudo-code/services/pseudo-code-api.ts`
  - 端点: `toolsApiEndpoints.pseudoCode`
- `cover-card`:
  - Contract: `features/tools/cover-card/services/cover-card-contract.ts`
  - API: `features/tools/cover-card/services/cover-card-api.ts`
  - 端点: `toolsApiEndpoints.coverCard`

## 真实后端上线步骤

1. 在 `api-config.ts` 中确认端点路径与环境变量。
2. 在 `tool-runtime-registry.ts` 注册新模块 runtime，保证统一调度入口。
3. 在模块 `*-api.ts` 中补全真实字段映射（保留本地兜底逻辑）。
4. 在工作区点击流中开启 `preferRemote: true`。
5. 用 `ToolApiError.code/status` 补齐业务错误映射文案。
6. 回归执行：`pnpm run tools:module-admission`、`pnpm run tools:workspace-guard` 与 `pnpm run tools:word-regression`。
