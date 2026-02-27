import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"

import { ToolIcon } from "@/components/tools/tool-icon"
import { Button } from "@/components/ui/button"
import type { FilesRecord } from "@/features/tools/files/types/files"
import { cn } from "@/lib/utils"

interface FilesTableSectionProps {
  records: FilesRecord[]
  loading: boolean
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  formatDateTime: (value: string) => string
  onView: (record: FilesRecord) => void
  onEdit: (record: FilesRecord) => void
  onDelete: (record: FilesRecord) => void
  onPageSizeChange: (nextSize: number) => void
  onGoFirstPage: () => void
  onGoPrevPage: () => void
  onGoNextPage: () => void
  onGoLastPage: () => void
  className?: string
}

export function FilesTableSection({
  records,
  loading,
  currentPage,
  totalPages,
  total,
  pageSize,
  formatDateTime,
  onView,
  onEdit,
  onDelete,
  onPageSizeChange,
  onGoFirstPage,
  onGoPrevPage,
  onGoNextPage,
  onGoLastPage,
  className,
}: FilesTableSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <header>
        <h2 className="text-lg font-semibold text-foreground">文件列表</h2>
        <p className="text-xs text-muted-foreground">管理历史生成记录，支持查看、编辑与删除。</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
        <div
          className={cn(
            "tools-scrollbar max-h-[520px] min-h-[320px] overflow-auto transition-opacity duration-200 ease-out",
            loading ? "opacity-75" : "opacity-100"
          )}
        >
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-muted/30 text-xs text-muted-foreground">
              <tr className="[&_th]:h-10 [&_th]:px-3 [&_th]:font-medium">
                <th>封面</th>
                <th>名称</th>
                <th>描述</th>
                <th>类型</th>
                <th>创建时间</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-b-0">
              {loading ? (
                <tr className="border-b border-border/60">
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    加载中...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="border-b border-border/60">
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    暂无数据
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-border/60 align-top text-xs text-foreground">
                    <td className="px-3 py-2">
                      <div className="flex size-12 items-center justify-center rounded-md border border-border/70 bg-muted/25">
                        <ToolIcon name={record.iconName} className="size-5 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <p className="line-clamp-2 text-sm font-medium text-foreground">{record.name}</p>
                      <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{record.summary}</p>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{record.description}</td>
                    <td className="whitespace-nowrap px-3 py-2">{record.toolLabel}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {formatDateTime(record.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {formatDateTime(record.updatedAt)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onView(record)}
                          className="tools-word-button-transition h-8 px-2 text-muted-foreground"
                          aria-label="查看"
                          title="查看"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(record)}
                          className="tools-word-button-transition h-8 px-2 text-muted-foreground"
                          aria-label="编辑"
                          title="编辑"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(record)}
                          className="tools-word-button-transition h-8 px-2 text-muted-foreground"
                          aria-label="删除"
                          title="删除"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>每页显示</span>
            <select
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
            <span>条记录</span>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-foreground">
              第 {currentPage} 页，共 {totalPages} 页（共 {total} 条）
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onGoFirstPage}
                disabled={currentPage <= 1}
                className="tools-word-button-transition size-7 px-0 text-muted-foreground"
                aria-label="首页"
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onGoPrevPage}
                disabled={currentPage <= 1}
                className="tools-word-button-transition size-7 px-0 text-muted-foreground"
                aria-label="上一页"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onGoNextPage}
                disabled={currentPage >= totalPages}
                className="tools-word-button-transition size-7 px-0 text-muted-foreground"
                aria-label="下一页"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onGoLastPage}
                disabled={currentPage >= totalPages}
                className="tools-word-button-transition size-7 px-0 text-muted-foreground"
                aria-label="末页"
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
