# File Collector

## 模块职责

- 提供“文件收集”工具的专属工作区交互。
- 支持收集入口发布（收集码/分享链接）、名单导入、文件匹配、自动重命名、催交提醒与多格式导出。
- 采用现有 tools 模块标准：runtime 合约、workspace 壳层、后端 manifest 对齐。

## 目录结构

- `components/`: 工作区页面与提交流程交互。
  - `components/file-collector-workspace.tsx`: 页面编排层（容器组件），只负责组合区块与弹窗。
  - `components/workspace/`: 业务区块、弹窗、hook、工具函数与类型拆分目录。
    - `use-file-collector-dialogs.ts`: UI 状态层（弹窗、分页、草稿、派生数据）。
    - `use-file-collector-actions.ts`: 动作层（创建/删除/导入/状态切换）。
    - `use-file-collector-workspace-state.ts`: Facade 层（聚合 dialogs + actions，统一对外）。
- `constants/`: 默认模板、文案、FAQ 与 SEO 片段。
- `services/`: 匹配算法、导出逻辑、runtime 合约、API 适配。
- `services/file-collector-dashboard-api.ts`: 班级/收集管理的前端模拟与后端接口预留层（远程优先，失败回退本地）。
  - 变更操作统一返回 `{ source, message, remoteData }`，便于后续直接消费后端返回的 `id/classId/collectionId`。
  - `services/file-collector-dashboard-remote.ts`: 后端响应解析层，兼容 `{ data/result/payload }` 包装，减少页面改动。
- `types/`: 文件收集域模型。
- `INTEGRATION.md`: 后端接入约定（推荐返回结构、错误码、并发与幂等建议）。

## 集成说明

1. 在 `app/(tools)/apps/[tool]/page.tsx` 注册 `FileCollectorWorkspace`。
2. 在 `features/tools/shared/constants/tool-runtime-registry.ts` 注册 runtime。
3. 在 `features/tools/shared/constants/tool-backend-manifest.ts` 注册后端能力与端点。
4. 在 `features/tools/shared/constants/api-config.ts` 增加 `fileCollector` 端点组。
5. 如后续接入真实后端，优先补全 `services/file-collector-api.ts` 的远程返回映射。
   - 班级/收集管理可直接扩展 `services/file-collector-dashboard-api.ts` 的 `remoteData` 解析策略，避免改动页面层状态逻辑。
6. 分享链接基址建议通过 `NEXT_PUBLIC_FILE_COLLECTOR_SHARE_BASE_URL` 配置，默认本地路由 `/apps/file-collector`，避免硬编码外部链接失效。
