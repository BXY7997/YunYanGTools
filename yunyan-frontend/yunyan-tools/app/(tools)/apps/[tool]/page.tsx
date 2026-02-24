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
