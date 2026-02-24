export type SqlToTableMode = "sql" | "ai"

export type ExportTableFormat = "normal" | "three-line"

export type TypeCaseMode = "upper" | "lower"

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
}

export interface SqlToTableExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
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
