import type { SqlToTablePaperTemplateId } from "@/features/tools/sql-to-table/types/sql-to-table"

export interface SqlToTablePaperTemplateOption {
  value: SqlToTablePaperTemplateId
  label: string
  description: string
}

export interface SqlToTablePaperTemplateSpec {
  title: string
  topRulePt: number
  midRulePt: number
  bottomRulePt: number
  normalBorderPt: number
  rowHeightCm: number
  bodyCellFallback: string
  captionMarginTopPt: number
  captionMarginBottomPt: number
  headerNoWrap: boolean
}

export const sqlToTablePaperTemplateOptions: SqlToTablePaperTemplateOption[] = [
  {
    value: "cyt170-standard",
    label: "期刊规范（CY/T 170）",
    description: "中线0.5磅，推荐用于规范论文与期刊稿件。",
  },
  {
    value: "thesis-classic",
    label: "高校论文（经典）",
    description: "中线0.75磅，兼容多数毕业设计模板。",
  },
]

export const sqlToTableDefaultPaperTemplateId: SqlToTablePaperTemplateId =
  "cyt170-standard"

export const sqlToTablePaperTemplateSpecs: Record<
  SqlToTablePaperTemplateId,
  SqlToTablePaperTemplateSpec
> = {
  "cyt170-standard": {
    title: "期刊规范（CY/T 170）",
    topRulePt: 1.5,
    midRulePt: 0.5,
    bottomRulePt: 1.5,
    normalBorderPt: 1,
    rowHeightCm: 0.6,
    bodyCellFallback: "—",
    captionMarginTopPt: 12,
    captionMarginBottomPt: 6,
    headerNoWrap: true,
  },
  "thesis-classic": {
    title: "高校论文（经典）",
    topRulePt: 1.5,
    midRulePt: 0.75,
    bottomRulePt: 1.5,
    normalBorderPt: 1,
    rowHeightCm: 0.6,
    bodyCellFallback: "空白",
    captionMarginTopPt: 12,
    captionMarginBottomPt: 6,
    headerNoWrap: true,
  },
}

