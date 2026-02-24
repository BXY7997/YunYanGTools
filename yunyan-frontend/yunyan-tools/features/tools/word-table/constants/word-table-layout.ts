import type { WordTableDocument } from "@/features/tools/word-table/types/word-table"

export function shouldUseLandscapeForWordTable(document: WordTableDocument) {
  const columnCount = document.headers.length
  const longestHeader = document.headers.reduce(
    (max, header) => Math.max(max, header.trim().length),
    0
  )
  const longestCell = document.rows.reduce((rowMax, row) => {
    const cellMax = row.reduce((cellLongest, cell) => {
      return Math.max(cellLongest, cell.trim().length)
    }, 0)
    return Math.max(rowMax, cellMax)
  }, 0)

  if (columnCount >= 8) {
    return true
  }

  if (columnCount >= 6 && (longestHeader > 10 || longestCell > 20)) {
    return true
  }

  return false
}

export function buildWordTableColumnWidths(columnCount: number) {
  if (columnCount <= 0) {
    return ["100%"]
  }

  const width = 100 / columnCount
  return Array.from({ length: columnCount }, () => `${width.toFixed(3)}%`)
}
