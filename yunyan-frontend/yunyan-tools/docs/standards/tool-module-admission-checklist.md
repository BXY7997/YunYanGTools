# Tool 模块准入清单

以下项必须全部满足后，工具模块才允许进入主分支：

1. 目录结构完整  
- `components/`
- `constants/`
- `services/`
- `types/`
- `index.ts`
- `README.md`

2. 运行时协议落地  
- 提供 `services/<tool>-runtime.ts`  
- 在 `index.ts` 导出 runtime contract

3. 导出基线与回归守护  
- `scripts/word-export-regression.config.js` 包含模块条目  
- `pnpm tools:word-regression` 通过  
- `pnpm tools:word-fixtures` 通过

4. 草稿与可维护性  
- 草稿状态接入 `schemaVersion`  
- 导出配置包含 `presetId` 并透传到导出服务

5. 文档与 CI  
- 模块 README 描述职责与关键入口  
- CI 工作流已覆盖回归脚本
