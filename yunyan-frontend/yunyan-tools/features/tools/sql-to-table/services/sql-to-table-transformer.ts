/**
 * Transformer: SqlTableSchema → PreviewRow[]
 *
 * Converts parsed schema data into display-ready rows for the preview table
 * and Word export. Handles type case normalization and intelligent length
 * display logic.
 */

import type {
  ExportColumnKey,
  SqlTableSchema,
  SqlToTablePreviewRow,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"

/* ------------------------------------------------------------------ */
/*  Type normalization                                                 */
/* ------------------------------------------------------------------ */

function normalizeTypeCase(type: string, typeCase: TypeCaseMode) {
  return typeCase === "upper" ? type.toUpperCase() : type.toLowerCase()
}

/**
 * For types that have a well-known fixed length (like INT = 4 bytes,
 * BIGINT = 8 bytes), we can display a default length hint even when
 * the user's DDL doesn't specify one explicitly.
 */
const IMPLICIT_LENGTH_MAP: Record<string, string> = {
  int: "11",
  integer: "11",
  tinyint: "4",
  smallint: "6",
  mediumint: "9",
  bigint: "20",
  float: "–",
  double: "–",
  boolean: "1",
  bool: "1",
  text: "–",
  mediumtext: "–",
  longtext: "–",
  tinytext: "–",
  blob: "–",
  date: "–",
  datetime: "–",
  timestamp: "–",
  time: "–",
  year: "4",
  json: "–",
}

function resolveLength(
  explicitLength: string | undefined,
  typeName: string
): string {
  if (explicitLength) return explicitLength
  const key = typeName.toLowerCase().replace(/\s+/g, "")
  return IMPLICIT_LENGTH_MAP[key] || "–"
}

/* ------------------------------------------------------------------ */
/*  Row Builder                                                        */
/* ------------------------------------------------------------------ */

export function buildPreviewRows(
  table: SqlTableSchema,
  typeCase: TypeCaseMode
): SqlToTablePreviewRow[] {
  return table.columns.map<SqlToTablePreviewRow>((col, index) => ({
    index: index + 1,
    name: col.name || "–",
    type: normalizeTypeCase(col.type || "–", typeCase),
    length: resolveLength(col.length, col.type || ""),
    primary: col.isPrimary ? "是" : "否",
    constraint: col.constraint || "–",
    remark: col.remark || "–",
  }))
}

/* ------------------------------------------------------------------ */
/*  Column Filter (for selective export)                               */
/* ------------------------------------------------------------------ */

export function filterPreviewRowByColumns(
  row: SqlToTablePreviewRow,
  columns: ExportColumnKey[]
): Record<ExportColumnKey, string | number> {
  return {
    index: columns.includes("index") ? row.index : "",
    name: columns.includes("name") ? row.name : "",
    type: columns.includes("type") ? row.type : "",
    length: columns.includes("length") ? row.length : "",
    primary: columns.includes("primary") ? row.primary : "",
    constraint: columns.includes("constraint") ? row.constraint : "",
    remark: columns.includes("remark") ? row.remark : "",
  }
}
