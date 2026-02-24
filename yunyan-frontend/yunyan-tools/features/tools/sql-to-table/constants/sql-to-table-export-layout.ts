import type { ExportColumnKey } from "@/features/tools/sql-to-table/types/sql-to-table"
import type { WordCellAlignmentMode } from "@/features/tools/shared/types/word-export"

export interface SqlToTableColumnLayoutSpec {
  width: string
  align: "left" | "center"
  noWrap?: boolean
  wordBreak?: "break-word" | "keep-all"
}

export const sqlToTableColumnLayoutMap: Record<
  ExportColumnKey,
  SqlToTableColumnLayoutSpec
> = {
  index: {
    width: "8%",
    align: "center",
    noWrap: true,
    wordBreak: "keep-all",
  },
  name: {
    width: "19%",
    align: "left",
    wordBreak: "break-word",
  },
  type: {
    width: "16%",
    align: "center",
    noWrap: true,
    wordBreak: "keep-all",
  },
  length: {
    width: "10%",
    align: "center",
    noWrap: true,
    wordBreak: "keep-all",
  },
  primary: {
    width: "8%",
    align: "center",
    noWrap: true,
    wordBreak: "keep-all",
  },
  constraint: {
    width: "17%",
    align: "left",
    wordBreak: "break-word",
  },
  remark: {
    width: "22%",
    align: "left",
    wordBreak: "break-word",
  },
}

export function resolveSqlToTableColumnLayout(
  column: ExportColumnKey,
  alignmentMode: WordCellAlignmentMode
) {
  const base = sqlToTableColumnLayoutMap[column]
  if (alignmentMode === "all-center") {
    return {
      ...base,
      align: "center" as const,
    }
  }
  return base
}

export function resolveSqlToTablePreviewCellAlign(
  column: ExportColumnKey,
  alignmentMode: WordCellAlignmentMode
) {
  return resolveSqlToTableColumnLayout(column, alignmentMode).align
}
