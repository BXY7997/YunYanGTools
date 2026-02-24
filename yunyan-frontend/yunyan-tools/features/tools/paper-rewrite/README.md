# PaperRewrite

## 模块职责

- 负责 `paper-rewrite` 工具的输入、论文降重解析、结果展示与报告导出。
- 采用“远程优先 + 本地回退”模式，保证后端未就绪时前端可联调。
- 复用 `features/tools/shared` 的布局、草稿、提示、埋点与统一 API 客户端。

## 目录结构

- `components/`: 论文降重工作区 UI。
- `constants/`: 页面文案、默认输入、FAQ 与展示配置。
- `services/`: API 接入、本地模拟算法、导出预检查与运行时契约。
- `types/`: 论文降重域类型。

## 后端接入点

- 解析入口：`services/paper-rewrite-api.ts -> generatePaperRewriteData()`
- 报告导出：`services/paper-rewrite-api.ts -> exportPaperRewriteReport()`
- 统一端点定义：`features/tools/shared/constants/api-config.ts -> toolsApiEndpoints.paperRewrite`
- 统一 HTTP 客户端：`features/tools/shared/services/tool-api-client.ts`

## 集成清单

1. `config/tools-registry.ts` 已包含 `paper-rewrite` 菜单项。
2. `app/(tools)/apps/[tool]/page.tsx` 需要注入 `PaperRewriteWorkspace` 分支。
3. 真实后端上线后，仅需在 `paper-rewrite-api.ts` 调整远程响应解析，无需改动页面结构。
