import {
  coverCardDefaultPrompt,
  coverCardDefaultGenerationConfig,
  coverCardDimensionLimits,
  coverCardPreviewDocument,
  coverCardThemeStyles,
  coverCardVariantLimits,
} from "@/features/tools/cover-card/constants/cover-card-config"
import type {
  CoverCardAspectRatio,
  CoverCardGenerationConfig,
  CoverCardDocument,
  CoverCardThemeId,
  CoverCardVariant,
} from "@/features/tools/cover-card/types/cover-card"

const ratioValueMap: Record<CoverCardAspectRatio, number> = {
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "3:4": 3 / 4,
  "9:16": 9 / 16,
}

const keywordPool: Array<{ keyword: RegExp; label: string }> = [
  { keyword: /科技|技术|发布|创新|产品|数字|系统/iu, label: "科技感" },
  { keyword: /文艺|咖啡|品牌|故事|温暖|生活/iu, label: "文艺风" },
  { keyword: /游戏|动漫|角色|热血|冒险/iu, label: "动漫向" },
  { keyword: /毕业|论文|答辩|课程|课设|高校/iu, label: "学术场景" },
  { keyword: /招聘|招新|活动|宣传|海报/iu, label: "活动传播" },
]

const coverCardThemeIdList = Object.keys(coverCardThemeStyles) as CoverCardThemeId[]

function sanitizeInline(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function ensurePrompt(prompt: string) {
  const normalized = sanitizeInline(prompt)
  return normalized || coverCardDefaultPrompt
}

function splitPromptSentences(prompt: string) {
  return ensurePrompt(prompt)
    .split(/[，。；;,.!！？]/)
    .map((item) => sanitizeInline(item))
    .filter(Boolean)
}

function removeLeadingVerbs(value: string) {
  return value
    .replace(/^请(你|帮我|为我)?/u, "")
    .replace(/^(生成|制作|创建|输出|设计)(一张|一个|一份)?/u, "")
    .trim()
}

function truncateText(value: string, maxLength: number) {
  const normalized = sanitizeInline(value)
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`
}

function computePromptHash(prompt: string) {
  return Array.from(prompt).reduce((sum, char, index) => {
    return sum + char.charCodeAt(0) * (index + 1)
  }, 0)
}

function pickThemeId(prompt: string) {
  const hash = computePromptHash(prompt)
  return coverCardThemeIdList[hash % coverCardThemeIdList.length] || coverCardPreviewDocument.themeId
}

function buildThemeQueue(prompt: string, preferredThemeId?: CoverCardThemeId) {
  const hash = computePromptHash(prompt)
  const startIndex = hash % coverCardThemeIdList.length
  const rotated = [
    ...coverCardThemeIdList.slice(startIndex),
    ...coverCardThemeIdList.slice(0, startIndex),
  ]

  const mainTheme =
    preferredThemeId && coverCardThemeStyles[preferredThemeId]
      ? preferredThemeId
      : rotated[0] || coverCardPreviewDocument.themeId

  const rest = rotated.filter((item) => item !== mainTheme)
  return [mainTheme, ...rest]
}

function buildBadges(prompt: string) {
  const matched: string[] = []

  keywordPool.forEach((item) => {
    if (item.keyword.test(prompt)) {
      matched.push(item.label)
    }
  })

  if (matched.length === 0) {
    matched.push("视觉卡片", "封面生成")
  }

  return matched.slice(0, 4)
}

function buildTitle(prompt: string) {
  const segments = splitPromptSentences(prompt)
  const first = removeLeadingVerbs(segments[0] || "")
  if (!first) {
    return coverCardPreviewDocument.title
  }

  return truncateText(first, 20)
}

function buildSubtitle(prompt: string) {
  const segments = splitPromptSentences(prompt)
  const second = segments[1]
  if (second) {
    return truncateText(second, 30)
  }

  const tokens = buildBadges(prompt)
  return `${tokens.join(" · ")} · 视觉封面`
}

function buildDescription(prompt: string) {
  const base = ensurePrompt(prompt)
  return truncateText(base, 72)
}

function buildFooter() {
  const dateToken = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, "-")

  return `COVER CARD · ${dateToken}`
}

export function resolveCoverCardRatioValue(ratio: CoverCardAspectRatio) {
  return ratioValueMap[ratio]
}

export function clampCoverCardWidth(width: number) {
  return clamp(width, coverCardDimensionLimits.minWidth, coverCardDimensionLimits.maxWidth)
}

export function clampCoverCardHeight(height: number) {
  return clamp(
    height,
    coverCardDimensionLimits.minHeight,
    coverCardDimensionLimits.maxHeight
  )
}

export function getCoverCardHeightByRatio(width: number, ratio: CoverCardAspectRatio) {
  const ratioValue = resolveCoverCardRatioValue(ratio)
  const height = Math.round(clampCoverCardWidth(width) / ratioValue)
  return clampCoverCardHeight(height)
}

export function getCoverCardWidthByRatio(height: number, ratio: CoverCardAspectRatio) {
  const ratioValue = resolveCoverCardRatioValue(ratio)
  const width = Math.round(clampCoverCardHeight(height) * ratioValue)
  return clampCoverCardWidth(width)
}

export function normalizeCoverCardVariantCount(count: number | undefined) {
  if (!Number.isFinite(count)) {
    return coverCardVariantLimits.defaultPrimary
  }

  return clamp(
    Math.round(Number(count)),
    coverCardVariantLimits.min,
    coverCardVariantLimits.max
  )
}

export function createCoverCardVariantId(index: number) {
  return `variant-${index + 1}`
}

export function createCoverCardVariantLabel(index: number) {
  if (index === 0) {
    return "主卡"
  }
  return `候选 ${index}`
}

export function normalizeCoverCardDocument(document: CoverCardDocument): CoverCardDocument {
  const prompt = ensurePrompt(document.prompt)
  const ratio = document.ratio
  const width = clampCoverCardWidth(document.width)
  const height = clampCoverCardHeight(document.height)
  const themeId = coverCardThemeStyles[document.themeId]
    ? document.themeId
    : coverCardPreviewDocument.themeId

  const title = truncateText(document.title, 24) || buildTitle(prompt)
  const subtitle = truncateText(document.subtitle, 36) || buildSubtitle(prompt)
  const description = truncateText(document.description, 120) || buildDescription(prompt)
  const footer = truncateText(document.footer, 40) || buildFooter()
  const badges = document.badges
    .map((item) => truncateText(item, 10))
    .filter(Boolean)
    .slice(0, 4)

  return {
    prompt,
    title,
    subtitle,
    description,
    footer,
    badges: badges.length > 0 ? badges : buildBadges(prompt),
    themeId,
    ratio,
    width,
    height,
  }
}

interface BuildCoverCardFromPromptParams {
  prompt: string
  ratio: CoverCardAspectRatio
  width: number
  height: number
  themeId?: CoverCardThemeId
}

export function buildCoverCardFromPrompt({
  prompt,
  ratio,
  width,
  height,
  themeId,
}: BuildCoverCardFromPromptParams): CoverCardDocument {
  const normalizedPrompt = ensurePrompt(prompt)
  return normalizeCoverCardDocument({
    prompt: normalizedPrompt,
    title: buildTitle(normalizedPrompt),
    subtitle: buildSubtitle(normalizedPrompt),
    description: buildDescription(normalizedPrompt),
    footer: buildFooter(),
    badges: buildBadges(normalizedPrompt),
    themeId: themeId || pickThemeId(normalizedPrompt),
    ratio,
    width,
    height,
  })
}

interface BuildDraftCoverCardDocumentParams {
  prompt: string
  ratio: CoverCardAspectRatio
  width: number
  height: number
  themeId: CoverCardThemeId
}

export function buildDraftCoverCardDocument({
  prompt,
  ratio,
  width,
  height,
  themeId,
}: BuildDraftCoverCardDocumentParams): CoverCardDocument {
  const base = buildCoverCardFromPrompt({
    prompt,
    ratio,
    width,
    height,
    themeId,
  })

  return {
    ...base,
    themeId,
  }
}

interface BuildCoverCardVariantsParams {
  prompt: string
  ratio: CoverCardAspectRatio
  width: number
  height: number
  themeId?: CoverCardThemeId
  count?: number
  config?: Partial<CoverCardGenerationConfig>
}

export function normalizeCoverCardGenerationConfig(
  config: Partial<CoverCardGenerationConfig> | undefined
): CoverCardGenerationConfig {
  return {
    modelId: config?.modelId || coverCardDefaultGenerationConfig.modelId,
    provider: config?.provider || coverCardDefaultGenerationConfig.provider,
    negativePrompt:
      typeof config?.negativePrompt === "string" ? config.negativePrompt.trim() : "",
    quality: config?.quality || coverCardDefaultGenerationConfig.quality,
    seed: Number.isFinite(config?.seed) ? Number(config?.seed) : undefined,
  }
}

export function buildCoverCardVariantsFromPrompt({
  prompt,
  ratio,
  width,
  height,
  themeId,
  count,
  config,
}: BuildCoverCardVariantsParams): CoverCardVariant[] {
  const normalizedPrompt = ensurePrompt(prompt)
  const variantCount = normalizeCoverCardVariantCount(count)
  const themeQueue = buildThemeQueue(normalizedPrompt, themeId)
  const normalizedConfig = normalizeCoverCardGenerationConfig(config)

  return Array.from({ length: variantCount }, (_, index) => {
    const variantThemeId = themeQueue[index] || themeQueue[0] || coverCardPreviewDocument.themeId
    const variantPrompt =
      index === 0 ? normalizedPrompt : `${normalizedPrompt}；强调差异化视觉方向 ${index + 1}`

    const baseDocument = buildCoverCardFromPrompt({
      prompt: variantPrompt,
      ratio,
      width,
      height,
      themeId: variantThemeId,
    })

    const variantDocument = normalizeCoverCardDocument({
      ...baseDocument,
      prompt: normalizedPrompt,
      footer:
        index === 0
          ? baseDocument.footer
          : `${baseDocument.footer} · V${index + 1}`,
      badges:
        index === 0
          ? baseDocument.badges
          : [`方案${index + 1}`, ...baseDocument.badges].slice(0, 4),
    })

    return {
      id: createCoverCardVariantId(index),
      label: createCoverCardVariantLabel(index),
      document: variantDocument,
      seed:
        typeof normalizedConfig.seed === "number"
          ? normalizedConfig.seed + index
          : undefined,
      modelId: normalizedConfig.modelId,
    }
  })
}

export function buildDraftCoverCardVariant(params: BuildDraftCoverCardDocumentParams): CoverCardVariant {
  return {
    id: createCoverCardVariantId(0),
    label: createCoverCardVariantLabel(0),
    document: buildDraftCoverCardDocument(params),
  }
}

export function resolveCoverCardTheme(themeId: CoverCardThemeId) {
  return coverCardThemeStyles[themeId] || coverCardThemeStyles[coverCardPreviewDocument.themeId]
}

export function isCoverCardThemeId(value: unknown): value is CoverCardThemeId {
  return typeof value === "string" && value in coverCardThemeStyles
}
