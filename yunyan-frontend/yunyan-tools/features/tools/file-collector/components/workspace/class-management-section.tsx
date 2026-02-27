/* eslint-disable tailwindcss/classnames-order */

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  Trash2,
  UserCog,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { IconActionButton } from "@/features/tools/file-collector/components/workspace/icon-action-button"
import type { ClassRecord } from "@/features/tools/file-collector/components/workspace/types"

interface ClassManagementSectionProps {
  pagedClassRows: ClassRecord[]
  currentPage: number
  totalPages: number
  pageSize: number
  onPageSizeChange: (size: number) => void
  onGoFirstPage: () => void
  onGoPrevPage: () => void
  onGoNextPage: () => void
  onGoLastPage: () => void
  onAddClass: () => void
  onEditClass: (item: ClassRecord) => void
  onAskDeleteClass: (item: ClassRecord) => void
  onOpenStudentDialog: (classId: string) => void
  formatDateTime: (value: string) => string
}

export function ClassManagementSection({
  pagedClassRows,
  currentPage,
  totalPages,
  pageSize,
  onPageSizeChange,
  onGoFirstPage,
  onGoPrevPage,
  onGoNextPage,
  onGoLastPage,
  onAddClass,
  onEditClass,
  onAskDeleteClass,
  onOpenStudentDialog,
  formatDateTime,
}: ClassManagementSectionProps) {
  return (
    <section className="flex flex-col gap-6 rounded-xl border bg-card py-6 shadow-sm">
      <header className="px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-none text-foreground">班级列表</h2>
            <p className="text-sm text-muted-foreground">管理学校的所有班级信息</p>
          </div>
          <Button type="button" onClick={onAddClass} size="sm" className="h-9 gap-2">
            <Plus className="size-4" />
            添加班级
          </Button>
        </div>
      </header>

      <div className="px-6">
        <div className="overflow-hidden rounded-md border">
          <div className="relative w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    班级名称
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    创建时间
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    更新时间
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {pagedClassRows.length > 0 ? (
                  pagedClassRows.map((item) => (
                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-2 align-middle font-medium whitespace-nowrap text-foreground">
                        {item.className}
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">
                        {formatDateTime(item.updatedAt)}
                      </td>
                      <td className="p-2 align-middle">
                        <div className="flex flex-wrap justify-end gap-2">
                          <IconActionButton title="编辑班级" onClick={() => onEditClass(item)}>
                            <Pencil className="size-3.5" />
                          </IconActionButton>
                          <IconActionButton title="删除班级" onClick={() => onAskDeleteClass(item)}>
                            <Trash2 className="size-3.5" />
                          </IconActionButton>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenStudentDialog(item.id)}
                            className="h-8 gap-1.5 px-2.5"
                          >
                            <UserCog className="size-3.5" />
                            学生管理
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenStudentDialog(item.id)}
                            className="h-8 gap-1.5 px-2.5"
                          >
                            <UserPlus className="size-3.5" />
                            导入学生
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      暂无班级数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>每页显示</span>
          <label className="relative inline-flex items-center">
            <select
              aria-label="每页显示记录数"
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 w-[88px] appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" />
          </label>
          <span>条记录</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="flex w-[100px] items-center justify-center text-sm font-medium text-foreground">
            {`第 ${Math.min(currentPage, totalPages)} 页，共 ${totalPages} 页`}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="首页"
              onClick={onGoFirstPage}
              disabled={currentPage <= 1}
              className="size-8 px-0"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="上一页"
              onClick={onGoPrevPage}
              disabled={currentPage <= 1}
              className="size-8 px-0"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="下一页"
              onClick={onGoNextPage}
              disabled={currentPage >= totalPages}
              className="size-8 px-0"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="末页"
              onClick={onGoLastPage}
              disabled={currentPage >= totalPages}
              className="size-8 px-0"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
