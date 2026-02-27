import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export type SqlToTableMode = "sql" | "ai"

export type ExportTableFormat = "normal" | "three-line"

export type TypeCaseMode = "upper" | "lower"

export type SqlToTablePaperTemplateId =
  | "cyt170-standard"
  | "thesis-classic"

export type ExportColumnKey =
  | "index"
  | "name"
  | "type"
  | "length"
  | "primary"
  | "constraint"
  | "remark"

export interface SqlTableColumn {
  id: string
  name: string
  type: string
  length?: string
  isPrimary: boolean
  constraint?: string
  remark?: string
  rawDefinition?: string
}

export interface SqlTableSchema {
  id: string
  name: string
  displayName: string
  comment?: string
  columns: SqlTableColumn[]
}

export interface SqlToTableGenerateRequest {
  mode: SqlToTableMode
  input: string
  typeCase: TypeCaseMode
}

export interface SqlToTableGenerateResponse {
  tables: SqlTableSchema[]
  source: "local" | "remote"
  message?: string
}

export interface SqlToTableExportRequest {
  tables: SqlTableSchema[]
  format: ExportTableFormat
  typeCase: TypeCaseMode
  includeColumns: ExportColumnKey[]
  captionChapterSerial?: string
  paperTemplateId: SqlToTablePaperTemplateId
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export interface SqlToTableExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat?: "doc"
  message?: string
}

export interface SqlToTablePreviewRow {
  index: number
  name: string
  type: string
  length: string
  primary: string
  constraint: string
  remark: string
}
