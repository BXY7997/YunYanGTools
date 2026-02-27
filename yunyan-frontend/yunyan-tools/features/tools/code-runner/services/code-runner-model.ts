import {
  courseCodeDefaultCode,
  courseCodeDefaultLanguage,
  resolveCourseCodeDefaultCode,
} from "@/features/tools/code-runner/constants/code-runner-config"
import type {
  CourseCodeDocument,
  CourseCodeLanguage,
  CourseCodeRunRequest,
  CourseCodeRunResult,
} from "@/features/tools/code-runner/types/code-runner"

type VariableDictionary = Record<string, string>

function normalizeCode(value: string) {
  const normalized = value.replace(/\r/g, "").trim()
  return normalized ? `${normalized}\n` : ""
}

function hashText(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function decodeEscapedLiteral(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\")
}

function parseStringLiteral(value: string) {
  const trimmed = value.trim()
  if (trimmed.length < 2) {
    return null
  }
  const first = trimmed[0]
  const last = trimmed[trimmed.length - 1]
  if ((first !== '"' && first !== "'") || first !== last) {
    return null
  }
  return decodeEscapedLiteral(trimmed.slice(1, -1))
}

function isWrappedByBalancedParentheses(value: string) {
  if (!value.startsWith("(") || !value.endsWith(")")) {
    return false
  }

  let depth = 0
  let quote: string | null = null
  let escaping = false

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (escaping) {
      escaping = false
      continue
    }

    if (quote) {
      if (char === "\\") {
        escaping = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === "(") {
      depth += 1
      continue
    }

    if (char === ")") {
      depth -= 1
      if (depth === 0 && index < value.length - 1) {
        return false
      }
    }
  }

  return depth === 0 && quote === null
}

function stripWrappingParentheses(value: string) {
  let current = value.trim()
  while (current.length > 2 && isWrappedByBalancedParentheses(current)) {
    current = current.slice(1, -1).trim()
  }
  return current
}

function splitTopLevel(value: string, separator: string) {
  const parts: string[] = []
  let current = ""
  let quote: string | null = null
  let escaping = false
  let round = 0
  let square = 0
  let curly = 0

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (escaping) {
      current += char
      escaping = false
      continue
    }

    if (quote) {
      current += char
      if (char === "\\") {
        escaping = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }

    if (char === "(") {
      round += 1
      current += char
      continue
    }
    if (char === ")") {
      round -= 1
      current += char
      continue
    }
    if (char === "[") {
      square += 1
      current += char
      continue
    }
    if (char === "]") {
      square -= 1
      current += char
      continue
    }
    if (char === "{") {
      curly += 1
      current += char
      continue
    }
    if (char === "}") {
      curly -= 1
      current += char
      continue
    }

    const isTopLevel = round === 0 && square === 0 && curly === 0
    if (isTopLevel && value.slice(index, index + separator.length) === separator) {
      parts.push(current.trim())
      current = ""
      index += separator.length - 1
      continue
    }

    current += char
  }

  parts.push(current.trim())
  return parts.filter(Boolean)
}

function evaluateNumericExpression(expression: string) {
  const trimmed = expression.replace(/\s+/g, "")
  if (!trimmed || !/^[0-9+\-*/%().]+$/.test(trimmed)) {
    return null
  }

  try {
    const result = Function(`"use strict"; return (${trimmed});`)()
    if (typeof result !== "number" || !Number.isFinite(result)) {
      return null
    }
    return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(6)))
  } catch {
    return null
  }
}

function collectNumericVariables(language: CourseCodeLanguage, source: string): VariableDictionary {
  const variables: VariableDictionary = {}
  const assignValue = (name: string, expression: string) => {
    const evaluated = evaluateNumericExpression(expression)
    if (evaluated !== null) {
      variables[name] = evaluated
    }
  }

  if (language === "Python3") {
    const regex = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9+\-*/%().\s]+)\s*(?:#.*)?$/gm
    for (const match of source.matchAll(regex)) {
      assignValue(match[1] || "", match[2] || "")
    }
    return variables
  }

  if (language === "JavaScript" || language === "Typescript") {
    const regex = /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*([0-9+\-*/%().\s]+)\s*;?/g
    for (const match of source.matchAll(regex)) {
      assignValue(match[1] || "", match[2] || "")
    }
    return variables
  }

  if (language === "JAVA" || language === "C" || language === "C++") {
    const regex = /\b(?:int|long|double|float|short)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9+\-*/%().\s]+)\s*;/g
    for (const match of source.matchAll(regex)) {
      assignValue(match[1] || "", match[2] || "")
    }
    return variables
  }

  if (language === "Go") {
    const varRegex = /\bvar\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9+\-*/%().\s]+)/g
    for (const match of source.matchAll(varRegex)) {
      assignValue(match[1] || "", match[2] || "")
    }

    const shortRegex = /\b([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*([0-9+\-*/%().\s]+)/g
    for (const match of source.matchAll(shortRegex)) {
      assignValue(match[1] || "", match[2] || "")
    }
  }

  return variables
}

function normalizeDisplayToken(token: string, variables: VariableDictionary) {
  const cleaned = stripWrappingParentheses(token)
  if (!cleaned) {
    return ""
  }

  if (cleaned === "std::endl" || cleaned === "endl") {
    return ""
  }

  const literal = parseStringLiteral(cleaned)
  if (literal !== null) {
    return literal
  }

  if (/^[+-]?\d+(?:\.\d+)?$/.test(cleaned)) {
    return cleaned
  }

  if (cleaned in variables) {
    return variables[cleaned]
  }

  // 避免把复杂表达式原样当作运行输出（如 arr[i], user.name, fn(x)）
  if (/[()[\]{}]|::|->|\./.test(cleaned)) {
    return ""
  }

  return cleaned.replace(/\s+/g, " ")
}

function evaluateConcatenation(expression: string, variables: VariableDictionary) {
  const parts = splitTopLevel(expression, "+")
  if (parts.length <= 1) {
    return normalizeDisplayToken(expression, variables)
  }

  return parts
    .map((part) => normalizeDisplayToken(part, variables))
    .filter(Boolean)
    .join("")
}

function evaluateDelimitedArguments(
  expression: string,
  delimiter: string,
  variables: VariableDictionary
) {
  const parts = splitTopLevel(expression, delimiter)
  if (parts.length === 0) {
    return ""
  }

  return parts
    .map((part) => evaluateConcatenation(part, variables))
    .filter(Boolean)
    .join(" ")
}

function findMatchingParenthesis(source: string, openIndex: number) {
  let depth = 0
  let quote: string | null = null
  let escaping = false

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index]

    if (escaping) {
      escaping = false
      continue
    }

    if (quote) {
      if (char === "\\") {
        escaping = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === "(") {
      depth += 1
      continue
    }

    if (char === ")") {
      depth -= 1
      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}

function extractCallArguments(source: string, callName: string) {
  const matches: string[] = []
  let cursor = 0

  while (cursor < source.length) {
    const start = source.indexOf(callName, cursor)
    if (start === -1) {
      break
    }

    const before = start > 0 ? source[start - 1] : ""
    const after = source[start + callName.length] || ""
    const boundaryBefore = !before || /[^A-Za-z0-9_.$]/.test(before)
    const boundaryAfter = !after || /\s|\(/.test(after)

    if (!boundaryBefore || !boundaryAfter) {
      cursor = start + callName.length
      continue
    }

    let openIndex = start + callName.length
    while (openIndex < source.length && /\s/.test(source[openIndex])) {
      openIndex += 1
    }

    if (source[openIndex] !== "(") {
      cursor = start + callName.length
      continue
    }

    const closeIndex = findMatchingParenthesis(source, openIndex)
    if (closeIndex === -1) {
      cursor = openIndex + 1
      continue
    }

    matches.push(source.slice(openIndex + 1, closeIndex))
    cursor = closeIndex + 1
  }

  return matches
}

function collectPrintfOutput(source: string, variables: VariableDictionary) {
  const outputs: string[] = []
  const argsBlocks = extractCallArguments(source, "printf")

  for (const args of argsBlocks) {
    const tokens = splitTopLevel(args, ",")
    if (tokens.length === 0) {
      continue
    }

    const format = parseStringLiteral(tokens[0])
    const values = tokens.slice(1).map((token) => evaluateConcatenation(token, variables))

    if (format !== null) {
      let valueIndex = 0
      const rendered = format.replace(/%[-+0-9.#]*[a-zA-Z]/g, () => {
        const replacement = values[valueIndex]
        valueIndex += 1
        return replacement ?? ""
      })
      const finalText = rendered.trim()
      if (finalText) {
        outputs.push(finalText)
      }
      continue
    }

    const fallback = evaluateDelimitedArguments(args, ",", variables)
    if (fallback) {
      outputs.push(fallback)
    }
  }

  return outputs
}

function collectCoutOutput(source: string, variables: VariableDictionary) {
  const outputs: string[] = []
  const regex = /(?:std::)?cout\s*<<\s*([^;]+);/g

  for (const match of source.matchAll(regex)) {
    const segments = splitTopLevel(match[1] || "", "<<")
    const rendered = segments
      .map((segment) => normalizeDisplayToken(segment, variables))
      .filter(Boolean)
      .join(" ")
      .trim()

    if (rendered) {
      outputs.push(rendered)
    }
  }

  return outputs
}

function extractOutputByLanguage(language: CourseCodeLanguage, source: string) {
  const variables = collectNumericVariables(language, source)

  if (language === "Python3") {
    return extractCallArguments(source, "print")
      .map((args) => evaluateDelimitedArguments(args, ",", variables))
      .filter(Boolean)
  }

  if (language === "JavaScript" || language === "Typescript") {
    return extractCallArguments(source, "console.log")
      .map((args) => evaluateDelimitedArguments(args, ",", variables))
      .filter(Boolean)
  }

  if (language === "JAVA") {
    return extractCallArguments(source, "System.out.println")
      .map((args) => evaluateConcatenation(args, variables))
      .filter(Boolean)
  }

  if (language === "Go") {
    return extractCallArguments(source, "fmt.Println")
      .map((args) => evaluateDelimitedArguments(args, ",", variables))
      .filter(Boolean)
  }

  if (language === "C") {
    return collectPrintfOutput(source, variables)
  }

  if (language === "C++") {
    return [...collectPrintfOutput(source, variables), ...collectCoutOutput(source, variables)]
  }

  return []
}

function hasUnbalancedBrackets(source: string) {
  const pairs: Array<{ left: string; right: string }> = [
    { left: "(", right: ")" },
    { left: "{", right: "}" },
    { left: "[", right: "]" },
  ]

  return pairs.some((pair) => {
    const leftCount = (source.match(new RegExp(`\\${pair.left}`, "g")) || []).length
    const rightCount = (source.match(new RegExp(`\\${pair.right}`, "g")) || []).length
    return leftCount !== rightCount
  })
}

function resolveErrorReason(source: string) {
  if (/syntax[_ -]?error|语法错误/i.test(source)) {
    return "检测到语法错误标记，请检查关键字拼写与括号匹配。"
  }

  if (/nullpointer|undefined|throw\s+new\s+error|panic\(/i.test(source)) {
    return "检测到运行时异常标记，请检查对象初始化与边界条件。"
  }

  if (hasUnbalancedBrackets(source)) {
    return "括号数量不匹配，请检查代码块是否完整闭合。"
  }

  return "模拟执行失败，请检查语句结构后重试。"
}

export function buildCourseCodeTitle(language: CourseCodeLanguage) {
  return `${language} 在线运行示例`
}

export function createCourseCodeRunnerCode(language: CourseCodeLanguage, code?: string) {
  const normalized = normalizeCode(code || "")
  if (normalized) {
    return normalized
  }
  return normalizeCode(resolveCourseCodeDefaultCode(language))
}

export function createCourseCodeDocumentDraft(): CourseCodeDocument {
  return {
    language: courseCodeDefaultLanguage,
    code: courseCodeDefaultCode,
    title: buildCourseCodeTitle(courseCodeDefaultLanguage),
    runResult: null,
  }
}

export function simulateCourseCodeRun(request: CourseCodeRunRequest): CourseCodeRunResult {
  const source = normalizeCode(request.code)
  const hashed = hashText(`${request.language}:${source}`)
  const runtimeMs = clampInteger((hashed % 320) + 28, 28, 420)
  const memoryKb = clampInteger((hashed % 14336) + 2048, 2048, 18432)

  if (!source.trim()) {
    return {
      status: "error",
      output: "",
      errorOutput: "未检测到可执行代码。",
      runtimeMs,
      memoryKb,
      warnings: [],
      logs: [`[runner] language=${request.language}`, "[runner] empty_source=true"],
    }
  }

  const shouldFail =
    /syntax[_ -]?error|throw\s+new\s+error|panic\(|unhandled/i.test(source) ||
    hasUnbalancedBrackets(source)

  if (shouldFail) {
    const reason = resolveErrorReason(source)
    return {
      status: "error",
      output: "",
      errorOutput: reason,
      runtimeMs,
      memoryKb,
      warnings: [],
      logs: [`[runner] language=${request.language}`, "[runner] status=error"],
    }
  }

  const extractedLines = extractOutputByLanguage(request.language, source)
  const output = extractedLines.length
    ? extractedLines.join("\n")
    : "程序执行完成，无标准输出。"

  const warnings: string[] = []
  if (source.length > 3200) {
    warnings.push("代码体积较大，建议拆分模块并减少单文件复杂度。")
  }
  if (
    /quicksort|mergeSort|dfs\(|bfs\(|while\s*\(|for\s*\(|recursion|递归|排序|partition\(/i.test(
      source
    )
  ) {
    warnings.push("检测到复杂流程。当前为本地模拟解析，完整输出请以后端真实运行结果为准。")
  }
  if (/while\s*\(true\)|for\s*\(;;\)/.test(source)) {
    warnings.push("检测到潜在无限循环，请补充退出条件。")
  }

  const logs = [
    `[runner] language=${request.language}`,
    `[runner] runtime_ms=${runtimeMs}`,
    `[runner] memory_kb=${memoryKb}`,
  ]

  if (request.stdin && request.stdin.trim()) {
    logs.push(`[runner] stdin_bytes=${request.stdin.trim().length}`)
  }

  return {
    status: "success",
    output,
    runtimeMs,
    memoryKb,
    warnings,
    logs,
  }
}
