import { RefreshCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { filesToolFilterItems } from "@/features/tools/files/constants/files-config"
import type { FilesToolFilter } from "@/features/tools/files/types/files"
import { cn } from "@/lib/utils"

interface FilesToolbarProps {
  keyword: string
  toolFilter: FilesToolFilter
  loading: boolean
  onKeywordChange: (value: string) => void
  onToolFilterChange: (value: FilesToolFilter) => void
  onRefresh: () => void
  className?: string
}

export function FilesToolbar({
  keyword,
  toolFilter,
  loading,
  onKeywordChange,
  onToolFilterChange,
  onRefresh,
  className,
}: FilesToolbarProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="搜索文件名称、描述或摘要..."
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-ring"
          />
        </label>

        <select
          value={toolFilter}
          onChange={(event) => onToolFilterChange(event.target.value as FilesToolFilter)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring"
        >
          {filesToolFilterItems.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="tools-word-button-transition h-10 px-3"
        >
          <RefreshCcw className={cn("mr-1.5 size-4", loading && "animate-spin")} />
          刷新数据
        </Button>
      </div>
    </section>
  )
}
