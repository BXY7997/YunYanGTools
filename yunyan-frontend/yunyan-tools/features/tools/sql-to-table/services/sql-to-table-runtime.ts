import { defaultWordExportPresetId } from "@/features/tools/shared/constants/word-export-presets"
import { createToolRuntimeContract } from "@/features/tools/shared/services/tool-runtime"
import type { ToolRuntimeContract } from "@/features/tools/shared/types/tool-runtime"
import {
  sqlToTableDefaultCaptionChapterSerial,
  sqlToTableDefaultFormat,
  sqlToTableDefaultPaperStyle,
  sqlToTableDefaultTypeCase,
} from "@/features/tools/sql-to-table/constants/sql-to-table-config"
import {
  exportSqlToTableWord,
  generateSqlToTableData,
} from "@/features/tools/sql-to-table/services/sql-to-table-api"
import { getSqlToTableExportPrecheckNotices } from "@/features/tools/sql-to-table/services/sql-to-table-export-precheck"
import type {
  ExportColumnKey,
  SqlToTableExportRequest,
  SqlToTableExportResult,
  SqlToTableGenerateRequest,
  SqlToTableGenerateResponse,
  SqlToTableMode,
  SqlTableSchema,
  TypeCaseMode,
} from "@/features/tools/sql-to-table/types/sql-to-table"
import type {
  WordCellAlignmentMode,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export interface SqlToTableDraftState {
  mode: SqlToTableMode
  sqlInput: string
  aiInput: string
  orientationMode: WordPageOrientationMode
  alignmentMode: WordCellAlignmentMode
  typeCase: TypeCaseMode
}

type SqlToTableRuntime = ToolRuntimeContract<
  SqlToTableGenerateRequest,
  SqlToTableGenerateResponse,
  SqlToTableExportRequest,
  SqlToTableExportResult,
  SqlTableSchema[],
  SqlToTableDraftState
>

export const sqlToTableRuntimeContract: SqlToTableRuntime =
  createToolRuntimeContract({
    toolId: "sql-to-table",
    schemaVersion: 2,
    defaultExportPresetId: defaultWordExportPresetId,
    generate: generateSqlToTableData,
    export: exportSqlToTableWord,
    precheck: (
      tables: SqlTableSchema[],
      columns: ExportColumnKey[],
      orientationMode: WordPageOrientationMode,
      alignmentMode: WordCellAlignmentMode,
      typeCase: TypeCaseMode
    ) =>
      getSqlToTableExportPrecheckNotices({
        tables,
        columns,
        format: sqlToTableDefaultFormat,
        typeCase,
        orientationMode,
        alignmentMode,
        presetId: defaultWordExportPresetId,
      }),
    buildPreview: (generated, draft) => {
      if (generated && generated.length > 0) {
        return generated
      }
      return []
    },
  })

export const sqlToTableRuntimeDraftDefaults: SqlToTableDraftState = {
  mode: "sql",
  sqlInput: "",
  aiInput: "",
  orientationMode: "auto",
  alignmentMode: "standard",
  typeCase: sqlToTableDefaultTypeCase,
}

export const sqlToTableRuntimeExportDefaults = {
  format: sqlToTableDefaultFormat,
  captionChapterSerial: sqlToTableDefaultCaptionChapterSerial,
  paperTemplateId: sqlToTableDefaultPaperStyle,
} as const
