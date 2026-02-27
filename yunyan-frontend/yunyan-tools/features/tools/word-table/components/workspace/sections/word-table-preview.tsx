import * as React from "react"

import { cn } from "@/lib/utils"
import {
  buildTableCaption,
  toolsWordCaptionRules,
} from "@/features/tools/shared/constants/word-caption-config"
import { buildWordTableColumnWidths } from "@/features/tools/word-table/constants/word-table-layout"
import {
  getWordTableColumnCount,
} from "@/features/tools/word-table/services/word-table-model"
import type { WordCellAlignmentMode } from "@/features/tools/shared/types/word-export"
import type {
  WordTableDocument,
  WordTableBorderSides,
} from "@/features/tools/word-table/types/word-table"

const borderSideKeys = [
  { key: "top", label: "上" },
  { key: "right", label: "右" },
  { key: "bottom", label: "下" },
  { key: "left", label: "左" },
] as const

export function clampInteger(
  value: number,
  min: number,
  max: number,
  fallback: number
) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  const rounded = Math.round(value)
  return Math.min(Math.max(rounded, min), max)
}

export function clampBorderWidth(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.min(Math.max(Number(value.toFixed(2)), 0), 6)
}

function toPreviewBorder(value: number) {
  return value > 0 ? `${value}pt solid #0f172a` : "none"
}

function buildCellStyle(border: WordTableBorderSides): React.CSSProperties {
  return {
    borderTop: toPreviewBorder(border.top),
    borderRight: toPreviewBorder(border.right),
    borderBottom: toPreviewBorder(border.bottom),
    borderLeft: toPreviewBorder(border.left),
  }
}

export function countFilledCells(document: WordTableDocument) {
  return document.rows.reduce((total, row) => {
    return (
      total +
      row.reduce((rowTotal, cell) => {
        return rowTotal + (cell.trim() ? 1 : 0)
      }, 0)
    )
  }, 0)
}

export function sumBorder(border: WordTableBorderSides) {
  return Number((border.top + border.right + border.bottom + border.left).toFixed(2))
}

export function BorderEditorCard({
  title,
  hint,
  border,
  onUpdate,
}: {
  title: string
  hint: string
  border: WordTableBorderSides
  onUpdate: (side: keyof WordTableBorderSides, value: number) => void
}) {
  return (
    <article className="rounded-md border border-border/70 bg-background/40 p-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {borderSideKeys.map((side) => (
          <label key={side.key} className="space-y-1 text-xs">
            <span className="text-muted-foreground">{side.label}边框 (pt)</span>
            <input
              type="number"
              min={0}
              max={6}
              step={0.25}
              value={border[side.key]}
              onChange={(event) => {
                onUpdate(
                  side.key,
                  clampBorderWidth(Number(event.target.value), border[side.key])
                )
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>
        ))}
      </div>
    </article>
  )
}

export function WordTablePreview({
  document,
  alignmentMode,
}: {
  document: WordTableDocument
  alignmentMode: WordCellAlignmentMode
}) {
  const columnCount = getWordTableColumnCount(document)
  const columnWidths = buildWordTableColumnWidths(columnCount)
  const caption = buildTableCaption({
    serial: toolsWordCaptionRules.wordTable.mainSerial,
    title: document.title,
  })
  const minWidth = Math.max(640, columnCount * 140)

  return (
    <div className="tools-word-table-shell overflow-x-auto rounded-md p-3 shadow-sm">
      <div className="mx-auto space-y-3" style={{ minWidth, width: "100%" }}>
        <p className="text-center text-[13px] font-semibold leading-5 text-foreground">
          {caption}
        </p>

        <table className="w-full border-collapse text-[12px] leading-snug text-foreground [table-layout:fixed]">
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={`preview-col-${index}`} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {document.headers.map((header, index) => (
                <th
                  key={`header-${index}`}
                  style={buildCellStyle(document.borderProfile.header)}
                  className="px-2 py-1.5 text-center font-semibold leading-5"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {document.rows.map((row, rowIndex) => {
              const isLast = rowIndex === document.rows.length - 1
              const border = isLast
                ? document.borderProfile.lastRow
                : document.borderProfile.body

              return (
                <tr key={`row-${rowIndex}`}>
                  {document.headers.map((_, columnIndex) => (
                    <td
                      key={`cell-${rowIndex}-${columnIndex}`}
                      style={buildCellStyle(border)}
                      className={cn(
                        "px-2 py-1.5 leading-5 [overflow-wrap:anywhere]",
                        alignmentMode === "all-center"
                          ? "text-center align-middle"
                          : "text-left align-top"
                      )}
                    >
                      {row[columnIndex] || ""}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

