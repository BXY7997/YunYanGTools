# Tools 模块化规范

## 目标

- 保持 `app/(tools)` 路由壳层稳定，仅在 `features/tools/*` 扩展业务。
- 统一新模块目录结构，降低多人并行开发与后端接入成本。
- 复用共享能力（配色、提示文案、导出引擎、草稿、埋点、回归守护）。
- 所有工具页根容器统一走 `ToolWorkspaceShell`，避免重复样式壳层。

## 分层结构

```text
app/(tools)/*                            # 路由装配层（只做页面入口）
features/tools/
├─ shared/                               # 共享组件、常量、hooks、services
└─ <tool-id>/                            # 工具模块边界
   ├─ components/                        # 入口薄封装（仅 re-export/装配）
   │  └─ workspace/                      # 工作区实现层（sections/hooks/actions）
   ├─ constants/                         # 模块配置与文案
   ├─ services/                          # API/导出/预检查/纯函数
   ├─ types/                             # 模块域类型
   ├─ index.ts                           # 模块公共出口
   └─ README.md                          # 集成说明
```

## 快速创建

1. 生成模块骨架：`pnpm tools:module -- <tool-id> --title "<工具标题>"`
2. 在 `config/tools-registry.ts` 增加 `id/route/workspaceType`。
3. 在 `app/(tools)/apps/[tool]/page.tsx` 的 `specializedFormWorkspaceByToolId` 注册新 `Workspace` 组件。
4. 补全 `services/*-contract.ts`（远程协议 schema + payload 解析）与 `services/*-api.ts`（业务动作）。
5. 如模块包含 Word 导出服务（`services/*-word-export.ts`），更新 `scripts/word-export-regression.config.js` 加守护规则。
6. 使用 `pnpm tools:module` 命令输出的建议片段，快速补齐回归配置字段和路径。
7. 按 [tool-runtime-contract.md](/home/ubt/CodeSp/Enterprise/YunYanGTools/yunyan-frontend/yunyan-tools/docs/standards/tool-runtime-contract.md) 提供模块 runtime 合约。
8. 按 [tools-backend-integration.md](/home/ubt/CodeSp/Enterprise/YunYanGTools/yunyan-frontend/yunyan-tools/docs/standards/tools-backend-integration.md) 规范落位后端接口与回退策略。

## Word 导出基线

- 所有 Word 导出模块必须遵循 [word-export-baseline.md](/home/ubt/CodeSp/Enterprise/YunYanGTools/yunyan-frontend/yunyan-tools/docs/standards/word-export-baseline.md)。
- 涉及导出排版算法、对齐模式、页面方向或空值回退逻辑时，必须同步更新基线文档与回归脚本中的场景快照断言。

## 文案与错误码规范

- 工作区提示统一放在 `features/tools/shared/constants/tool-copy.ts`。
- 远程异常统一通过 `buildToolApiFallbackNotice` 生成提示，禁止散落硬编码。
- 成功/失败通知统一使用 `withNoticeDetail` / `composeNoticeMessage`，保证提示风格一致。

## CI 规范

- `tools:word-regression` 必须在 PR 中自动执行。
- `tools:word-fixtures`、`tools:module-admission` 与 `tools:workspace-guard` 必须在 PR 中自动执行。
- 涉及导出模板或排版算法调整时，必须同步更新回归脚本的关键 token。
- 新模块上线前必须通过 [tool-module-admission-checklist.md](/home/ubt/CodeSp/Enterprise/YunYanGTools/yunyan-frontend/yunyan-tools/docs/standards/tool-module-admission-checklist.md)。
- `tools:module-admission` 会校验工作区是否使用共享 `ToolWorkspaceShell`，禁止重复复制旧壳层类名。
- `tools:module-admission` 会校验入口文件是否指向 `components/workspace/*-workspace.tsx`，避免再次出现巨型入口文件。
- `tools:module-admission` 会校验模块是否已注册到 runtime registry 与 backend manifest。
- `tools:workspace-guard` 会校验复杂模块是否完成 `sections/hooks/actions` 拆分并提供目录级 barrel。
