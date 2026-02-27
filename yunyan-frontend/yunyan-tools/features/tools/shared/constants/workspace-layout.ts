import { toolsLayoutTokens } from "@/features/tools/shared/constants/tools-layout-tokens"

export const toolsWorkspaceLayout = {
  main:
    "tools-word-theme tools-paper-bg relative min-h-[calc(100vh-54px)] overflow-hidden rounded-2xl",
  container: toolsLayoutTokens.workspace.containerClass,
  surfaceSection: toolsLayoutTokens.workspace.sectionClass,
  footer: toolsLayoutTokens.workspace.footerClass,
  footerContent: toolsLayoutTokens.workspace.footerContentClass,
  footerSection: "space-y-3",
  footerTitle: "text-xl font-semibold leading-tight text-foreground",
  footerBody: "text-sm leading-6 text-muted-foreground",
  footerList:
    "list-inside list-decimal space-y-2 text-sm leading-6 text-muted-foreground",
  footerFaqGrid:
    "grid grid-cols-1 gap-4 md:grid-cols-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:leading-6 [&_h3]:text-foreground [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted-foreground/95",
  footerKeywords: "text-xs leading-6 text-muted-foreground",
} as const
