"use client"

/* eslint-disable tailwindcss/classnames-order */

import {
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolSectionHeading,
  ToolWorkspaceHero,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  DiagramCanvasSection,
  DiagramConfigSection,
  DiagramFooterSection,
  DiagramInputSection,
  DiagramToolbarSection,
} from "@/features/tools/shared/diagram/components/workspace/sections"
import { useDiagramWorkspaceState } from "@/features/tools/shared/diagram/components/workspace/hooks"
import type {
  DiagramToolPreset,
} from "@/features/tools/shared/diagram/types/diagram"
import type { ToolMenuLinkItem } from "@/types/tools"

interface DiagramWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
  preset?: DiagramToolPreset
}

export function DiagramWorkspace({ tool, groupTitle, preset }: DiagramWorkspaceProps) {
  const state = useDiagramWorkspaceState({ tool, groupTitle, preset })

  return (
    <ToolWorkspaceShell
      className="bg-transparent [background-image:none]"
      contentClassName="w-full max-w-none space-y-4 px-2 py-2 md:px-2 lg:px-2"
      showRightGrid={false}
    >
      <ToolWorkspaceHero
        title={state.preset.title}
        subtitle={state.preset.subtitle}
        description="统一工作台支持输入、生成、排版、导出闭环，并已预留后端接口接入位置。"
        tags={["在线绘图", "本地闭环", "后端可扩展"]}
      />

      <DiagramToolbarSection
        subtitle="支持 AI 文本转图与手动结构编辑，默认本地模拟生成。"
        runtimeSource={state.runtimeSource}
        renderConfig={state.renderConfig}
      />

      <ToolNoticeSlot tone={state.notice.tone} text={state.notice.text} />

      <section className="tools-soft-surface rounded-2xl p-4 md:p-5">
        <ToolSectionHeading
          title="结构绘图工作区"
          description="左侧输入结构，中间查看图形结果，右侧调整排版并导出。"
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.5fr)_minmax(260px,0.72fr)]">
          <DiagramInputSection
            mode={state.inputMode}
            onModeChange={state.setInputMode}
            inputValue={state.inputValue}
            onInputChange={state.setInputValue}
            aiPlaceholder={state.preset.aiPlaceholder}
            manualPlaceholder={state.preset.manualPlaceholder}
            chips={state.preset.chips}
            onApplyTemplate={state.applyTemplate}
            onGenerate={() => void state.generateDiagram()}
            generating={state.loadingState === "generate"}
          />

          <DiagramCanvasSection
            document={state.document}
            renderConfig={state.renderConfig}
            tone={state.preset.surfaceTone}
            generating={state.loadingState === "generate"}
            syncing={state.syncing}
            cloudSyncEnabled={state.cloudSyncEnabled}
            onCloudSyncEnabledChange={state.setCloudSyncEnabled}
          />

          <DiagramConfigSection
            renderConfig={state.renderConfig}
            onConfigChange={state.updateRenderConfig}
            onReset={state.resetConfig}
            onExportSvg={() => void state.handleExport("svg")}
            onExportPng={() => void state.handleExport("png")}
            exporting={state.loadingState === "export"}
          />
        </div>
      </section>

      <DiagramFooterSection title={state.preset.title} />
    </ToolWorkspaceShell>
  )
}
