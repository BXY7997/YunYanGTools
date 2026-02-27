import type { ComponentType } from "react"
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
import { CoverCardWorkspace } from "@/features/tools/cover-card"
import { CodeRunnerWorkspace } from "@/features/tools/code-runner"
import { FileCollectorWorkspace } from "@/features/tools/file-collector"
import { FilesWorkspace } from "@/features/tools/files"
import { MemberWorkspace } from "@/features/tools/member"
import { WalletWorkspace } from "@/features/tools/wallet"
import { ErDiagramWorkspace } from "@/features/tools/er-diagram"
import { FeatureStructureWorkspace } from "@/features/tools/feature-structure"
import { SoftwareEngineeringWorkspace } from "@/features/tools/software-engineering"
import { ArchitectureDiagramWorkspace } from "@/features/tools/architecture-diagram"
import { MindMapWorkspace } from "@/features/tools/mind-map"
import {
  parseFilesKeywordParam,
  parseFilesStorageParam,
  parseFilesToolFilterParam,
} from "@/features/tools/files/constants/files-route"
import {
  buildWalletRouteWithParams,
  parseWalletQuickPanelParam,
  parseWalletWorkspaceViewParam,
} from "@/features/tools/wallet/constants/wallet-route"
import type { ToolMenuLinkItem } from "@/types/tools"

type SpecializedWorkspaceProps = {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

const specializedFormWorkspaceByToolId: Record<
  string,
  ComponentType<SpecializedWorkspaceProps>
> = {
  "sql-to-table": SqlToTableWorkspace,
  "use-case-doc": UseCaseDocWorkspace,
  "test-doc": TestDocWorkspace,
  "word-table": WordTableWorkspace,
  "aigc-check": AigcCheckWorkspace,
  "aigc-reduce": AigcReduceWorkspace,
  "paper-rewrite": PaperRewriteWorkspace,
  "pseudo-code": PseudoCodeWorkspace,
  "code-runner": CodeRunnerWorkspace,
  "cover-card": CoverCardWorkspace,
  "file-collector": FileCollectorWorkspace,
  "wallet": WalletWorkspace,
  "member": MemberWorkspace,
  "er-diagram": ErDiagramWorkspace,
  "feature-structure": FeatureStructureWorkspace,
  "software-engineering": SoftwareEngineeringWorkspace,
  "architecture-diagram": ArchitectureDiagramWorkspace,
  "mind-map": MindMapWorkspace,
}

interface ToolDetailPageProps {
  params: Promise<{
    tool: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ToolDetailPage({
  params,
  searchParams,
}: ToolDetailPageProps) {
  const { tool: toolId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
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

  if (tool.id === "profile") {
    redirect(
      buildWalletRouteWithParams({
        view: "overview",
        panel: "account",
      })
    )
  }

  const walletInitialView =
    tool.id === "wallet"
      ? parseWalletWorkspaceViewParam(resolvedSearchParams.view)
      : null
  const walletInitialPanel =
    tool.id === "wallet"
      ? parseWalletQuickPanelParam(resolvedSearchParams.panel)
      : null
  const filesInitialStorage =
    tool.id === "files"
      ? parseFilesStorageParam(resolvedSearchParams.storage)
      : null
  const filesInitialFilter =
    tool.id === "files"
      ? parseFilesToolFilterParam(resolvedSearchParams.type)
      : null
  const filesInitialKeyword =
    tool.id === "files"
      ? parseFilesKeywordParam(resolvedSearchParams.q)
      : null

  if (tool.id === "wallet") {
    return (
      <WalletWorkspace
        tool={tool}
        groupTitle={group?.title}
        initialView={walletInitialView || undefined}
        initialQuickPanelId={walletInitialPanel || undefined}
      />
    )
  }

  if (tool.id === "files") {
    return (
      <FilesWorkspace
        tool={tool}
        groupTitle={group?.title}
        initialStorage={filesInitialStorage || undefined}
        initialToolFilter={filesInitialFilter || undefined}
        initialKeyword={filesInitialKeyword || undefined}
      />
    )
  }

  const SpecializedWorkspace = specializedFormWorkspaceByToolId[tool.id]
  if (SpecializedWorkspace) {
    return <SpecializedWorkspace tool={tool} groupTitle={group?.title} />
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
