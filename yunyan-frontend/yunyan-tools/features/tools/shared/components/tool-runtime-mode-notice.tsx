import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

type ToolRuntimeModeNoticeTone = "sky" | "violet" | "orange" | "emerald" | "slate"

interface ToolRuntimeModeNoticeChip {
  label: string
  tone?: ToolRuntimeModeNoticeTone
}

interface ToolRuntimeModeNoticeProps {
  text: string
  chips?: ToolRuntimeModeNoticeChip[]
  className?: string
}

const chipToneClassMap: Record<ToolRuntimeModeNoticeTone, string> = {
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  slate: "border-border bg-background text-muted-foreground",
}

export function ToolRuntimeModeNotice({
  text,
  chips = [],
  className,
}: ToolRuntimeModeNoticeProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Star className="size-3.5 text-sky-500" />
        <span>{text}</span>
      </p>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={cn(
                "rounded-full border px-2 py-0.5",
                chipToneClassMap[chip.tone || "slate"]
              )}
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
