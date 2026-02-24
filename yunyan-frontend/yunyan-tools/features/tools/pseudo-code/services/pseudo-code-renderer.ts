import type { PseudoCodeRenderConfig } from "@/features/tools/pseudo-code/types/pseudo-code"

interface RenderPseudoCodeParams {
  source: string
  title: string
  renderConfig: PseudoCodeRenderConfig
}

interface RenderPseudoCodeResult {
  markup: string
  error?: string
}

function escapePseudoCodeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/([{}$%&#_])/g, "\\$1")
}

function normalizeInputSource(source: string, title: string) {
  const trimmed = (source || "").trim()
  if (!trimmed) {
    return ""
  }

  if (/\\begin\{algorithmic\}/.test(trimmed)) {
    return trimmed
  }

  if (/\\begin\{algorithm\}/.test(trimmed)) {
    return trimmed
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const states = lines
    .map((line) => `\\STATE ${escapePseudoCodeText(line)}`)
    .join("\n")
  const safeTitle = escapePseudoCodeText(title || "Algorithm")

  return `\\begin{algorithm}
\\caption{${safeTitle}}
\\begin{algorithmic}
${states}
\\end{algorithmic}
\\end{algorithm}`
}

function toIndentEm(indentSize: number) {
  const value = Math.max(1, Math.min(6, Math.round(indentSize)))
  return `${(value * 0.6).toFixed(2)}em`
}

interface PseudoCodeRendererModule {
  renderToString: (
    source: string,
    options: {
      lineNumber: boolean
      noEnd: boolean
      lineNumberPunc: string
      commentDelimiter: string
      indentSize: string
      captionCount: number
      titlePrefix: string
    }
  ) => string
}

let pseudocodeModulePromise: Promise<PseudoCodeRendererModule> | null = null

async function loadPseudocodeModule() {
  if (!pseudocodeModulePromise) {
    pseudocodeModulePromise = import("pseudocode")
      .then((module) => (module.default || module) as PseudoCodeRendererModule)
      .catch((error) => {
        pseudocodeModulePromise = null
        throw error
      })
  }

  return pseudocodeModulePromise
}

export async function renderPseudoCodeMarkup({
  source,
  title,
  renderConfig,
}: RenderPseudoCodeParams): Promise<RenderPseudoCodeResult> {
  const normalized = normalizeInputSource(source, title)
  if (!normalized) {
    return {
      markup: "",
      error: "暂无可渲染内容。",
    }
  }

  try {
    const pseudocode = await loadPseudocodeModule()
    const markup = pseudocode.renderToString(normalized, {
      lineNumber: renderConfig.showLineNumber,
      noEnd: renderConfig.hideEndKeywords,
      lineNumberPunc: renderConfig.lineNumberPunc || ".",
      commentDelimiter: renderConfig.commentDelimiter || "//",
      indentSize: toIndentEm(renderConfig.indentSize),
      captionCount: renderConfig.titleCounter,
      titlePrefix: renderConfig.titlePrefix,
    }) as string

    return { markup }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "渲染失败，请检查伪代码语法。"
    return {
      markup: "",
      error: message,
    }
  }
}
