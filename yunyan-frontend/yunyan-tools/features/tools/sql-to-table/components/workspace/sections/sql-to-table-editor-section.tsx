import * as React from "react"
import {
  Download,
  Loader2,
  RotateCcw,
  Smile,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordExportConfigPanel } from "@/features/tools/shared/components/word-export-config-panel"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolSectionHeading,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { toolWorkspaceCopy } from "@/features/tools/shared/constants/tool-copy"
import {
  sqlToTablePresets,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import type {
  ExportColumnKey,
  ExportTableFormat,
  SqlToTablePaperTemplateId,
  SqlToTableMode,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"
import {
  sqlToTableWorkspaceViewConfig,
  type SqlToTableWorkspaceState,
} from "@/features/tools/sql-to-table/components/workspace/use-sql-to-table-workspace-state"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"

interface ConfigGroupProps {
  title: string
  hint: string
  className?: string
  children: React.ReactNode
}

const ConfigGroup = React.memo(function ConfigGroup({
  title,
  hint,
  className,
  children,
}: ConfigGroupProps) {
  return (
    <section className={cn("min-w-0 space-y-2", className)}>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
  )
})

interface SqlToTableEditorSectionProps {
  state: SqlToTableWorkspaceState
}

export function SqlToTableEditorSection({ state }: SqlToTableEditorSectionProps) {
  return (
    <section className={toolsWorkspaceLayout.surfaceSection}>
      {state.workspaceModules.sectionHeading ? (
        <ToolSectionHeading
          title="开始使用（支持单表和多表）"
          description="选择 SQL 生成或 AI 生成来创建 Word 表格文档"
        />
      ) : null}

      <div className="space-y-3">
        <Tabs
          value={state.mode}
          onValueChange={(value) => state.setMode(value as SqlToTableMode)}
          className="space-y-6"
        >
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg p-1">
            {sqlToTableWorkspaceViewConfig.modeTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="tools-word-button-transition h-full cursor-pointer rounded-md px-3 py-0 text-sm font-medium leading-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div
            className={cn(
              "relative overflow-hidden",
              state.mode === "sql" ? "min-h-[280px]" : "min-h-[320px]"
            )}
          >
            <TabsContent
              forceMount
              value="sql"
              className={cn(
                "duration-180 mt-0 space-y-4 transition-opacity ease-out",
                state.mode === "sql"
                  ? "relative opacity-100"
                  : "pointer-events-none absolute inset-0 opacity-0"
              )}
            >
              <textarea
                value={state.sqlInput}
                onChange={(event) => state.setSqlInput(event.target.value)}
                placeholder="请输入 CREATE TABLE 语句或表结构信息..."
                className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 font-mono text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              />
            </TabsContent>

            <TabsContent
              forceMount
              value="ai"
              className={cn(
                "duration-180 mt-0 space-y-4 transition-opacity ease-out",
                state.mode === "ai"
                  ? "relative opacity-100"
                  : "pointer-events-none absolute inset-0 opacity-0"
              )}
            >
              <div className="flex flex-wrap gap-2">
                {sqlToTablePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => state.handleApplyPreset(preset.id, "ai")}
                    className={cn(
                      "tools-word-button-transition cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
                      state.aiPresetId === preset.id
                        ? "border-foreground/25 bg-foreground/5 font-medium text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <textarea
                value={state.aiInput}
                onChange={(event) => state.setAiInput(event.target.value)}
                placeholder="请描述数据库表结构需求，AI 将自动生成规范表格..."
                className="min-h-[280px] w-full resize-y overflow-auto rounded-md border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="space-y-2.5 rounded-md border border-border/70 bg-background/35 p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={state.handleResetRecommended}
              className="tools-word-button-transition inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              恢复推荐配置
            </button>
            <button
              type="button"
              onClick={state.handleClearDraft}
              className="tools-word-button-transition inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
            >
              清空草稿
            </button>
          </div>

          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            <ConfigGroup title="导出表格类型" hint="普通表格 / 三线表">
              <RadioGroup
                value={state.format}
                onValueChange={(value) => state.setFormat(value as ExportTableFormat)}
                className="flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                {sqlToTableWorkspaceViewConfig.formatOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={opt.value}
                      id={`fmt-${opt.value}`}
                      className="border-input"
                    />
                    <label htmlFor={`fmt-${opt.value}`} className="cursor-pointer text-sm leading-none">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </ConfigGroup>

            <ConfigGroup title="表题章节号" hint="用于“表 3-1、表 3-2 …”">
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">
                  输入章节号（如 3 或 3.2），自动生成“表 {state.resolvedCaptionChapterSerial}-n”
                </span>
                <Input
                  value={state.captionChapterSerial}
                  onChange={(event) => state.handleCaptionChapterSerialChange(event.target.value)}
                  placeholder={sqlToTableWorkspaceViewConfig.defaultCaptionChapterSerial}
                  inputMode="decimal"
                  maxLength={12}
                  className="h-9 text-sm"
                />
              </label>
            </ConfigGroup>

            <ConfigGroup title="类型大小写" hint="控制字段类型显示格式">
              <RadioGroup
                value={state.typeCase}
                onValueChange={(value) => state.setTypeCase(value as TypeCaseMode)}
                className="flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                {sqlToTableWorkspaceViewConfig.typeCaseOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={opt.value}
                      id={`tc-${opt.value}`}
                      className="border-input"
                    />
                    <label htmlFor={`tc-${opt.value}`} className="cursor-pointer text-sm leading-none">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </ConfigGroup>
          </div>

          <WordExportConfigPanel
            orientationMode={state.orientationMode}
            onOrientationChange={state.setOrientationMode}
            alignmentMode={state.alignmentMode}
            onAlignmentChange={state.setAlignmentMode}
            idPrefix="sql"
            orientationInlineDescription
            alignmentInlineDescription
          />

          <div className="grid gap-3.5 border-t border-border/70 pt-2.5 md:grid-cols-2 xl:grid-cols-3">
            <ConfigGroup
              title="论文格式模板"
              hint="模板参数作用于预览和导出"
              className="md:col-span-2 xl:col-span-2"
            >
              <RadioGroup
                value={state.paperStyle}
                onValueChange={(value) =>
                  state.setPaperStyle(value as SqlToTablePaperTemplateId)
                }
                className="flex flex-wrap items-center gap-x-5 gap-y-2.5"
              >
                {sqlToTableWorkspaceViewConfig.paperStyleOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={opt.value}
                      id={`paper-style-${opt.value}`}
                      className="border-input"
                    />
                    <label
                      htmlFor={`paper-style-${opt.value}`}
                      className="cursor-pointer text-sm leading-none"
                    >
                      {opt.label}
                      <span className="ml-1 text-xs text-muted-foreground">({opt.description})</span>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </ConfigGroup>

            <ConfigGroup
              title="选择导出列"
              hint="勾选需要导出的字段"
              className="md:col-span-2 xl:col-span-3"
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                {sqlToTableWorkspaceViewConfig.columnOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${opt.value}`}
                      checked={state.columns.includes(opt.value as ExportColumnKey)}
                      onCheckedChange={() =>
                        state.handleColumnToggle(opt.value as ExportColumnKey)
                      }
                    />
                    <label htmlFor={`col-${opt.value}`} className="cursor-pointer text-sm leading-none">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </ConfigGroup>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          {state.mode === "sql" ? (
            <button
              type="button"
              onClick={() =>
                state.handleApplyPreset(state.defaultSqlPreset.id, "sql", {
                  autoGenerate: true,
                })
              }
              disabled={state.loading === "generate"}
              className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.loading === "generate" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Smile className="size-4" />
              )}
              使用测试数据
            </button>
          ) : null}

          <button
            type="button"
            onClick={state.handleExport}
            disabled={state.loading === "export"}
            className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.loading === "export" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            导出Word文档
          </button>
        </div>

        <ToolConfigSummary items={state.configSummary} />
        <ToolNoticeSlot tone={state.notice.tone} text={state.notice.text} />

        {state.workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
      </div>

      <p className="sr-only">{toolWorkspaceCopy.sqlToTable.initialNotice}</p>
    </section>
  )
}
