import { parseSqlSchemaToTables } from "@/features/tools/sql-to-table/services/sql-schema-parser"

interface ParseSqlWorkerRequest {
  requestId: string
  input: string
}

interface ParseSqlWorkerResponse {
  requestId: string
  tables: ReturnType<typeof parseSqlSchemaToTables>
  error?: string
}

self.onmessage = (event: MessageEvent<ParseSqlWorkerRequest>) => {
  const { requestId, input } = event.data

  let payload: ParseSqlWorkerResponse
  try {
    const tables = parseSqlSchemaToTables(input)
    payload = {
      requestId,
      tables,
    }
  } catch (error) {
    payload = {
      requestId,
      tables: [],
      error: error instanceof Error ? error.message : "sql_parse_failed",
    }
  }

  self.postMessage(payload)
}
