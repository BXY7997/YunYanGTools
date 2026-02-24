import {
  pseudoCodeDefaultManualInput,
  pseudoCodeDefaultRenderConfig,
} from "@/features/tools/pseudo-code/constants/pseudo-code-config"
import type {
  PseudoCodeDocument,
  PseudoCodeRenderConfig,
  PseudoCodeStats,
} from "@/features/tools/pseudo-code/types/pseudo-code"

export const pseudoCodeKeywordSet = new Set([
  "algorithm",
  "procedure",
  "function",
  "input",
  "output",
  "begin",
  "end",
  "if",
  "then",
  "else",
  "for",
  "while",
  "repeat",
  "until",
  "return",
  "break",
  "continue",
  "call",
  "set",
  "do",
])

const endKeywordRegExp = /^(end|end\s+if|end\s+for|end\s+while|fi)$/i

const aiTemplateMap = [
  {
    match: /(排序|sort|quick)/i,
    title: "快速排序",
    content: String.raw`\begin{algorithm}
\caption{Quick Sort}
\begin{algorithmic}
\PROCEDURE{QuickSort}{A, left, right}
  \IF{left >= right}
    \RETURN
  \ENDIF
  \STATE pivot = A[right]
  \STATE i = left - 1
  \FOR{j = left \TO right - 1}
    \IF{A[j] <= pivot}
      \STATE i = i + 1
      \STATE exchange A[i] and A[j]
    \ENDIF
  \ENDFOR
  \STATE exchange A[i + 1] and A[right]
  \STATE \CALL{QuickSort}{A, left, i}
  \STATE \CALL{QuickSort}{A, i + 2, right}
\ENDPROCEDURE
\end{algorithmic}
\end{algorithm}`,
  },
  {
    match: /(登录|login|认证|auth)/i,
    title: "用户登录校验",
    content: pseudoCodeDefaultManualInput,
  },
  {
    match: /(选课|course|冲突|conflict)/i,
    title: "选课冲突检测",
    content: String.raw`\begin{algorithm}
\caption{Course Conflict Check}
\begin{algorithmic}
\REQUIRE studentId, targetCourse
\ENSURE checkResult
\STATE selectedCourses = QuerySelectedCourses(studentId)
\IF{HasTimeConflict(selectedCourses, targetCourse)}
  \RETURN "TIME-CONFLICT"
\ENDIF
\IF{IsCourseFull(targetCourse)}
  \RETURN "COURSE-FULL"
\ENDIF
\IF{\NOT MeetPrerequisite(studentId, targetCourse)}
  \RETURN "PREREQUISITE-NOT-MET"
\ENDIF
\STATE SaveSelection(studentId, targetCourse)
\RETURN "SUCCESS"
\end{algorithmic}
\end{algorithm}`,
  },
]

function normalizeLineBreaks(value: string) {
  return value.replace(/\r/g, "\n")
}

function computeIndentLevel(rawLine: string, indentSize: number) {
  const expanded = rawLine.replace(/\t/g, " ".repeat(indentSize))
  const leadingSpaces = expanded.match(/^ */)?.[0]?.length || 0
  return Math.floor(leadingSpaces / Math.max(1, indentSize))
}

function normalizeLine(rawLine: string, renderConfig: PseudoCodeRenderConfig) {
  const trimmed = rawLine.trim()
  if (!trimmed) {
    return ""
  }

  if (renderConfig.hideEndKeywords && endKeywordRegExp.test(trimmed)) {
    return ""
  }

  const indentLevel = computeIndentLevel(rawLine, renderConfig.indentSize)
  const indentText = " ".repeat(indentLevel * renderConfig.indentSize)
  return `${indentText}${trimmed}`
}

function countKeywords(line: string) {
  const words = line
    .split(/[^A-Za-z]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return words.reduce((count, word) => count + (pseudoCodeKeywordSet.has(word) ? 1 : 0), 0)
}

function buildStats(lines: string[], renderConfig: PseudoCodeRenderConfig): PseudoCodeStats {
  const keywordCount = lines.reduce((total, line) => total + countKeywords(line), 0)
  const commentCount = lines.reduce((total, line) => {
    const trimmed = line.trim()
    return total + (trimmed.startsWith(renderConfig.commentDelimiter) ? 1 : 0)
  }, 0)

  return {
    lineCount: lines.length,
    keywordCount,
    commentCount,
  }
}

export function resolveRenderConfig(
  config?: Partial<PseudoCodeRenderConfig>
): PseudoCodeRenderConfig {
  return {
    ...pseudoCodeDefaultRenderConfig,
    ...config,
    lineNumberPunc: (config?.lineNumberPunc || pseudoCodeDefaultRenderConfig.lineNumberPunc)
      .trim()
      .slice(0, 2),
    indentSize: Math.min(
      6,
      Math.max(
        1,
        Math.round(
          Number.isFinite(config?.indentSize)
            ? Number(config?.indentSize)
            : pseudoCodeDefaultRenderConfig.indentSize
        )
      )
    ),
    titlePrefix: (config?.titlePrefix || pseudoCodeDefaultRenderConfig.titlePrefix)
      .trim()
      .slice(0, 12),
    titleCounter: Math.max(
      1,
      Math.min(
        99,
        Math.round(
          Number.isFinite(config?.titleCounter)
            ? Number(config?.titleCounter)
            : pseudoCodeDefaultRenderConfig.titleCounter
        )
      )
    ),
    commentDelimiter: (config?.commentDelimiter || pseudoCodeDefaultRenderConfig.commentDelimiter)
      .trim()
      .slice(0, 3),
  }
}

export function normalizePseudoCodeSource(
  source: string,
  renderConfig: PseudoCodeRenderConfig
) {
  const normalizedSource = normalizeLineBreaks(source || "").trim()
  const rawLines = normalizedSource.split("\n")

  const normalizedLines = rawLines
    .map((line) => normalizeLine(line, renderConfig))
    .filter(Boolean)

  if (normalizedLines.length > 0) {
    return normalizedLines
  }

  return normalizeLineBreaks(pseudoCodeDefaultManualInput)
    .split("\n")
    .map((line) => normalizeLine(line, renderConfig))
    .filter(Boolean)
}

function deriveAlgorithmName(source: string, fallback = "核心流程") {
  const normalizedSource = normalizeLineBreaks(source)

  const captionMatch = normalizedSource.match(/\\caption\{([^}]+)\}/i)
  if (captionMatch?.[1]) {
    return captionMatch[1].trim()
  }

  const procedureMatch = normalizedSource.match(/\\(?:PROCEDURE|FUNCTION)\{([^}]+)\}/i)
  if (procedureMatch?.[1]) {
    return procedureMatch[1].trim()
  }

  const firstLine = normalizedSource
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) {
    return fallback
  }

  const directMatch = firstLine.match(/^(Algorithm|Procedure|Function)\s+(.+)$/i)
  if (directMatch?.[2]) {
    return directMatch[2].trim()
  }

  if (firstLine.length <= 24) {
    return firstLine
  }

  return fallback
}

function buildTitle(algorithmName: string, renderConfig: PseudoCodeRenderConfig) {
  return `${renderConfig.titlePrefix}${renderConfig.titleCounter} ${algorithmName}`
}

export function createPseudoCodeDocumentFromSource(params: {
  source: string
  algorithmName?: string
  renderConfig?: Partial<PseudoCodeRenderConfig>
}) {
  const renderConfig = resolveRenderConfig(params.renderConfig)
  const normalizedLines = normalizePseudoCodeSource(params.source, renderConfig)
  const algorithmName =
    params.algorithmName?.trim() || deriveAlgorithmName(params.source) || "核心流程"

  const document: PseudoCodeDocument = {
    title: buildTitle(algorithmName, renderConfig),
    algorithmName,
    source: params.source.trim() ? params.source : normalizedLines.join("\n"),
    normalizedLines,
    renderConfig,
    stats: buildStats(normalizedLines, renderConfig),
  }

  return document
}

function normalizePrompt(prompt: string) {
  return normalizeLineBreaks(prompt).trim()
}

export function createPseudoCodeDocumentFromPrompt(params: {
  prompt: string
  algorithmName?: string
  renderConfig?: Partial<PseudoCodeRenderConfig>
}) {
  const normalizedPrompt = normalizePrompt(params.prompt)

  const matchedTemplate =
    aiTemplateMap.find((item) => item.match.test(normalizedPrompt)) || aiTemplateMap[1]

  const source = matchedTemplate.content
  const algorithmName = params.algorithmName?.trim() || matchedTemplate.title

  return createPseudoCodeDocumentFromSource({
    source,
    algorithmName,
    renderConfig: params.renderConfig,
  })
}
