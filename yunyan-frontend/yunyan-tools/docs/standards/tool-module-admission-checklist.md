# Tool 模块准入清单

以下项必须全部满足后，工具模块才允许进入主分支：

1. 目录结构完整  
- `components/`
- `components/workspace/`
- `components/workspace/index.ts`
- `constants/`
- `services/`
- `types/`
- `index.ts`
- `README.md`

2. 运行时协议落地  
- 提供 `services/<tool>-runtime.ts`  
- 提供 `services/<tool>-contract.ts`（远程协议解析层）  
- 在 `index.ts` 导出 runtime contract  
- 在 `features/tools/shared/constants/tool-runtime-registry.ts` 注册模块 runtime
- 在 `features/tools/shared/constants/tool-backend-manifest.ts` 注册后端能力与端点

3. 工作区装配规范  
- `components/<tool>-workspace.tsx` 作为入口薄封装，指向 `components/workspace/<tool>-workspace.tsx`（历史模块可渐进迁移）  
- 工作区实现层根容器使用共享 `ToolWorkspaceShell`  
- 复杂模块按 `components/workspace/{sections|hooks|actions}` 拆分，避免单文件膨胀  
- 不重复硬编码 `tools-word-theme tools-paper-bg ...` 旧壳层类名  
- 在 `app/(tools)/apps/[tool]/page.tsx` 的 `specializedFormWorkspaceByToolId` 注册模块工作区

4. 导出基线与回归守护  
- `scripts/word-export-regression.config.js` 包含模块条目  
- `pnpm tools:word-regression` 通过  
- `pnpm tools:word-fixtures` 通过

5. 草稿与可维护性  
- 草稿状态接入 `schemaVersion`  
- 导出配置包含 `presetId` 并透传到导出服务

6. 文档与 CI  
- 模块 README 描述职责与关键入口  
- CI 工作流已覆盖回归脚本  
- `pnpm run tools:workspace-guard` 与 `pnpm run tools:module-admission` 通过
