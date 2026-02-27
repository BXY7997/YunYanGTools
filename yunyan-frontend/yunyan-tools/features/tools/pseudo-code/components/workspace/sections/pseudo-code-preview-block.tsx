import { cn } from "@/lib/utils"
import type { PseudoCodeDocument } from "@/features/tools/pseudo-code/types/pseudo-code"

interface PreviewCodeBlockProps {
  document: PseudoCodeDocument
  markup: string
  error: string
  rendering: boolean
  className?: string
}

export function PreviewCodeBlock({
  document,
  markup,
  error,
  rendering,
  className,
}: PreviewCodeBlockProps) {
  if (error) {
    return (
      <div className={cn("flex min-h-72 flex-col gap-2", className)}>
        <p className="text-xs text-destructive">{error}</p>
        <pre className="tools-scrollbar max-h-[62vh] min-h-0 flex-1 overflow-auto rounded-xl border border-border/70 bg-background px-3 py-2 text-xs leading-6 text-muted-foreground">
          {document.source}
        </pre>
      </div>
    )
  }

  if (!markup.trim()) {
    return (
      <div
        className={cn(
          "flex min-h-[22rem] items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/70 px-3 py-8 text-center text-xs text-muted-foreground",
          className
        )}
      >
        {rendering ? "渲染中..." : "暂无可预览内容"}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "tools-pseudocode-preview tools-scrollbar max-h-[62vh] min-h-[22rem] overflow-auto rounded-xl border border-border/70 p-3 transition-opacity duration-150 ease-out",
        rendering ? "opacity-70" : "opacity-100",
        document.renderConfig.theme === "contrast"
          ? "tools-pseudocode-preview--contrast bg-slate-950 text-slate-100"
          : "tools-pseudocode-preview--paper bg-background text-foreground",
        className
      )}
      aria-label="伪代码渲染预览"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

