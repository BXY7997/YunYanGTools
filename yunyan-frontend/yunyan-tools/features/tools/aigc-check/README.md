# AigcCheck

## 模块职责

- 负责 `aigc-check` 工具的输入、检测、结果展示与报告导出。
- 采用“远程优先 + 本地回退”模式，确保接口未就绪时也可联调前端交互。
- 复用 `features/tools/shared` 的提示、埋点、草稿、布局与后端客户端能力。

## 目录结构

- `components/`: AIGC 检测工作区 UI。
- `constants/`: 页面文案、FAQ、预览样例、模式配置。
- `services/`: API 接入、检测算法模拟、报告导出、预检查。
- `types/`: AIGC 检测域类型。

## 后端接入点

- 文本/文件检测入口：`services/aigc-check-api.ts -> generateAigcCheckData()`
- 报告导出入口：`services/aigc-check-api.ts -> exportAigcCheckReport()`
- 统一端点定义：`features/tools/shared/constants/api-config.ts -> toolsApiEndpoints.aigcCheck`
- 统一 HTTP 客户端：`features/tools/shared/services/tool-api-client.ts`

## 集成清单

1. `config/tools-registry.ts` 已包含 `aigc-check` 菜单项。
2. `app/(tools)/apps/[tool]/page.tsx` 需要注入 `AigcCheckWorkspace` 分支。
3. 真实后端上线后，仅需替换 `aigc-check-api.ts` 中远程结果解析逻辑，无需改动页面结构。
