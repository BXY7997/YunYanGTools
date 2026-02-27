import * as React from "react"

import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolSectionHeading } from "@/features/tools/shared/components/tool-workspace-modules"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { SqlToTablePreviewCard } from "@/features/tools/sql-to-table/components/workspace/sections/sql-to-table-preview-card"
import type { ExportTableFormat } from "@/features/tools/sql-to-table/types/sql-to-table"
import type { SqlToTableWorkspaceState } from "@/features/tools/sql-to-table/components/workspace/use-sql-to-table-workspace-state"

const previewLabelByFormat: Record<ExportTableFormat, string> = {
  normal: "普通表格",
  "three-line": "三线表",
}

interface SqlToTablePreviewSectionProps {
  state: SqlToTableWorkspaceState
}

export function SqlToTablePreviewSection({ state }: SqlToTablePreviewSectionProps) {
  return (
    <section className={toolsWorkspaceLayout.surfaceSection}>
      {state.workspaceModules.sectionHeading ? (
        <ToolSectionHeading
          title="效果展示"
          description="查看 SQL 转普通表格与三线表的导出效果"
        />
      ) : null}

      {state.previewTables.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {state.previewTables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => state.setActiveTableId(table.id)}
              className={cn(
                "tools-word-button-transition cursor-pointer rounded-md border px-3 py-1 text-xs transition-colors duration-150",
                state.activeTable?.id === table.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
              )}
            >
              {table.displayName} · {table.columns.length} 字段
            </button>
          ))}
        </div>
      ) : null}

      {state.activeTable ? (
        <p className="text-xs text-muted-foreground">
          当前表：{state.activeTable.displayName}，共 {state.activeTable.columns.length} 个字段，当前导出 {state.visibleColumns.length} 列。
        </p>
      ) : null}

      <Tabs
        value={state.format}
        onValueChange={(value) => state.setFormat(value as ExportTableFormat)}
        className="space-y-4"
      >
        <div className="rounded-md border border-border/70 bg-muted/25 p-1">
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-md p-1">
            {([
              { value: "normal", label: previewLabelByFormat.normal },
              { value: "three-line", label: previewLabelByFormat["three-line"] },
            ] as const).map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="tools-word-button-transition h-full cursor-pointer rounded-md px-3 py-0 text-sm font-medium leading-none"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div
          className="duration-250 relative min-h-[260px] overflow-hidden transition-[height] ease-out"
          style={
            state.previewTabStageHeight
              ? { height: `${state.previewTabStageHeight}px` }
              : undefined
          }
        >
          <TabsContent
            forceMount
            ref={state.normalPreviewRef}
            value="normal"
            className={cn(
              "duration-180 mt-0 transition-opacity ease-out",
              state.format === "normal"
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            )}
          >
            {state.activeTable ? (
              <SqlToTablePreviewCard
                table={state.activeTable}
                tableIndex={state.activeTableIndex}
                captionChapterSerial={state.resolvedCaptionChapterSerial}
                typeCase={state.typeCase}
                columns={state.visibleColumns}
                format="normal"
                label={previewLabelByFormat.normal}
                paperStyleId={state.paperStyle}
                alignmentMode={state.alignmentMode}
                selected={state.format === "normal"}
              />
            ) : (
              <div className="tools-preview-shell flex aspect-video items-center justify-center rounded-lg">
                <p className="text-sm text-muted-foreground">普通表格预览区</p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            forceMount
            ref={state.threeLinePreviewRef}
            value="three-line"
            className={cn(
              "duration-180 mt-0 transition-opacity ease-out",
              state.format === "three-line"
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            )}
          >
            {state.activeTable ? (
              <SqlToTablePreviewCard
                table={state.activeTable}
                tableIndex={state.activeTableIndex}
                captionChapterSerial={state.resolvedCaptionChapterSerial}
                typeCase={state.typeCase}
                columns={state.visibleColumns}
                format="three-line"
                label={previewLabelByFormat["three-line"]}
                paperStyleId={state.paperStyle}
                alignmentMode={state.alignmentMode}
                selected={state.format === "three-line"}
              />
            ) : (
              <div className="tools-preview-shell flex aspect-video items-center justify-center rounded-lg">
                <p className="text-sm text-muted-foreground">三线表预览区</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}
