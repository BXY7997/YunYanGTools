import type {
  WordTableBorderProfile,
  WordTableBorderSides,
  WordTableDocument,
} from "@/features/tools/word-table/types/word-table"

const MIN_ROWS = 1
const MAX_ROWS = 80
const MIN_COLUMNS = 1
const MAX_COLUMNS = 12

export const defaultWordTableBorderProfile: WordTableBorderProfile = {
  header: {
    top: 1.5,
    right: 0,
    bottom: 0.75,
    left: 0,
  },
  body: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  lastRow: {
    top: 0,
    right: 0,
    bottom: 1.5,
    left: 0,
  },
}

interface WordTableSeedTemplate {
  id: string
  matchers: RegExp[]
  title: string
  headers: string[]
  rows: string[][]
}

const wordTableSeedTemplates: WordTableSeedTemplate[] = [
  {
    id: "test-case",
    matchers: [/测试/, /用例/, /验证/, /QA/i],
    title: "功能测试用例表",
    headers: ["用例编号", "测试项", "操作步骤", "预期结果", "实际结果", "状态"],
    rows: [
      [
        "TC-001",
        "登录成功",
        "输入正确账号密码并点击登录",
        "跳转系统首页",
        "待执行",
        "未执行",
      ],
      [
        "TC-002",
        "密码错误",
        "输入正确账号与错误密码",
        "提示账号或密码错误",
        "待执行",
        "未执行",
      ],
      [
        "TC-003",
        "验证码失效",
        "输入过期验证码后提交",
        "提示验证码失效并要求重试",
        "待执行",
        "未执行",
      ],
    ],
  },
  {
    id: "project-plan",
    matchers: [/项目/, /计划/, /里程碑/, /进度/],
    title: "项目进度计划表",
    headers: ["序号", "任务名称", "负责人", "开始日期", "截止日期", "状态"],
    rows: [
      ["1", "需求评审", "产品经理", "2026-03-01", "2026-03-03", "进行中"],
      ["2", "接口开发", "后端工程师", "2026-03-04", "2026-03-12", "未开始"],
      ["3", "联调测试", "测试工程师", "2026-03-13", "2026-03-18", "未开始"],
    ],
  },
  {
    id: "score-sheet",
    matchers: [/成绩/, /课程/, /学生/, /评分/],
    title: "课程成绩统计表",
    headers: ["学号", "姓名", "课程", "平时成绩", "期末成绩", "总评"],
    rows: [
      ["2026001", "张三", "数据库原理", "88", "90", "89"],
      ["2026002", "李四", "数据库原理", "84", "86", "85"],
      ["2026003", "王五", "数据库原理", "91", "93", "92"],
    ],
  },
  {
    id: "finance-sheet",
    matchers: [/预算/, /费用/, /财务/, /报销/],
    title: "费用预算明细表",
    headers: ["费用类别", "预算金额", "实际金额", "差异", "说明"],
    rows: [
      ["设备采购", "100000", "96800", "-3200", "按计划执行"],
      ["服务器租赁", "24000", "25200", "+1200", "峰值扩容"],
      ["测试资源", "12000", "9800", "-2200", "节约开支"],
    ],
  },
]

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }
  return Math.min(Math.max(value, min), max)
}

function sanitizeCell(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }
  return value.replace(/\s+/g, " ").trim()
}

function sanitizeTitle(value: unknown, fallback: string) {
  const text = sanitizeCell(value)
  return text || fallback
}

function sanitizeBorderWidth(value: unknown, fallback: number) {
  if (typeof value === "number") {
    return clampNumber(Number(value.toFixed(2)), 0, 6)
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return clampNumber(Number(parsed.toFixed(2)), 0, 6)
    }
  }
  return fallback
}

function normalizeBorderSides(
  value: Partial<WordTableBorderSides> | null | undefined,
  fallback: WordTableBorderSides
): WordTableBorderSides {
  return {
    top: sanitizeBorderWidth(value?.top, fallback.top),
    right: sanitizeBorderWidth(value?.right, fallback.right),
    bottom: sanitizeBorderWidth(value?.bottom, fallback.bottom),
    left: sanitizeBorderWidth(value?.left, fallback.left),
  }
}

function normalizeBorderProfile(
  value: Partial<WordTableBorderProfile> | null | undefined,
  fallback: WordTableBorderProfile
): WordTableBorderProfile {
  return {
    header: normalizeBorderSides(value?.header, fallback.header),
    body: normalizeBorderSides(value?.body, fallback.body),
    lastRow: normalizeBorderSides(value?.lastRow, fallback.lastRow),
  }
}

function normalizeHeaders(headers: unknown, columnCount: number) {
  const source = Array.isArray(headers) ? headers : []
  const normalized = source
    .map((item) => sanitizeCell(item))
    .slice(0, columnCount)

  while (normalized.length < columnCount) {
    normalized.push(`列${normalized.length + 1}`)
  }

  return normalized
}

function normalizeRows(rows: unknown, rowCount: number, columnCount: number) {
  const source = Array.isArray(rows) ? rows : []
  const normalized = source
    .slice(0, rowCount)
    .map((row) => {
      const rowArray = Array.isArray(row) ? row : []
      const compact = rowArray
        .map((cell) => sanitizeCell(cell))
        .slice(0, columnCount)

      while (compact.length < columnCount) {
        compact.push("")
      }

      return compact
    })

  while (normalized.length < rowCount) {
    normalized.push(Array.from({ length: columnCount }, () => ""))
  }

  return normalized
}

function resolveTableSize(document: Partial<WordTableDocument> | null | undefined) {
  const headerCount = Array.isArray(document?.headers) ? document?.headers.length : 0
  const rows = Array.isArray(document?.rows) ? document?.rows : []
  const rowCount = rows.length
  const widestRow = rows.reduce((max, row) => {
    if (!Array.isArray(row)) {
      return max
    }
    return Math.max(max, row.length)
  }, 0)

  return {
    rowCount: clampNumber(rowCount || 3, MIN_ROWS, MAX_ROWS),
    columnCount: clampNumber(headerCount || widestRow || 5, MIN_COLUMNS, MAX_COLUMNS),
  }
}

function parseRequestedSize(prompt: string) {
  const rowMatch = prompt.match(/(\d{1,2})\s*行/)
  const columnMatch = prompt.match(/(\d{1,2})\s*列/)
  const rowCount = rowMatch ? clampNumber(Number(rowMatch[1]), MIN_ROWS, MAX_ROWS) : undefined
  const columnCount = columnMatch
    ? clampNumber(Number(columnMatch[1]), MIN_COLUMNS, MAX_COLUMNS)
    : undefined

  return {
    rowCount,
    columnCount,
  }
}

function inferTitleFromPrompt(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim()
  if (!cleaned) {
    return ""
  }

  const shortToken = cleaned
    .replace(/^请(为|帮我|你)?/u, "")
    .split(/[，。；,.!?！？]/)[0]
    .replace(/生成|制作|创建|输出|一份|一个|表格|word|Word/g, "")
    .replace(/表$/u, "")
    .trim()

  return shortToken.slice(0, 28)
}

function inferTemplate(prompt: string) {
  const normalized = prompt.trim()
  if (!normalized) {
    return wordTableSeedTemplates[0]
  }

  return (
    wordTableSeedTemplates.find((template) =>
      template.matchers.some((matcher) => matcher.test(normalized))
    ) || wordTableSeedTemplates[0]
  )
}

export function getWordTableColumnCount(document: WordTableDocument) {
  return document.headers.length
}

export function getWordTableRowCount(document: WordTableDocument) {
  return document.rows.length
}

export function resizeWordTableDocument(
  document: WordTableDocument,
  nextRowCount: number,
  nextColumnCount: number
): WordTableDocument {
  const rowCount = clampNumber(nextRowCount, MIN_ROWS, MAX_ROWS)
  const columnCount = clampNumber(nextColumnCount, MIN_COLUMNS, MAX_COLUMNS)

  return {
    ...document,
    headers: normalizeHeaders(document.headers, columnCount),
    rows: normalizeRows(document.rows, rowCount, columnCount),
  }
}

export function createDefaultWordTableDocument() {
  const seed = wordTableSeedTemplates[0]
  return normalizeWordTableDocument(
    {
      title: seed.title,
      headers: seed.headers,
      rows: seed.rows,
      borderProfile: defaultWordTableBorderProfile,
    },
    {
      title: "通用数据明细表",
      headers: ["列1", "列2", "列3", "列4", "列5"],
      rows: Array.from({ length: 3 }, () => ["", "", "", "", ""]),
      borderProfile: defaultWordTableBorderProfile,
    }
  )
}

export function createWordTableDocumentFromPrompt(prompt: string) {
  const normalizedPrompt = prompt.trim()
  const template = inferTemplate(normalizedPrompt)
  const requestedSize = parseRequestedSize(normalizedPrompt)
  const inferredTitle = inferTitleFromPrompt(normalizedPrompt)

  const rowCount = requestedSize.rowCount || template.rows.length || 3
  const columnCount = requestedSize.columnCount || template.headers.length || 5

  const filledRows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const templateRow = template.rows[rowIndex % template.rows.length] || []
    return Array.from({ length: columnCount }, (_, columnIndex) => {
      const seed = templateRow[columnIndex % Math.max(templateRow.length, 1)] || ""
      if (seed) {
        return seed
      }
      return `R${rowIndex + 1}C${columnIndex + 1}`
    })
  })

  const headers = Array.from({ length: columnCount }, (_, index) => {
    const seed = template.headers[index]
    return seed || `列${index + 1}`
  })

  return normalizeWordTableDocument({
    title: inferredTitle ? `${inferredTitle}表` : template.title,
    headers,
    rows: filledRows,
    borderProfile: defaultWordTableBorderProfile,
  })
}

export function normalizeWordTableDocument(
  value: Partial<WordTableDocument> | null | undefined,
  fallback?: WordTableDocument
): WordTableDocument {
  const baseline = fallback || createDefaultWordTableDocument()
  const size = resolveTableSize(value)

  return {
    title: sanitizeTitle(value?.title, baseline.title),
    headers: normalizeHeaders(value?.headers || baseline.headers, size.columnCount),
    rows: normalizeRows(value?.rows || baseline.rows, size.rowCount, size.columnCount),
    borderProfile: normalizeBorderProfile(value?.borderProfile, baseline.borderProfile),
  }
}

export function getWordTableSizeRange() {
  return {
    minRows: MIN_ROWS,
    maxRows: MAX_ROWS,
    minColumns: MIN_COLUMNS,
    maxColumns: MAX_COLUMNS,
  }
}
