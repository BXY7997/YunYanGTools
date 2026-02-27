import * as React from "react"

import { InspectorFields } from "@/components/tools/workspace-sections"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { ToolWorkspaceConfig } from "@/types/tools"

type WorkspaceFieldValue = string | number | boolean

interface FeatureStructureRightPanelProps {
  collapsed: boolean
  width: number
  config: ToolWorkspaceConfig
  fieldValues: Record<string, WorkspaceFieldValue>
  onFieldValueChange: (fieldId: string, value: WorkspaceFieldValue) => void
  onResetFields: () => void
  onStartResize: (event: React.PointerEvent<HTMLButtonElement>) => void
  onQuickEntityInsert: (value: string) => void
}

interface FeatureStructureInspectorBodyProps {
  config: ToolWorkspaceConfig
  fieldValues: Record<string, WorkspaceFieldValue>
  onFieldValueChange: (fieldId: string, value: WorkspaceFieldValue) => void
  onQuickEntityInsert: (value: string) => void
}

const FeatureStructureInspectorBody = React.memo(function FeatureStructureInspectorBody({
  config,
  fieldValues,
  onFieldValueChange,
  onQuickEntityInsert,
}: FeatureStructureInspectorBodyProps) {
  const hasNodeSections = config.inspectorSchema.nodeSections.length > 0

  return (
    <div className="flex-1 p-3">
      {hasNodeSections ? (
        <Tabs defaultValue="style" className="space-y-2">
          <TabsList className="grid w-full grid-cols-2 bg-background p-1 text-muted-foreground">
            <TabsTrigger
              value="style"
              className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              画布样式
            </TabsTrigger>
            <TabsTrigger
              value="node"
              className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              节点修改
            </TabsTrigger>
          </TabsList>
          <TabsContent value="style">
            <InspectorFields
              sections={config.inspectorSchema.styleSections}
              values={fieldValues}
              onValueChange={onFieldValueChange}
            />
          </TabsContent>
          <TabsContent value="node">
            <InspectorFields
              sections={config.inspectorSchema.nodeSections}
              values={fieldValues}
              onValueChange={onFieldValueChange}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <InspectorFields
          sections={config.inspectorSchema.styleSections}
          values={fieldValues}
          onValueChange={onFieldValueChange}
        />
      )}

      {config.inspectorSchema.quickEntities?.length ? (
        <div className="mt-3 rounded-md border border-border bg-card p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            快捷节点
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {config.inspectorSchema.quickEntities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onQuickEntityInsert(item)}
                className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {config.inspectorSchema.tipsCard ? (
        <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
          {config.inspectorSchema.tipsCard}
        </div>
      ) : null}
    </div>
  )
})
FeatureStructureInspectorBody.displayName = "FeatureStructureInspectorBody"

export const FeatureStructureRightPanel = React.memo(function FeatureStructureRightPanel({
  collapsed,
  width,
  config,
  fieldValues,
  onFieldValueChange,
  onResetFields,
  onStartResize,
  onQuickEntityInsert,
}: FeatureStructureRightPanelProps) {
  return (
    <aside
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-lg bg-card xl:shadow-sm",
        collapsed
          ? "hidden xl:pointer-events-none xl:flex xl:w-0 xl:min-w-0"
          : "min-h-[260px] border border-border xl:min-h-0 xl:w-[var(--inspector-width)]"
      )}
      style={
        {
          "--inspector-width": `${width}px`,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        onPointerDown={onStartResize}
        className="absolute -left-1.5 top-0 hidden h-full w-3 cursor-col-resize xl:block"
        aria-label="调整右侧面板宽度"
      />

      <div className="flex h-11 items-center justify-between border-b border-border px-2">
        <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
          INSPECTOR
        </span>
        <button
          type="button"
          onClick={onResetFields}
          className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          恢复默认
        </button>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden transition-opacity duration-150",
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        aria-hidden={collapsed}
      >
        <div className="tools-scrollbar h-full min-h-0 overflow-y-auto overscroll-contain">
          <FeatureStructureInspectorBody
            config={config}
            fieldValues={fieldValues}
            onFieldValueChange={onFieldValueChange}
            onQuickEntityInsert={onQuickEntityInsert}
          />
        </div>
      </div>
    </aside>
  )
})
FeatureStructureRightPanel.displayName = "FeatureStructureRightPanel"
