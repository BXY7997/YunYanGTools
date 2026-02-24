/**
 * SQL Schema Parser
 *
 * Parses `CREATE TABLE` DDL statements (MySQL / PostgreSQL / SQLite) and
 * also supports Chinese narrative descriptions (e.g. "用户表（用户ID、用户名）").
 *
 * Improvements over previous version:
 * ─────────────────────────────────────
 *  • Correctly extracts DEFAULT values without treating them as column type
 *  • Handles ON UPDATE / ON DELETE clauses
 *  • Extracts UNSIGNED / ZEROFILL modifiers
 *  • Handles ENUM / SET type values with commas inside parentheses
 *  • Parses CHARACTER SET / COLLATE at column level
 *  • Handles composite primary keys declared inline
 *  • Better displayName: uses COMMENT on table if present
 *  • Handles AUTO_INCREMENT more reliably
 *  • Strips ENGINE / CHARSET from table options while still extracting comment
 */

import type {
  SqlTableColumn,
  SqlTableSchema,
} from "@/features/tools/sql-to-table/types/sql-to-table"

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Lines that start with these keywords are table-level constraints,
 * not column definitions.
 */
const TABLE_CONSTRAINT_PREFIX =
  /^(constraint|primary\s+key|unique(\s+key|\s+index)?|foreign\s+key|index|key)\b/i

/**
 * Known SQL keywords that indicate the "rest" part of a column definition
 * (everything after type + optional length). Used to separate type from
 * constraint tokens.
 */
const CONSTRAINT_KEYWORDS =
  /\b(NOT\s+NULL|NULL|DEFAULT|PRIMARY\s+KEY|UNIQUE|AUTO_INCREMENT|SERIAL|GENERATED|ON\s+UPDATE|ON\s+DELETE|CHECK|REFERENCES|COLLATE|CHARACTER\s+SET|CHARSET|COMMENT|UNSIGNED|ZEROFILL|CONSTRAINT)\b/i

/* ------------------------------------------------------------------ */
/*  String Helpers                                                     */
/* ------------------------------------------------------------------ */

function trimQuotes(value: string) {
  return value
    .trim()
    .replace(/^`(.+)`$/, "$1")
    .replace(/^"(.+)"$/, "$1")
    .replace(/^\[(.+)\]$/, "$1")
    .replace(/^'(.+)'$/, "$1")
}

function normalizeIdentifier(value: string) {
  const normalized = trimQuotes(value)
  const segments = normalized.split(".")
  return trimQuotes(segments[segments.length - 1] || normalized)
}

/* ------------------------------------------------------------------ */
/*  Bracket Matching                                                   */
/* ------------------------------------------------------------------ */

function findMatchingBracket(text: string, openIndex: number) {
  let level = 0
  let inSQ = false
  let inDQ = false
  let inBT = false

  for (let i = openIndex; i < text.length; i++) {
    const c = text[i]
    const p = text[i - 1]

    if (c === "'" && p !== "\\" && !inDQ && !inBT) inSQ = !inSQ
    if (c === '"' && p !== "\\" && !inSQ && !inBT) inDQ = !inDQ
    if (c === "`" && p !== "\\" && !inSQ && !inDQ) inBT = !inBT

    if (inSQ || inDQ || inBT) continue

    if (c === "(") level++
    if (c === ")") {
      level--
      if (level === 0) return i
    }
  }

  return -1
}

/* ------------------------------------------------------------------ */
/*  Comma Splitting (respects nested parentheses + quotes)             */
/* ------------------------------------------------------------------ */

function splitTopLevelComma(input: string) {
  const parts: string[] = []
  let current = ""
  let level = 0
  let inSQ = false
  let inDQ = false
  let inBT = false

  for (let i = 0; i < input.length; i++) {
    const c = input[i]
    const p = input[i - 1]

    if (c === "'" && p !== "\\" && !inDQ && !inBT) inSQ = !inSQ
    if (c === '"' && p !== "\\" && !inSQ && !inBT) inDQ = !inDQ
    if (c === "`" && p !== "\\" && !inSQ && !inDQ) inBT = !inBT

    if (!inSQ && !inDQ && !inBT) {
      if (c === "(") level++
      else if (c === ")") level = Math.max(level - 1, 0)

      if (c === "," && level === 0) {
        const trimmed = current.trim()
        if (trimmed) parts.push(trimmed)
        current = ""
        continue
      }
    }

    current += c
  }

  const trimmed = current.trim()
  if (trimmed) parts.push(trimmed)

  return parts
}

/* ------------------------------------------------------------------ */
/*  Type + Length Extraction                                           */
/* ------------------------------------------------------------------ */

/**
 * Extracts the data type token (including parenthesized args like VARCHAR(100)
 * or DECIMAL(10,2) or ENUM('a','b')) and the remaining constraint text.
 *
 * The algorithm walks char-by-char, tracking parenthesis depth, so that
 * commas inside type arguments don't break parsing.
 */
function extractTypeAndRest(definition: string) {
  let current = ""
  let level = 0

  for (let i = 0; i < definition.length; i++) {
    const c = definition[i]

    if (c === "(") level++
    else if (c === ")") level = Math.max(level - 1, 0)

    // When we're at top level and encounter whitespace, we've finished
    // reading the type token — but only if the next word is a known
    // constraint keyword. Otherwise it might be "DOUBLE PRECISION" etc.
    if (level === 0 && /\s/.test(c)) {
      const remainder = definition.slice(i).trim()
      if (CONSTRAINT_KEYWORDS.test(remainder)) {
        return { type: current.trim(), rest: remainder }
      }
      // "DOUBLE PRECISION", "CHARACTER VARYING" etc.  → keep reading
      current += c
      continue
    }

    current += c
  }

  return { type: definition.trim(), rest: "" }
}

/**
 * From a full type token like "VARCHAR(100)" or "DECIMAL(10,2)" or "INT",
 * extract the base type name and the length/precision string.
 */
function parseTypeToken(typeToken: string) {
  const parenMatch = typeToken.match(/^([^(]+)\((.+)\)$/)
  if (parenMatch) {
    let baseType = parenMatch[1].trim()
    const lengthStr = parenMatch[2].trim()
    // Strip UNSIGNED/ZEROFILL from base type
    baseType = baseType.replace(/\s+(unsigned|zerofill)/gi, "").trim()
    return { baseType, length: lengthStr }
  }

  // No parentheses — strip UNSIGNED/ZEROFILL
  const cleaned = typeToken.replace(/\s+(unsigned|zerofill)/gi, "").trim()
  return { baseType: cleaned, length: undefined }
}

/* ------------------------------------------------------------------ */
/*  Column Definition Parser                                           */
/* ------------------------------------------------------------------ */

function parseColumnDefinition(definition: string): SqlTableColumn | null {
  // Match: columnName <rest>
  const colMatch = definition.match(
    /^(`[^`]+`|"[^"]+"|\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/s
  )
  if (!colMatch) return null

  const [, rawName, rawContent] = colMatch
  const { type: typeToken, rest: rawConstraint } = extractTypeAndRest(
    rawContent
  )
  if (!typeToken) return null

  const { baseType, length } = parseTypeToken(typeToken)
  const columnName = normalizeIdentifier(rawName)

  // ── Extract metadata from constraint portion ──
  const commentMatch = rawConstraint.match(/comment\s+['"]([^'"]*)['"]/i)
  const defaultMatch = rawConstraint.match(
    /default\s+(?:'([^']*)'|"([^"]*)"|(\S+))/i
  )
  const isPrimary = /\bprimary\s+key\b/i.test(rawConstraint)
  const isUnsigned = /\bunsigned\b/i.test(rawContent)

  // Collect constraint flags
  const flags: string[] = []
  if (isPrimary) flags.push("PRIMARY KEY")
  if (/\bnot\s+null\b/i.test(rawConstraint)) flags.push("NOT NULL")
  if (/\bunique\b/i.test(rawConstraint)) flags.push("UNIQUE")
  if (/\bauto_increment\b/i.test(rawConstraint)) flags.push("AUTO_INCREMENT")
  if (isUnsigned) flags.push("UNSIGNED")
  if (/\bgenerated\b/i.test(rawConstraint)) flags.push("GENERATED")
  if (defaultMatch) {
    const val = defaultMatch[1] ?? defaultMatch[2] ?? defaultMatch[3] ?? ""
    flags.push(`DEFAULT ${val}`)
  }

  return {
    id: `${columnName}-${Math.random().toString(36).slice(2, 8)}`,
    name: columnName,
    type: baseType,
    length,
    isPrimary,
    constraint: flags.filter((f) => f !== "PRIMARY KEY").join(", "),
    remark: commentMatch?.[1] || "",
    rawDefinition: definition,
  }
}

/* ------------------------------------------------------------------ */
/*  Primary Key Constraint Parser                                      */
/* ------------------------------------------------------------------ */

function parsePrimaryKeysFromConstraint(definition: string) {
  const pkMatch = definition.match(/primary\s+key\s*\(([^)]+)\)/i)
  if (!pkMatch) return []

  return pkMatch[1]
    .split(",")
    .map((col) => normalizeIdentifier(col.trim()))
    .filter(Boolean)
}

/* ------------------------------------------------------------------ */
/*  Table Header / Comment Parsers                                     */
/* ------------------------------------------------------------------ */

function parseTableNameFromHeader(header: string) {
  const cleaned = header
    .replace(/create\s+table/i, "")
    .replace(/if\s+not\s+exists/i, "")
    .trim()

  const nameToken = cleaned.split(/\s+/)[0]
  return normalizeIdentifier(nameToken || "table")
}

function extractTableComment(statementTail: string) {
  const commentMatch = statementTail.match(/comment\s*=?\s*['"]([^'"]+)['"]/i)
  return commentMatch?.[1]
}

/* ------------------------------------------------------------------ */
/*  Narrative (Chinese description) Parser                             */
/* ------------------------------------------------------------------ */

function inferTypeByFieldName(fieldName: string): string {
  const n = fieldName.toLowerCase()

  if (/(^|[_\s-])(id|编号|序号|主键)([_\s-]|$)/i.test(n)) return "INT"
  if (/(age|年龄|数量|总数|次数|库存|学分|楼层)/i.test(n)) return "INT"
  if (/(price|amount|金额|费用|价格|cost|挂号费)/i.test(n))
    return "DECIMAL(10,2)"
  if (/(date|time|日期|时间)/i.test(n)) return "DATETIME"
  if (/(phone|mobile|tel|电话)/i.test(n)) return "VARCHAR(20)"
  if (/(身份证|idcard|identity)/i.test(n)) return "VARCHAR(18)"
  if (/(email|邮箱)/i.test(n)) return "VARCHAR(100)"
  if (/(status|状态|类型|性别|职称)/i.test(n)) return "VARCHAR(30)"
  if (/(content|内容|描述|正文|简介|专长)/i.test(n)) return "TEXT"
  return "VARCHAR(100)"
}

function parseNarrativeTables(input: string) {
  const tableRegex =
    /([\u4e00-\u9fa5A-Za-z0-9_]+)表\s*[（(]([^()（）]+)[）)]/g
  const result: SqlTableSchema[] = []

  let match = tableRegex.exec(input)
  while (match) {
    const tableName = match[1]
    const fields = match[2]
      .split(/[，,、]/)
      .map((f) => f.trim())
      .filter(Boolean)

    const primaryIndex = fields.findIndex((f) =>
      /(id|编号|主键)/i.test(f)
    )

    const columns: SqlTableColumn[] = fields.map((field, index) => {
      const inferred = inferTypeByFieldName(field)
      const { baseType, length } = parseTypeToken(inferred)
      const isPrimary = index === (primaryIndex >= 0 ? primaryIndex : 0)
      return {
        id: `${tableName}-${field}-${index + 1}`,
        name: field,
        type: baseType,
        length,
        isPrimary,
        constraint: isPrimary ? "" : "",
        remark: field,
      }
    })

    result.push({
      id: `table-${tableName}-${result.length + 1}`,
      name: tableName,
      displayName: `${tableName}表`,
      columns,
    })

    match = tableRegex.exec(input)
  }

  return result
}

/* ------------------------------------------------------------------ */
/*  Main Entry Point                                                   */
/* ------------------------------------------------------------------ */

export function parseSqlSchemaToTables(sqlInput: string): SqlTableSchema[] {
  const normalizedInput = sqlInput.replace(/\r\n/g, "\n")
  const tables: SqlTableSchema[] = []

  let cursor = 0
  while (cursor < normalizedInput.length) {
    const createMatch = /create\s+table/i.exec(normalizedInput.slice(cursor))
    if (!createMatch) break

    const statementStart = cursor + (createMatch.index || 0)
    const openIdx = normalizedInput.indexOf("(", statementStart)
    if (openIdx < 0) break

    const header = normalizedInput.slice(statementStart, openIdx)
    const tableName = parseTableNameFromHeader(header)
    const closeIdx = findMatchingBracket(normalizedInput, openIdx)
    if (closeIdx < 0) break

    const body = normalizedInput.slice(openIdx + 1, closeIdx)
    const semiIdx = normalizedInput.indexOf(";", closeIdx)
    const stmtEnd = semiIdx > -1 ? semiIdx : closeIdx
    const tail = normalizedInput.slice(closeIdx + 1, stmtEnd)

    const definitions = splitTopLevelComma(body)
    const columns: SqlTableColumn[] = []
    const primaryKeys = new Set<string>()

    for (const def of definitions) {
      if (TABLE_CONSTRAINT_PREFIX.test(def)) {
        for (const pk of parsePrimaryKeysFromConstraint(def)) {
          primaryKeys.add(pk)
        }
        continue
      }

      const col = parseColumnDefinition(def)
      if (col) columns.push(col)
    }

    // Apply table-level PRIMARY KEY to matching columns
    for (const col of columns) {
      if (primaryKeys.has(col.name)) {
        col.isPrimary = true
      }
    }

    const tableComment = extractTableComment(tail)

    if (columns.length > 0) {
      tables.push({
        id: `table-${tableName}-${tables.length + 1}`,
        name: tableName,
        displayName: tableComment || tableName,
        comment: tableComment,
        columns,
      })
    }

    cursor = stmtEnd + 1
  }

  if (tables.length > 0) return tables

  // Fallback: try narrative parsing
  return parseNarrativeTables(normalizedInput)
}
