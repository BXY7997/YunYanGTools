/* eslint-disable tailwindcss/classnames-order */

import {
  Copy,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"

import { IconActionButton } from "@/features/tools/file-collector/components/workspace/icon-action-button"
import type {
  CollectionRecord,
  NoticeState,
} from "@/features/tools/file-collector/components/workspace/types"
import { cn } from "@/lib/utils"

interface CollectionManagementSectionProps {
  classRowsLength: number
  collections: CollectionRecord[]
  togglingCollectionId: string | null
  notice: NoticeState
  onOpenCollectionDialog: () => void
  onCopyCollectionLink: (item: CollectionRecord) => void
  onToggleCollectionStatus: (item: CollectionRecord) => void
  onAskDeleteCollection: (item: CollectionRecord) => void
  formatDateTime: (value: string) => string
}

export function CollectionManagementSection({
  classRowsLength,
  collections,
  togglingCollectionId,
  notice,
  onOpenCollectionDialog,
  onCopyCollectionLink,
  onToggleCollectionStatus,
  onAskDeleteCollection,
  formatDateTime,
}: CollectionManagementSectionProps) {
  return (
    <section className="flex flex-col gap-6 rounded-xl border bg-card py-6 shadow-sm">
      <header className="px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-none text-foreground">收集管理</h2>
            <p className="text-sm text-muted-foreground">管理学校的所有收集信息</p>
          </div>
          <button
            type="button"
            onClick={onOpenCollectionDialog}
            disabled={classRowsLength === 0}
            className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="size-4" />
            添加收集
          </button>
        </div>
      </header>

      <div className="px-6">
        <div className="overflow-hidden rounded-md border">
          <div className="relative w-full overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">收集名称</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">班级</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">文件格式</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">文件大小限制</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">需要姓名</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">需要文件</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">截止时间</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">创建时间</th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {collections.length > 0 ? (
                  collections.map((item) => (
                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-2 align-middle font-medium whitespace-nowrap text-foreground">
                        {item.collectionName}
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">{item.className}</td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">{item.fileFormats}</td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">{item.maxFileSizeMb}MB</td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">{item.requireName ? "是" : "否"}</td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">{item.requireFile ? "是" : "否"}</td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">{formatDateTime(item.deadline)}</td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">{formatDateTime(item.createdAt)}</td>
                      <td className="p-2 align-middle">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onCopyCollectionLink(item)}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                          >
                            <Copy className="size-3.5" />
                            复制链接
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleCollectionStatus(item)}
                            disabled={togglingCollectionId === item.id}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-60"
                          >
                            {togglingCollectionId === item.id ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                处理中
                              </>
                            ) : item.status === "collecting" ? (
                              "收集中"
                            ) : (
                              "已结束"
                            )}
                          </button>
                          <IconActionButton title="删除收集" onClick={() => onAskDeleteCollection(item)}>
                            <Trash2 className="size-3.5" />
                          </IconActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="min-h-5 px-6 text-xs">
        <span
          className={cn(
            notice.tone === "error"
              ? "text-destructive"
              : notice.tone === "success"
                ? "text-emerald-700"
                : "text-muted-foreground"
          )}
        >
          {notice.text}
        </span>
      </div>
    </section>
  )
}
