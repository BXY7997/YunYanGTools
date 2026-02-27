import { renderPseudoCodeMarkupStrict } from "@/features/tools/pseudo-code/services/pseudo-code-renderer"
import type { PseudoCodeDocument } from "@/features/tools/pseudo-code/types/pseudo-code"

export interface PseudoCodeStructuredLine {
  text: string
  indentDepth: number
}

function normalizeLineText(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
}

function resolveLineIndentDepth(node: Element) {
  let depth = 0
  let cursor: Element | null = node.parentElement

  while (cursor) {
    if (cursor.classList.contains("ps-block")) {
      depth += 1
    }
    if (cursor.classList.contains("ps-algorithmic")) {
      break
    }
    cursor = cursor.parentElement
  }

  return Math.max(0, depth - 1)
}

function extractStructuredLinesFromMarkup(markup: string) {
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    throw new Error("导出仅支持在浏览器环境执行。")
  }

  const parser = new window.DOMParser()
  const parsed = parser.parseFromString(`<div>${markup}</div>`, "text/html")
  const codeNodes = Array.from(parsed.querySelectorAll(".ps-line.ps-code"))
  const fallbackNodes =
    codeNodes.length > 0
      ? codeNodes
      : Array.from(parsed.querySelectorAll(".ps-algorithmic .ps-line"))

  if (fallbackNodes.length === 0) {
    throw new Error("伪代码结构解析失败，无法导出。")
  }

  const lines = fallbackNodes
    .map((node) => {
      const clone = node.cloneNode(true) as HTMLElement
      clone.querySelectorAll(".ps-linenum, .katex-mathml, script, style").forEach((item) => {
        item.remove()
      })
      clone.querySelectorAll("*").forEach((element) => {
        element.removeAttribute("id")
      })

      const text = normalizeLineText(clone.textContent || "")
      if (!text) {
        return null
      }

      const line: PseudoCodeStructuredLine = {
        text,
        indentDepth: resolveLineIndentDepth(node),
      }
      return line
    })
    .filter((line): line is PseudoCodeStructuredLine => Boolean(line))

  if (lines.length === 0) {
    throw new Error("伪代码结构解析失败，无法导出。")
  }

  return lines
}

export async function resolvePseudoCodeStructuredLines(document: PseudoCodeDocument) {
  const markup = await renderPseudoCodeMarkupStrict({
    source: document.source,
    title: document.title,
    renderConfig: document.renderConfig,
  })

  return extractStructuredLinesFromMarkup(markup)
}
