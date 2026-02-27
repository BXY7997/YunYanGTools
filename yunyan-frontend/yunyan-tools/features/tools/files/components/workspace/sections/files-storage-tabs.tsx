import { Cloud, HardDrive } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { filesStorageNoticeMap, filesStorageTabItems } from "@/features/tools/files/constants/files-config"
import type { FilesQuotaSummary, FilesStorageMode } from "@/features/tools/files/types/files"
import { cn } from "@/lib/utils"

interface FilesStorageTabsProps {
  storage: FilesStorageMode
  quota: FilesQuotaSummary | null
  onStorageChange: (value: FilesStorageMode) => void
  className?: string
}

export function FilesStorageTabs({
  storage,
  quota,
  onStorageChange,
  className,
}: FilesStorageTabsProps) {
  const cloudQuota = quota || { used: 0, limit: 0, ratio: 0 }
  const quotaLabel =
    storage === "cloud"
      ? `${cloudQuota.used}/${cloudQuota.limit}（${cloudQuota.ratio}%）`
      : "本地模式不占用云端配额"

  return (
    <section className={cn("space-y-3", className)}>
      <Tabs
        value={storage}
        onValueChange={(value) => onStorageChange(value as FilesStorageMode)}
      >
        <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg p-1">
          {filesStorageTabItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="tools-word-button-transition h-full cursor-pointer rounded-md px-3 py-0 text-sm font-medium leading-none"
            >
              {item.value === "local" ? <HardDrive className="size-3.5" /> : <Cloud className="size-3.5" />}
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
        <p>{filesStorageNoticeMap[storage]}</p>
      </div>

      <div className="space-y-2 rounded-lg border border-border/70 bg-background px-3 py-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>云端存储进度</span>
          <span>{quotaLabel}</span>
        </div>
        <Progress
          value={storage === "cloud" ? cloudQuota.ratio : 0}
          className={cn(
            "h-2 transition-opacity duration-200 ease-out",
            storage === "cloud" ? "opacity-100" : "opacity-45"
          )}
        />
      </div>
    </section>
  )
}
