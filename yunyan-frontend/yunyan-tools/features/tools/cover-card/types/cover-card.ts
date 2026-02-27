export type CoverCardAspectRatio = "16:9" | "4:3" | "1:1" | "3:4" | "9:16"

export type CoverCardThemeId =
  | "aurora-night"
  | "sunrise-editorial"
  | "forest-notice"
  | "ink-minimal"

export type CoverCardExportFormat = "png" | "jpg"
export type CoverCardQualityMode = "fast" | "balanced" | "high"

export interface CoverCardVariant {
  id: string
  label: string
  document: CoverCardDocument
  imageUrl?: string
  thumbnailUrl?: string
  seed?: number
  modelId?: string
  latencyMs?: number
  score?: number
}

export interface CoverCardModelOption {
  id: string
  label: string
  provider: string
  description?: string
}

export interface CoverCardGenerationConfig {
  modelId: string
  provider: string
  negativePrompt: string
  seed?: number
  quality: CoverCardQualityMode
}

export interface CoverCardCapability {
  models: CoverCardModelOption[]
  defaultModelId: string
  maxVariants: number
  maxWidth: number
  maxHeight: number
  supportedRatios: CoverCardAspectRatio[]
  supportsJobFlow: boolean
  pollIntervalMs: number
  maxPollAttempts: number
}

export interface CoverCardGenerateMeta {
  requestId: string
  configHash: string
  modelId: string
  provider: string
  latencyMs: number
  capabilitySource: "local" | "remote"
  jobId?: string
  pollCount?: number
  fallbackUsed?: boolean
}

export interface CoverCardThemeStyle {
  id: CoverCardThemeId
  label: string
  headline: string
  backgroundFrom: string
  backgroundTo: string
  backgroundGlow: string
  cardOverlay: string
  titleColor: string
  subtitleColor: string
  descriptionColor: string
  footerColor: string
  badgeBg: string
  badgeText: string
  strokeColor: string
}

export interface CoverCardDocument {
  prompt: string
  title: string
  subtitle: string
  description: string
  footer: string
  badges: string[]
  themeId: CoverCardThemeId
  ratio: CoverCardAspectRatio
  width: number
  height: number
}

export interface CoverCardGenerateRequest {
  prompt: string
  ratio: CoverCardAspectRatio
  width: number
  height: number
  themeId?: CoverCardThemeId
  count?: number
  config?: Partial<CoverCardGenerationConfig>
  requestId?: string
}

export interface CoverCardGenerateResponse {
  variants: CoverCardVariant[]
  selectedVariantId: string
  source: "local" | "remote"
  message?: string
  meta?: CoverCardGenerateMeta
}

export interface CoverCardExportRequest {
  document: CoverCardDocument
  format: CoverCardExportFormat
  quality?: number
  variantId?: string
  requestId?: string
}

export interface CoverCardExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat: CoverCardExportFormat
  message?: string
}
