import type {
  CoverCardAspectRatio,
  CoverCardCapability,
  CoverCardDocument,
  CoverCardGenerationConfig,
  CoverCardExportFormat,
  CoverCardModelOption,
  CoverCardQualityMode,
  CoverCardThemeId,
  CoverCardThemeStyle,
} from "@/features/tools/cover-card/types/cover-card"

export const COVER_CARD_TITLE = "AI图片卡片生成"
export const COVER_CARD_DESCRIPTION =
  "输入提示词快速生成视觉封面卡片，支持尺寸控制与PNG/JPG导出。"

export const coverCardDefaultPrompt =
  "科技感十足的产品发布会封面，强调创新、速度与专业品牌调性。"

export const coverCardDimensionLimits = {
  minWidth: 200,
  maxWidth: 1200,
  minHeight: 150,
  maxHeight: 800,
} as const

export const coverCardVariantLimits = {
  min: 1,
  max: 4,
  defaultPrimary: 1,
  expanded: 4,
} as const

export const coverCardRatioOptions: Array<{ value: CoverCardAspectRatio; label: string }> = [
  { value: "16:9", label: "16:9  横向展示" },
  { value: "4:3", label: "4:3  标准比例" },
  { value: "1:1", label: "1:1  正方构图" },
  { value: "3:4", label: "3:4  竖向海报" },
  { value: "9:16", label: "9:16  竖屏封面" },
]

export const coverCardExportFormatOptions: Array<{
  value: CoverCardExportFormat
  label: string
}> = [
  { value: "png", label: "PNG（无损）" },
  { value: "jpg", label: "JPG（更小体积）" },
]

export const coverCardQualityOptions: Array<{
  value: CoverCardQualityMode
  label: string
  hint: string
}> = [
  { value: "fast", label: "极速", hint: "优先响应速度" },
  { value: "balanced", label: "均衡", hint: "速度与质量平衡" },
  { value: "high", label: "高质量", hint: "细节更丰富，耗时更长" },
]

export const coverCardModelOptions: CoverCardModelOption[] = [
  {
    id: "anqstar-image-lite",
    label: "Anqstar Lite",
    provider: "anqstar",
    description: "默认通用封面模型",
  },
  {
    id: "anqstar-image-pro",
    label: "Anqstar Pro",
    provider: "anqstar",
    description: "高质量细节渲染模型",
  },
]

export const coverCardDefaultGenerationConfig: CoverCardGenerationConfig = {
  modelId: coverCardModelOptions[0]?.id || "anqstar-image-lite",
  provider: coverCardModelOptions[0]?.provider || "anqstar",
  negativePrompt: "",
  quality: "balanced",
}

export const coverCardThemeStyles: Record<CoverCardThemeId, CoverCardThemeStyle> = {
  "aurora-night": {
    id: "aurora-night",
    label: "极光夜幕",
    headline: "AURORA",
    backgroundFrom: "#0f1c3f",
    backgroundTo: "#1f6b9b",
    backgroundGlow: "#7ce2ff",
    cardOverlay: "rgba(6, 18, 46, 0.58)",
    titleColor: "#f8fcff",
    subtitleColor: "#d7eafe",
    descriptionColor: "#bdd6ef",
    footerColor: "#9dbad6",
    badgeBg: "rgba(124, 226, 255, 0.18)",
    badgeText: "#c8f3ff",
    strokeColor: "rgba(153, 216, 255, 0.45)",
  },
  "sunrise-editorial": {
    id: "sunrise-editorial",
    label: "日出刊物",
    headline: "EDITORIAL",
    backgroundFrom: "#4e2c1b",
    backgroundTo: "#d67a3d",
    backgroundGlow: "#ffd8a0",
    cardOverlay: "rgba(43, 23, 13, 0.42)",
    titleColor: "#fff8ef",
    subtitleColor: "#ffe5c6",
    descriptionColor: "#f8d8af",
    footerColor: "#f0c998",
    badgeBg: "rgba(255, 229, 198, 0.2)",
    badgeText: "#fff0dc",
    strokeColor: "rgba(255, 235, 208, 0.5)",
  },
  "forest-notice": {
    id: "forest-notice",
    label: "森林公告",
    headline: "NOTICE",
    backgroundFrom: "#0e3b30",
    backgroundTo: "#2c8b65",
    backgroundGlow: "#9cf8c5",
    cardOverlay: "rgba(8, 32, 25, 0.52)",
    titleColor: "#f3fff7",
    subtitleColor: "#d3ffe8",
    descriptionColor: "#b8efd7",
    footerColor: "#9fd9be",
    badgeBg: "rgba(156, 248, 197, 0.18)",
    badgeText: "#dffff1",
    strokeColor: "rgba(191, 255, 223, 0.45)",
  },
  "ink-minimal": {
    id: "ink-minimal",
    label: "墨黑极简",
    headline: "MINIMAL",
    backgroundFrom: "#171a1f",
    backgroundTo: "#363c46",
    backgroundGlow: "#9ca8b8",
    cardOverlay: "rgba(14, 16, 19, 0.58)",
    titleColor: "#f4f7fb",
    subtitleColor: "#d7dfe9",
    descriptionColor: "#bac5d3",
    footerColor: "#a0adbe",
    badgeBg: "rgba(201, 214, 232, 0.16)",
    badgeText: "#e9eef5",
    strokeColor: "rgba(221, 230, 242, 0.42)",
  },
}

export const coverCardThemeOptions = Object.values(coverCardThemeStyles).map(
  (item) => ({
    value: item.id,
    label: item.label,
  })
)

export const coverCardSamplePrompts = [
  "科技感十足的产品发布会封面，突出创新与速度。",
  "文艺风格咖啡馆品牌宣传卡片，强调温暖与质感。",
  "动漫风格游戏角色介绍封面，突出热血和成长。",
  "高校项目答辩封面，要求正式、简洁、信息清晰。",
  "毕业设计展板封面，突出课题关键词和导师信息。",
]

export const coverCardPreviewChecklist = [
  "默认生成1张主卡，突出核心封面内容",
  "支持再生成3张候选方案，便于快速对比",
  "支持主卡2.5D轻渲染预览，视觉层次更清晰",
  "支持宽高比例联动与PNG/JPG导出",
  "已预留后端LLM批量生图的标准接入位",
]

export const coverCardGuideSteps = [
  "输入提示词描述你希望展示的风格、场景与主题。",
  "设置卡片尺寸、比例与主题模板，确认导出格式。",
  "先生成主卡，再按需补充3张候选并切换主卡。",
  "在右侧主卡预览中确认版式后导出当前选中卡片。",
]

export const coverCardFaqItems: Array<{ question: string; answer: string }> = [
  {
    question: "可以只调整尺寸不改内容吗？",
    answer:
      "可以。尺寸、比例与主题为独立参数，你可以在保留文案的情况下单独调整视觉布局。",
  },
  {
    question: "导出图片模糊怎么办？",
    answer:
      "导出走高分辨率Canvas渲染，建议宽度不低于800像素；如用于打印可继续增大尺寸后导出。",
  },
  {
    question: "后续如何接入真实后端？",
    answer:
      "模块已统一为 variants 数据结构，后端可直接返回 1 到 4 张候选卡片并指定主卡ID。",
  },
  {
    question: "为什么有时标题会比较短？",
    answer:
      "本地算法会优先保证可读性，避免长标题挤压布局；你可以在提示词中明确主标题关键词。",
  },
]

export const coverCardKeywordList = [
  "AI图片卡片生成",
  "封面卡片设计",
  "在线卡片导出",
  "PNG JPG导出",
  "项目封面模板",
  "课程作业封面",
]

export const coverCardSeoParagraph =
  "AI图片卡片生成工具可根据提示词快速构建高质量封面视觉，支持尺寸比例联动与主题模板切换，适用于课程作业封面、项目展示页、活动海报头图等场景。"

export const coverCardDefaultCapability: CoverCardCapability = {
  models: coverCardModelOptions,
  defaultModelId: coverCardDefaultGenerationConfig.modelId,
  maxVariants: coverCardVariantLimits.max,
  maxWidth: coverCardDimensionLimits.maxWidth,
  maxHeight: coverCardDimensionLimits.maxHeight,
  supportedRatios: coverCardRatioOptions.map((item) => item.value),
  supportsJobFlow: true,
  pollIntervalMs: 1200,
  maxPollAttempts: 15,
}

export const coverCardPreviewDocument: CoverCardDocument = {
  prompt: coverCardDefaultPrompt,
  title: "产品发布会",
  subtitle: "Innovation Sprint 2026",
  description:
    "聚焦创新体验与产品价值表达，统一视觉语言，突出时间、地点与核心卖点。",
  footer: "ANQSTAR STUDIO · COVER CARD",
  badges: ["科技感", "发布会", "品牌表达"],
  themeId: "aurora-night",
  ratio: "16:9",
  width: 960,
  height: 540,
}
