"use client"

import { Wand2 } from "lucide-react"

import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  ToolPromoNotice,
  ToolWorkspaceHero,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
import { SqlToTableFooter } from "@/features/tools/sql-to-table/components/workspace/sections/sql-to-table-footer"
import { SqlToTableEditorSection } from "@/features/tools/sql-to-table/components/workspace/sections/sql-to-table-editor-section"
import { SqlToTablePreviewSection } from "@/features/tools/sql-to-table/components/workspace/sections/sql-to-table-preview-section"
import { useSqlToTableWorkspaceState } from "@/features/tools/sql-to-table/components/workspace/use-sql-to-table-workspace-state"
import type { ToolMenuLinkItem } from "@/types/tools"

interface SqlToTableWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function SqlToTableWorkspace({
  tool,
  groupTitle,
}: SqlToTableWorkspaceProps) {
  const state = useSqlToTableWorkspaceState({ tool, groupTitle })

  return (
    <ToolWorkspaceShell>
      <ToolWorkspaceHero
        srOnlyTitle="在线 SQL 表格导出工具 - 数据库表结构转 Word 文档"
        title="SQL 三线表导出工具"
        subtitle="快速将 SQL 表结构转换为论文规范 Word 表格"
        description="支持将 DDL 语句或表结构信息快速转换为标准三线表或普通表格，也支持 AI 智能生成，适用于数据库设计文档、系统设计说明书与课程论文提交场景。"
        tags={["SQL解析", "三线表", "标准Word导出"]}
      />

      {state.workspaceModules.promoNotice ? (
        <ToolPromoNotice
          content={smartDocPromoContent}
          icon={<Wand2 className="size-3.5" />}
        />
      ) : null}

      <SqlToTableEditorSection state={state} />
      <SqlToTablePreviewSection state={state} />

      <SqlToTableFooter showFaq={Boolean(state.workspaceModules.faqItem)} />
    </ToolWorkspaceShell>
  )
}
