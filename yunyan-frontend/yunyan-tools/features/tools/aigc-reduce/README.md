# AigcReduce

## 模块职责

- 负责 `aigc-reduce` 工具的输入、降AIGC解析、结果展示与报告导出。
- 采用“远程优先 + 本地回退”模式，保证后端未就绪时前端可持续联调。
- 复用 `features/tools/shared` 的布局、草稿、提示、埋点与统一 API 客户端。

## 目录结构

- `components/`: AIGC率降低工作区 UI。
- `constants/`: 页面文案、默认输入、FAQ 与展示配置。
- `services/`: API 接入、本地模拟算法、导出预检查与运行时契约。
- `types/`: AIGC率降低域类型。

## 后端接入点

- 解析入口：`services/aigc-reduce-api.ts -> generateAigcReduceData()`
- 报告导出：`services/aigc-reduce-api.ts -> exportAigcReduceReport()`
- 统一端点定义：`features/tools/shared/constants/api-config.ts -> toolsApiEndpoints.aigcReduce`
- 统一 HTTP 客户端：`features/tools/shared/services/tool-api-client.ts`

## 集成清单

1. `config/tools-registry.ts` 已包含 `aigc-reduce` 菜单项。
2. `app/(tools)/apps/[tool]/page.tsx` 需要注入 `AigcReduceWorkspace` 分支。
3. 真实后端上线后，仅需在 `aigc-reduce-api.ts` 调整远程响应解析，无需改动页面结构。
