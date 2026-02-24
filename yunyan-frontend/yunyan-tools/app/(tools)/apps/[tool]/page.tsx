import { notFound, redirect } from "next/navigation"

import {
  getToolByRoute,
  getToolGroupByChildId,
  getWorkspaceConfigForTool,
} from "@/config/tools-registry"
import {
  FormWorkspace,
  LandingWorkspace,
  WorkspaceShell,
} from "@/components/tools/workspace-shell"
import { SqlToTableWorkspace } from "@/features/tools/sql-to-table"
import { TestDocWorkspace } from "@/features/tools/test-doc"
import { UseCaseDocWorkspace } from "@/features/tools/use-case-doc"
import { WordTableWorkspace } from "@/features/tools/word-table"
import { AigcCheckWorkspace } from "@/features/tools/aigc-check"
import { AigcReduceWorkspace } from "@/features/tools/aigc-reduce"
import { PaperRewriteWorkspace } from "@/features/tools/paper-rewrite"
import { PseudoCodeWorkspace } from "@/features/tools/pseudo-code"

interface ToolDetailPageProps {
  params: Promise<{
    tool: string
  }>
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { tool: toolId } = await params
  const route = `/apps/${toolId}`
  const tool = getToolByRoute(route)

  if (!tool) {
    notFound()
  }

  const group = getToolGroupByChildId(tool.id)
  const config = getWorkspaceConfigForTool(tool)

  if (tool.id === "hx-huitu") {
    redirect("/canvas")
  }

  if (tool.id === "sql-to-table") {
    return <SqlToTableWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.id === "use-case-doc") {
    return <UseCaseDocWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.id === "test-doc") {
    return <TestDocWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.id === "word-table") {
    return <WordTableWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.id === "aigc-check") {
    return <AigcCheckWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.id === "aigc-reduce") {
    return <AigcReduceWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.id === "paper-rewrite") {
    return <PaperRewriteWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.id === "pseudo-code") {
    return <PseudoCodeWorkspace tool={tool} groupTitle={group?.title} />
  }

  if (tool.workspaceType === "canvas") {
    return (
      <WorkspaceShell
        routeKey={tool.id}
        tool={tool}
        groupTitle={group?.title}
        config={config}
      />
    )
  }

  if (tool.workspaceType === "form") {
    return <FormWorkspace tool={tool} groupTitle={group?.title} config={config} />
  }

  return <LandingWorkspace tool={tool} groupTitle={group?.title} />
}
