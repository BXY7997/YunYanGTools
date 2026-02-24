import { parseSqlSchemaToTables } from "@/features/tools/sql-to-table/services/sql-schema-parser"
import type { SqlTableSchema } from "@/features/tools/sql-to-table/types/sql-to-table"

interface ParseSqlWorkerResponse {
  requestId: string
  tables: SqlTableSchema[]
  error?: string
}

function buildRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function createSqlParserWorker() {
  return new Worker(
    new URL("../workers/sql-parser.worker.ts", import.meta.url),
    {
      type: "module",
    }
  )
}

export async function parseSqlSchemaToTablesWithWorker(
  input: string,
  timeoutMs = 8000
) {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return parseSqlSchemaToTables(input)
  }

  const requestId = buildRequestId()
  const worker = createSqlParserWorker()

  try {
    const result = await new Promise<SqlTableSchema[]>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error("sql_parse_worker_timeout"))
      }, timeoutMs)

      worker.onmessage = (event: MessageEvent<ParseSqlWorkerResponse>) => {
        const payload = event.data
        if (!payload || payload.requestId !== requestId) {
          return
        }
        window.clearTimeout(timer)

        if (payload.error) {
          reject(new Error(payload.error))
          return
        }

        resolve(payload.tables || [])
      }

      worker.onerror = () => {
        window.clearTimeout(timer)
        reject(new Error("sql_parse_worker_failed"))
      }

      worker.postMessage({
        requestId,
        input,
      })
    })

    return result
  } catch {
    return parseSqlSchemaToTables(input)
  } finally {
    worker.terminate()
  }
}
