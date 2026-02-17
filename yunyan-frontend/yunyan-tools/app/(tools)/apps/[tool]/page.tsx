import { notFound } from "next/navigation"

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
  params: {
    tool: string
  }
}

export default function ToolDetailPage({ params }: ToolDetailPageProps) {
  const route = `/apps/${params.tool}`
  const tool = getToolByRoute(route)

  if (!tool) {
    notFound()
  }

  const group = getToolGroupByChildId(tool.id)
  const config = getWorkspaceConfigForTool(tool)

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
