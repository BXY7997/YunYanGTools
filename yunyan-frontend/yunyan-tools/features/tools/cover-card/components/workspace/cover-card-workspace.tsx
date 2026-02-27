"use client"

import * as React from "react"
import {
  Download,
  Layers,
  Loader2,
  RefreshCcw,
  Wand2,
} from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { useWorkspaceHeaderStatus } from "@/components/tools/tools-shell"
import { ToolWorkspaceShell } from "@/features/tools/shared/components/tool-workspace-shell"
import {
  ToolConfigSummary,
  ToolNoticeSlot,
} from "@/features/tools/shared/components/tool-workspace-primitives"
import {
  ToolAiGeneratedDisclaimer,
  ToolChecklistCard,
  ToolPromoNotice,
  ToolSectionHeading,
  ToolWorkspaceHero,
} from "@/features/tools/shared/components/tool-workspace-modules"
import { toolDraftSchemaVersions } from "@/features/tools/shared/constants/draft-schema"
import { smartDocPromoContent } from "@/features/tools/shared/constants/tool-promo"
import { toolTelemetryActions } from "@/features/tools/shared/constants/tool-telemetry"
import {
  resolveWorkspaceSourceLabel,
  toolWorkspaceCopy,
  withNoticeDetail,
} from "@/features/tools/shared/constants/tool-copy"
import { toolsLayoutTokens } from "@/features/tools/shared/constants/tools-layout-tokens"
import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { resolveToolWorkspaceModules } from "@/features/tools/shared/constants/workspace-modules"
import { useLocalDraftState } from "@/features/tools/shared/hooks/use-local-draft"
import { trackToolEvent } from "@/features/tools/shared/services/tool-telemetry"
import {
  COVER_CARD_DESCRIPTION,
  COVER_CARD_TITLE,
  coverCardDefaultCapability,
  coverCardDefaultGenerationConfig,
  coverCardDimensionLimits,
  coverCardExportFormatOptions,
  coverCardQualityOptions,
  coverCardPreviewChecklist,
  coverCardPreviewDocument,
  coverCardRatioOptions,
  coverCardSamplePrompts,
  coverCardThemeOptions,
  coverCardVariantLimits,
} from "@/features/tools/cover-card/constants/cover-card-config"
import { CoverCardFooter } from "@/features/tools/cover-card/components/workspace/sections/cover-card-footer"
import {
  exportCoverCardImage,
  getCoverCardCapabilities,
  generateCoverCardData,
} from "@/features/tools/cover-card/services/cover-card-api"
import { getCoverCardExportPrecheckNotices } from "@/features/tools/cover-card/services/cover-card-export-precheck"
import { triggerCoverCardImageDownload } from "@/features/tools/cover-card/services/cover-card-image-export"
import {
  buildDraftCoverCardVariant,
  normalizeCoverCardDocument,
  resolveCoverCardTheme,
} from "@/features/tools/cover-card/services/cover-card-model"
import type {
  CoverCardAspectRatio,
  CoverCardCapability,
  CoverCardDocument,
  CoverCardExportFormat,
  CoverCardQualityMode,
  CoverCardThemeId,
  CoverCardVariant,
} from "@/features/tools/cover-card/types/cover-card"
import { cn } from "@/lib/utils"
import type { ToolMenuLinkItem } from "@/types/tools"

interface CoverCardWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

type NoticeTone = "info" | "success" | "error"
type LoadingState = "generate-main" | "generate-variants" | "export" | null

interface NoticeState {
  tone: NoticeTone
  text: string
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function resolveRatioNumber(ratio: CoverCardAspectRatio) {
  const [widthPart, heightPart] = ratio.split(":")
  const width = Number(widthPart)
  const height = Number(heightPart)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 1
  }
  return width / height
}

function resolveRatioDimensionBounds(
  ratio: CoverCardAspectRatio,
  capabilityMaxWidth: number,
  capabilityMaxHeight: number
) {
  const ratioValue = resolveRatioNumber(ratio)
  const widthMin = Math.max(
    coverCardDimensionLimits.minWidth,
    Math.ceil(coverCardDimensionLimits.minHeight * ratioValue)
  )
  const widthMax = Math.min(capabilityMaxWidth, Math.floor(capabilityMaxHeight * ratioValue))
  const heightMin = Math.max(
    coverCardDimensionLimits.minHeight,
    Math.ceil(coverCardDimensionLimits.minWidth / ratioValue)
  )
  const heightMax = Math.min(
    capabilityMaxHeight,
    Math.floor(capabilityMaxWidth / ratioValue)
  )

  if (widthMin > widthMax || heightMin > heightMax) {
    return {
      widthMin: coverCardDimensionLimits.minWidth,
      widthMax: capabilityMaxWidth,
      heightMin: coverCardDimensionLimits.minHeight,
      heightMax: capabilityMaxHeight,
    }
  }

  return {
    widthMin,
    widthMax,
    heightMin,
    heightMax,
  }
}

function parseDimensionInput(value: string, fallback: number, min: number, max: number) {
  const next = Number(value)
  if (!Number.isFinite(next)) {
    return fallback
  }
  return clampInteger(next, min, max)
}

function resolvePreviewStageWidthClass(ratioValue: number) {
  if (ratioValue <= 0.65) {
    return "max-w-[220px] sm:max-w-[260px] md:max-w-[300px]"
  }
  if (ratioValue <= 0.85) {
    return "max-w-[280px] sm:max-w-[330px] md:max-w-[380px]"
  }
  if (ratioValue <= 1.1) {
    return "max-w-[340px] sm:max-w-[400px] md:max-w-[460px]"
  }
  return "max-w-full"
}

function CoverCardField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="space-y-1.5">
      <div className="space-y-0.5">
        <p className="text-xs font-semibold tracking-wide text-foreground/90">{label}</p>
        {hint ? <p className="text-[11px] leading-4 text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </label>
  )
}

function CoverCardPreview({
  document,
  compact = false,
  className,
}: {
  document: CoverCardDocument
  compact?: boolean
  className?: string
}) {
  const theme = resolveCoverCardTheme(document.themeId)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 shadow-[0_20px_50px_-26px_rgba(16,24,40,0.6)] transition-all duration-300 ease-out",
        className
      )}
      style={{
        aspectRatio: `${document.width}/${document.height}`,
        background: `linear-gradient(135deg, ${theme.backgroundFrom}, ${theme.backgroundTo})`,
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute rounded-full blur-3xl",
          compact
            ? "left-[-22%] top-[-34%] h-[62%] w-[70%]"
            : "left-[-18%] top-[-26%] h-[58%] w-[62%]"
        )}
        style={{ background: theme.backgroundGlow, opacity: 0.28 }}
      />

      <div
        className={cn("absolute overflow-hidden rounded-[1.2rem]", compact ? "inset-[7%]" : "inset-[8%]")}
        style={{ background: theme.cardOverlay }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ border: `1px solid ${theme.strokeColor}` }} />

        <div className={cn("relative z-[1] flex h-full flex-col", compact ? "gap-1.5 p-2.5" : "gap-3 p-4 md:p-5")}>
          <div className="flex flex-wrap gap-1">
            {document.badges.slice(0, compact ? 2 : 4).map((badge) => (
              <span
                key={`${badge}-${document.themeId}`}
                className={cn(
                  "rounded-full font-semibold",
                  compact ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
                )}
                style={{
                  background: theme.badgeBg,
                  color: theme.badgeText,
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          <div className={cn(compact ? "mt-1 space-y-1" : "mt-2 space-y-2")}>
            <h3
              className={cn(
                "font-['Noto_Serif_SC','STZhongsong','Songti_SC',serif] font-semibold leading-tight tracking-wide",
                compact ? "line-clamp-2 text-[13px]" : "text-2xl md:text-3xl"
              )}
              style={{ color: theme.titleColor }}
            >
              {document.title}
            </h3>
            <p
              className={cn(
                "font-['Source_Han_Serif_SC','STSong',serif]",
                compact ? "line-clamp-1 text-[10px] leading-4" : "text-sm leading-6 md:text-base"
              )}
              style={{ color: theme.subtitleColor }}
            >
              {document.subtitle}
            </p>
            {!compact ? (
              <p className="text-xs leading-6 md:text-sm" style={{ color: theme.descriptionColor }}>
                {document.description}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "mt-auto flex items-end justify-between",
              compact ? "gap-1 text-[9px] tracking-[0.08em]" : "gap-2 text-[10px] tracking-[0.16em] md:text-[11px]"
            )}
          >
            <span className="truncate uppercase" style={{ color: theme.footerColor }}>
              {document.footer}
            </span>
            <span className="uppercase" style={{ color: theme.footerColor }}>
              {theme.headline}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CoverCardWorkspace({ tool, groupTitle }: CoverCardWorkspaceProps) {
  const { setWorkspaceHeaderStatus } = useWorkspaceHeaderStatus()

  const workspaceModules = React.useMemo(
    () => resolveToolWorkspaceModules(tool.route),
    [tool.route]
  )

  const promptDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:cover-card:prompt:v1",
    initialValue: coverCardPreviewDocument.prompt,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const ratioDraft = useLocalDraftState<CoverCardAspectRatio>({
    storageKey: "tools:draft:cover-card:ratio:v1",
    initialValue: coverCardPreviewDocument.ratio,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const widthDraft = useLocalDraftState<number>({
    storageKey: "tools:draft:cover-card:width:v1",
    initialValue: coverCardPreviewDocument.width,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const heightDraft = useLocalDraftState<number>({
    storageKey: "tools:draft:cover-card:height:v1",
    initialValue: coverCardPreviewDocument.height,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const themeDraft = useLocalDraftState<CoverCardThemeId>({
    storageKey: "tools:draft:cover-card:theme:v1",
    initialValue: coverCardPreviewDocument.themeId,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const exportFormatDraft = useLocalDraftState<CoverCardExportFormat>({
    storageKey: "tools:draft:cover-card:format:v1",
    initialValue: "png",
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const lockRatioDraft = useLocalDraftState<boolean>({
    storageKey: "tools:draft:cover-card:lock-ratio:v1",
    initialValue: true,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const modelIdDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:cover-card:model-id:v1",
    initialValue: coverCardDefaultGenerationConfig.modelId,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const qualityDraft = useLocalDraftState<CoverCardQualityMode>({
    storageKey: "tools:draft:cover-card:quality:v1",
    initialValue: coverCardDefaultGenerationConfig.quality,
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const negativePromptDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:cover-card:negative-prompt:v1",
    initialValue: "",
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })
  const seedDraft = useLocalDraftState<string>({
    storageKey: "tools:draft:cover-card:seed:v1",
    initialValue: "",
    schemaVersion: toolDraftSchemaVersions.coverCard,
  })

  const prompt = promptDraft.value
  const ratio = ratioDraft.value
  const width = widthDraft.value
  const height = heightDraft.value
  const themeId = themeDraft.value
  const exportFormat = exportFormatDraft.value
  const lockRatio = lockRatioDraft.value
  const modelId = modelIdDraft.value
  const quality = qualityDraft.value
  const negativePrompt = negativePromptDraft.value
  const seedText = seedDraft.value

  const setPrompt = promptDraft.setValue
  const setRatio = ratioDraft.setValue
  const setWidth = widthDraft.setValue
  const setHeight = heightDraft.setValue
  const setThemeId = themeDraft.setValue
  const setExportFormat = exportFormatDraft.setValue
  const setLockRatio = lockRatioDraft.setValue
  const setModelId = modelIdDraft.setValue
  const setQuality = qualityDraft.setValue
  const setNegativePrompt = negativePromptDraft.setValue
  const setSeedText = seedDraft.setValue

  const [generatedVariants, setGeneratedVariants] = React.useState<CoverCardVariant[]>([])
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<NoticeState>({
    tone: "info",
    text: toolWorkspaceCopy.coverCard.initialNotice,
  })
  const [source, setSource] = React.useState<"local" | "remote" | null>(null)
  const [capabilitySource, setCapabilitySource] = React.useState<"local" | "remote">("local")
  const [capabilityHint, setCapabilityHint] = React.useState("")
  const [capability, setCapability] = React.useState<CoverCardCapability>(
    coverCardDefaultCapability
  )
  const [savedAt, setSavedAt] = React.useState(() => new Date())
  const [loading, setLoading] = React.useState<LoadingState>(null)
  const [stageTilt, setStageTilt] = React.useState({ x: 0, y: 0 })

  const abortRef = React.useRef<AbortController | null>(null)

  const draftVariant = React.useMemo(
    () =>
      buildDraftCoverCardVariant({
        prompt,
        ratio,
        width,
        height,
        themeId,
      }),
    [height, prompt, ratio, themeId, width]
  )

  const variants = React.useMemo(
    () => (generatedVariants.length > 0 ? generatedVariants : [draftVariant]),
    [draftVariant, generatedVariants]
  )

  const selectedVariant = React.useMemo(() => {
    if (selectedVariantId) {
      const matched = variants.find((item) => item.id === selectedVariantId)
      if (matched) {
        return matched
      }
    }
    return variants[0] || draftVariant
  }, [draftVariant, selectedVariantId, variants])

  const selectedVariantDocument = React.useMemo(
    () =>
      normalizeCoverCardDocument({
        ...selectedVariant.document,
        prompt,
        ratio,
        width,
        height,
      }),
    [height, prompt, ratio, selectedVariant.document, width]
  )

  const selectedModel = React.useMemo(() => {
    return (
      capability.models.find((item) => item.id === modelId) ||
      capability.models.find((item) => item.id === capability.defaultModelId) ||
      coverCardDefaultCapability.models[0]
    )
  }, [capability.defaultModelId, capability.models, modelId])

  const normalizedSeed = React.useMemo(() => {
    const parsed = Number(seedText)
    if (!Number.isFinite(parsed)) {
      return undefined
    }
    return Math.max(0, Math.round(parsed))
  }, [seedText])

  const expandedVariantCount = React.useMemo(
    () =>
      Math.min(
        Math.max(coverCardVariantLimits.defaultPrimary, capability.maxVariants),
        coverCardVariantLimits.max
      ),
    [capability.maxVariants]
  )

  const extraVariantCount = Math.max(0, expandedVariantCount - 1)
  const capabilityMaxWidth = React.useMemo(
    () =>
      clampInteger(
        capability.maxWidth,
        coverCardDimensionLimits.minWidth,
        coverCardDimensionLimits.maxWidth
      ),
    [capability.maxWidth]
  )
  const capabilityMaxHeight = React.useMemo(
    () =>
      clampInteger(
        capability.maxHeight,
        coverCardDimensionLimits.minHeight,
        coverCardDimensionLimits.maxHeight
      ),
    [capability.maxHeight]
  )
  const supportedRatioOptions = React.useMemo(() => {
    const supported = new Set(capability.supportedRatios)
    const filtered = coverCardRatioOptions.filter((item) => supported.has(item.value))
    return filtered.length > 0 ? filtered : coverCardRatioOptions
  }, [capability.supportedRatios])
  const ratioValue = React.useMemo(() => resolveRatioNumber(ratio), [ratio])
  const ratioDimensionBounds = React.useMemo(
    () => resolveRatioDimensionBounds(ratio, capabilityMaxWidth, capabilityMaxHeight),
    [capabilityMaxHeight, capabilityMaxWidth, ratio]
  )
  const previewStageWidthClass = React.useMemo(
    () => resolvePreviewStageWidthClass(ratioValue),
    [ratioValue]
  )
  const widthInputBounds = React.useMemo(
    () =>
      lockRatio
        ? {
            min: ratioDimensionBounds.widthMin,
            max: ratioDimensionBounds.widthMax,
          }
        : {
            min: coverCardDimensionLimits.minWidth,
            max: capabilityMaxWidth,
          },
    [capabilityMaxWidth, lockRatio, ratioDimensionBounds.widthMax, ratioDimensionBounds.widthMin]
  )
  const heightInputBounds = React.useMemo(
    () =>
      lockRatio
        ? {
            min: ratioDimensionBounds.heightMin,
            max: ratioDimensionBounds.heightMax,
          }
        : {
            min: coverCardDimensionLimits.minHeight,
            max: capabilityMaxHeight,
          },
    [capabilityMaxHeight, lockRatio, ratioDimensionBounds.heightMax, ratioDimensionBounds.heightMin]
  )

  const clearGeneratedVariants = React.useCallback(() => {
    setGeneratedVariants([])
    setSelectedVariantId(null)
  }, [])

  const previewConfigSummary = React.useMemo(
    () => [
      {
        key: "size",
        label: "尺寸",
        value: `${selectedVariantDocument.width} × ${selectedVariantDocument.height}px`,
      },
      {
        key: "ratio",
        label: "比例",
        value: selectedVariantDocument.ratio,
      },
      {
        key: "theme",
        label: "主题",
        value: resolveCoverCardTheme(selectedVariantDocument.themeId).label,
      },
      {
        key: "variant-total",
        label: "方案",
        value: `${variants.length} 张`,
      },
      {
        key: "variant-current",
        label: "当前",
        value: selectedVariant.label,
      },
      {
        key: "model",
        label: "模型",
        value: selectedModel?.label || "未选择",
      },
      {
        key: "quality",
        label: "质量",
        value: coverCardQualityOptions.find((item) => item.value === quality)?.label || quality,
      },
      {
        key: "capability",
        label: "能力源",
        value: capabilitySource === "remote" ? "远程" : "本地默认",
      },
      {
        key: "format",
        label: "导出",
        value: exportFormat.toUpperCase(),
      },
    ],
    [
      capabilitySource,
      exportFormat,
      quality,
      selectedModel?.label,
      selectedVariant.label,
      selectedVariantDocument,
      variants.length,
    ]
  )

  const updateNotice = React.useCallback(
    (
      tone: NoticeTone,
      text: string,
      sourceState: "local" | "remote" | null = null
    ) => {
      setNotice({ tone, text })
      setSource(sourceState)
      setSavedAt(new Date())

      trackToolEvent({
        tool: "cover-card",
        action: toolTelemetryActions.workspaceNotice,
        status: tone === "error" ? "error" : tone === "success" ? "success" : "info",
        source: sourceState || undefined,
        message: text,
      })
    },
    []
  )

  const handlePromptApply = React.useCallback(
    (nextPrompt: string) => {
      setPrompt(nextPrompt)
      clearGeneratedVariants()
    },
    [clearGeneratedVariants, setPrompt]
  )

  const handleWidthChange = React.useCallback(
    (nextRaw: string) => {
      const minWidth = lockRatio ? ratioDimensionBounds.widthMin : coverCardDimensionLimits.minWidth
      const maxWidth = lockRatio ? ratioDimensionBounds.widthMax : capabilityMaxWidth
      const nextWidth = parseDimensionInput(
        nextRaw,
        width,
        minWidth,
        maxWidth
      )
      setWidth(nextWidth)
      if (lockRatio) {
        const linkedHeight = clampInteger(
          Math.round(nextWidth / ratioValue),
          ratioDimensionBounds.heightMin,
          ratioDimensionBounds.heightMax
        )
        setHeight(linkedHeight)
      }
      clearGeneratedVariants()
    },
    [
      capabilityMaxWidth,
      clearGeneratedVariants,
      lockRatio,
      ratioDimensionBounds.heightMax,
      ratioDimensionBounds.heightMin,
      ratioDimensionBounds.widthMax,
      ratioDimensionBounds.widthMin,
      ratioValue,
      setHeight,
      setWidth,
      width,
    ]
  )

  const handleHeightChange = React.useCallback(
    (nextRaw: string) => {
      const minHeight = lockRatio ? ratioDimensionBounds.heightMin : coverCardDimensionLimits.minHeight
      const maxHeight = lockRatio ? ratioDimensionBounds.heightMax : capabilityMaxHeight
      const nextHeight = parseDimensionInput(
        nextRaw,
        height,
        minHeight,
        maxHeight
      )
      setHeight(nextHeight)
      if (lockRatio) {
        const linkedWidth = clampInteger(
          Math.round(nextHeight * ratioValue),
          ratioDimensionBounds.widthMin,
          ratioDimensionBounds.widthMax
        )
        setWidth(linkedWidth)
      }
      clearGeneratedVariants()
    },
    [
      capabilityMaxHeight,
      clearGeneratedVariants,
      height,
      lockRatio,
      ratioDimensionBounds.heightMax,
      ratioDimensionBounds.heightMin,
      ratioDimensionBounds.widthMax,
      ratioDimensionBounds.widthMin,
      ratioValue,
      setHeight,
      setWidth,
    ]
  )

  const handleRatioChange = React.useCallback(
    (nextRatio: CoverCardAspectRatio) => {
      const nextRatioBounds = resolveRatioDimensionBounds(
        nextRatio,
        capabilityMaxWidth,
        capabilityMaxHeight
      )
      setRatio(nextRatio)
      if (lockRatio) {
        const nextRatioValue = resolveRatioNumber(nextRatio)
        const linkedWidth = clampInteger(width, nextRatioBounds.widthMin, nextRatioBounds.widthMax)
        const linkedHeight = clampInteger(
          Math.round(linkedWidth / nextRatioValue),
          nextRatioBounds.heightMin,
          nextRatioBounds.heightMax
        )
        setWidth(linkedWidth)
        setHeight(linkedHeight)
      }
      clearGeneratedVariants()
    },
    [
      capabilityMaxHeight,
      capabilityMaxWidth,
      clearGeneratedVariants,
      lockRatio,
      setHeight,
      setRatio,
      setWidth,
      width,
    ]
  )

  const runGenerate = React.useCallback(
    async (count: number, loadingState: Extract<LoadingState, "generate-main" | "generate-variants">, successText: string) => {
      if (!prompt.trim()) {
        updateNotice("error", toolWorkspaceCopy.coverCard.generateInputRequired)
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(loadingState)
      try {
        const result = await generateCoverCardData(
          {
            prompt,
            ratio,
            width,
            height,
            themeId,
            count,
            config: {
              modelId: selectedModel?.id,
              provider: selectedModel?.provider,
              quality,
              negativePrompt: negativePrompt.trim(),
              seed: normalizedSeed,
            },
          },
          {
            preferRemote: true,
            signal: controller.signal,
          }
        )

        setGeneratedVariants(result.variants)
        setSelectedVariantId(result.selectedVariantId)
        updateNotice(
          "success",
          withNoticeDetail(
            successText,
            [result.message, `共 ${result.variants.length} 张`].filter(Boolean).join("；")
          ),
          result.source
        )

        trackToolEvent({
          tool: "cover-card",
          action: toolTelemetryActions.generate,
          status: "success",
          source: result.source,
          message: successText,
          metadata: {
            count: result.variants.length,
            requestId: result.meta?.requestId,
            configHash: result.meta?.configHash,
            latencyMs: result.meta?.latencyMs,
            modelId: result.meta?.modelId || selectedModel?.id,
            provider: result.meta?.provider || selectedModel?.provider,
            capabilitySource: result.meta?.capabilitySource || capabilitySource,
            jobId: result.meta?.jobId,
            pollCount: result.meta?.pollCount,
            fallbackUsed: result.meta?.fallbackUsed,
          },
        })
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return
        }
        updateNotice("error", toolWorkspaceCopy.common.generateFailed)
        trackToolEvent({
          tool: "cover-card",
          action: toolTelemetryActions.generate,
          status: "error",
          source: "remote",
          message: error instanceof Error ? error.message : "生成失败",
          metadata: {
            requestedCount: count,
            modelId: selectedModel?.id,
            provider: selectedModel?.provider,
          },
        })
      } finally {
        setLoading(null)
      }
    },
    [
      capabilitySource,
      height,
      negativePrompt,
      normalizedSeed,
      prompt,
      quality,
      ratio,
      selectedModel?.id,
      selectedModel?.provider,
      themeId,
      updateNotice,
      width,
    ]
  )

  const handleGenerateMain = React.useCallback(() => {
    void runGenerate(
      coverCardVariantLimits.defaultPrimary,
      "generate-main",
      toolWorkspaceCopy.coverCard.generateMainSuccess
    )
  }, [runGenerate])

  const handleGenerateVariants = React.useCallback(() => {
    void runGenerate(
      expandedVariantCount,
      "generate-variants",
      toolWorkspaceCopy.coverCard.generateVariantSuccess
    )
  }, [expandedVariantCount, runGenerate])

  const handleExport = React.useCallback(async () => {
    const precheckNotices = getCoverCardExportPrecheckNotices(selectedVariantDocument)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading("export")
    try {
      const exported = await exportCoverCardImage(
        {
          document: selectedVariantDocument,
          format: exportFormat,
          variantId: selectedVariant.id,
        },
        {
          preferRemote: true,
          signal: controller.signal,
        }
      )

      triggerCoverCardImageDownload(exported.blob, exported.fileName)
      updateNotice(
        "success",
        withNoticeDetail(
          toolWorkspaceCopy.coverCard.exportSuccess,
          [precheckNotices.join("；"), exported.message].filter(Boolean).join("；")
        ),
        exported.source
      )
      trackToolEvent({
        tool: "cover-card",
        action: toolTelemetryActions.exportImage,
        status: "success",
        source: exported.source,
        message: exported.message,
        metadata: {
          format: exportFormat,
          variantId: selectedVariant.id,
        },
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }

      const reason = error instanceof Error ? error.message : ""
      updateNotice("error", withNoticeDetail(toolWorkspaceCopy.common.exportFailed, reason))
      trackToolEvent({
        tool: "cover-card",
        action: toolTelemetryActions.exportImage,
        status: "error",
        source: "remote",
        message: reason || "导出失败",
        metadata: {
          format: exportFormat,
          variantId: selectedVariant.id,
        },
      })
    } finally {
      setLoading(null)
    }
  }, [exportFormat, selectedVariant.id, selectedVariantDocument, updateNotice])

  const handleReset = React.useCallback(() => {
    const resetRatio = capability.supportedRatios.includes(coverCardPreviewDocument.ratio)
      ? coverCardPreviewDocument.ratio
      : capability.supportedRatios[0] || coverCardPreviewDocument.ratio
    const resetRatioBounds = resolveRatioDimensionBounds(
      resetRatio,
      capabilityMaxWidth,
      capabilityMaxHeight
    )
    const resetRatioValue = resolveRatioNumber(resetRatio)
    const resetWidth = clampInteger(
      coverCardPreviewDocument.width,
      resetRatioBounds.widthMin,
      resetRatioBounds.widthMax
    )
    const resetHeight = clampInteger(
      Math.round(resetWidth / resetRatioValue),
      resetRatioBounds.heightMin,
      resetRatioBounds.heightMax
    )

    setPrompt(coverCardPreviewDocument.prompt)
    setRatio(resetRatio)
    setWidth(resetWidth)
    setHeight(resetHeight)
    setThemeId(coverCardPreviewDocument.themeId)
    setExportFormat("png")
    setLockRatio(true)
    setModelId(capability.defaultModelId || coverCardDefaultGenerationConfig.modelId)
    setQuality(coverCardDefaultGenerationConfig.quality)
    setNegativePrompt("")
    setSeedText("")
    clearGeneratedVariants()
    setStageTilt({ x: 0, y: 0 })
    updateNotice("success", toolWorkspaceCopy.common.clearDraftSuccess, null)
  }, [
    capability.defaultModelId,
    capability.supportedRatios,
    capabilityMaxHeight,
    capabilityMaxWidth,
    clearGeneratedVariants,
    setExportFormat,
    setHeight,
    setLockRatio,
    setModelId,
    setNegativePrompt,
    setPrompt,
    setQuality,
    setRatio,
    setSeedText,
    setThemeId,
    setWidth,
    updateNotice,
  ])

  const handleSelectVariant = React.useCallback((variant: CoverCardVariant) => {
    setSelectedVariantId(variant.id)
  }, [])

  const handleStagePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const ratioX = (event.clientX - rect.left) / rect.width - 0.5
      const ratioY = (event.clientY - rect.top) / rect.height - 0.5
      setStageTilt({
        x: Number((-ratioY * 8).toFixed(2)),
        y: Number((ratioX * 10).toFixed(2)),
      })
    },
    []
  )

  const resetStageTilt = React.useCallback(() => {
    setStageTilt({ x: 0, y: 0 })
  }, [])

  React.useEffect(() => {
    let active = true
    const controller = new AbortController()

    void getCoverCardCapabilities({
      preferRemote: true,
      signal: controller.signal,
    })
      .then((result) => {
        if (!active) {
          return
        }
        setCapability(result.capability)
        setCapabilitySource(result.source)
        setCapabilityHint(result.message || "")
        trackToolEvent({
          tool: "cover-card",
          action: toolTelemetryActions.capabilityLoad,
          status: "success",
          source: result.source,
          message: result.message,
          metadata: {
            maxVariants: result.capability.maxVariants,
            modelCount: result.capability.models.length,
            supportsJobFlow: result.capability.supportsJobFlow,
          },
        })
      })
      .catch((error) => {
        if (!active || (error as Error).name === "AbortError") {
          return
        }
        setCapability(coverCardDefaultCapability)
        setCapabilitySource("local")
        setCapabilityHint("能力加载失败，已回退本地默认配置。")
        trackToolEvent({
          tool: "cover-card",
          action: toolTelemetryActions.capabilityLoad,
          status: "error",
          source: "local",
          message: error instanceof Error ? error.message : "能力加载失败",
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  React.useEffect(() => {
    if (!capability.models.find((item) => item.id === modelId)) {
      setModelId(capability.defaultModelId)
    }
  }, [capability.defaultModelId, capability.models, modelId, setModelId])

  React.useEffect(() => {
    const supportedRatios = capability.supportedRatios
    const nextRatio = supportedRatios.includes(ratio)
      ? ratio
      : supportedRatios[0] || ratio
    let nextWidth = clampInteger(
      width,
      coverCardDimensionLimits.minWidth,
      capabilityMaxWidth
    )
    let nextHeight = clampInteger(
      height,
      coverCardDimensionLimits.minHeight,
      capabilityMaxHeight
    )

    if (lockRatio) {
      const nextBounds = resolveRatioDimensionBounds(
        nextRatio,
        capabilityMaxWidth,
        capabilityMaxHeight
      )
      const nextRatioValue = resolveRatioNumber(nextRatio)
      nextWidth = clampInteger(nextWidth, nextBounds.widthMin, nextBounds.widthMax)
      nextHeight = clampInteger(
        Math.round(nextWidth / nextRatioValue),
        nextBounds.heightMin,
        nextBounds.heightMax
      )
    }

    let changed = false
    if (nextRatio !== ratio) {
      setRatio(nextRatio)
      changed = true
    }
    if (nextWidth !== width) {
      setWidth(nextWidth)
      changed = true
    }
    if (nextHeight !== height) {
      setHeight(nextHeight)
      changed = true
    }
    if (changed) {
      clearGeneratedVariants()
    }
  }, [
    capability.supportedRatios,
    capabilityMaxHeight,
    capabilityMaxWidth,
    clearGeneratedVariants,
    height,
    lockRatio,
    ratio,
    setHeight,
    setRatio,
    setWidth,
    width,
  ])

  React.useEffect(() => {
    const crumbs = ["工具大全"]
    if (groupTitle) {
      crumbs.push(groupTitle)
    }
    crumbs.push(tool.title)

    setWorkspaceHeaderStatus({
      breadcrumbs: crumbs,
      badge: tool.badge,
      savedText: notice.text,
      savedAtLabel: formatTime(savedAt),
      saveModeLabel: resolveWorkspaceSourceLabel(
        "cover-card",
        source,
        toolWorkspaceCopy.coverCard.sourceLocal
      ),
    })
  }, [
    groupTitle,
    notice.text,
    savedAt,
    setWorkspaceHeaderStatus,
    source,
    tool.badge,
    tool.title,
  ])

  React.useEffect(
    () => () => {
      setWorkspaceHeaderStatus(null)
      abortRef.current?.abort()
    },
    [setWorkspaceHeaderStatus]
  )

  return (
    <ToolWorkspaceShell>
      <ToolWorkspaceHero
        srOnlyTitle="AI图片卡片生成 - 在线封面卡片设计导出工具"
        title={COVER_CARD_TITLE}
        subtitle="主卡优先的封面视觉生成与候选方案对比"
        description={`默认生成一张主卡，再按需补充最多 ${extraVariantCount} 张候选方案。后续接入 LLM 生图接口时，可直接使用统一 variants 结构。`}
        tags={["主卡优先", "候选对比", "可接入AI后端"]}
      />

      {workspaceModules.promoNotice ? (
        <ToolPromoNotice content={smartDocPromoContent} icon={<Wand2 className="size-3.5" />} />
      ) : null}

      <section className={toolsWorkspaceLayout.surfaceSection}>
        {workspaceModules.sectionHeading ? (
          <ToolSectionHeading title="开始使用" description={COVER_CARD_DESCRIPTION} />
        ) : null}

        <div className={toolsLayoutTokens.workspace.splitLayoutClass}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">卡片描述（提示词）</label>
              <textarea
                value={prompt}
                onChange={(event) => handlePromptApply(event.target.value)}
                placeholder="例如：科技感十足的产品发布会封面，突出创新和速度..."
                className="min-h-[180px] w-full resize-y rounded-md border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex flex-wrap gap-2">
                {coverCardSamplePrompts.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePromptApply(item)}
                    className="tools-word-button-transition cursor-pointer rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-border hover:text-foreground"
                  >
                    示例 {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CoverCardField
                label="宽度"
                hint={`范围 ${widthInputBounds.min} - ${widthInputBounds.max} px`}
              >
                <input
                  type="number"
                  value={width}
                  min={widthInputBounds.min}
                  max={widthInputBounds.max}
                  step={10}
                  onChange={(event) => handleWidthChange(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                />
              </CoverCardField>

              <CoverCardField
                label="高度"
                hint={`范围 ${heightInputBounds.min} - ${heightInputBounds.max} px`}
              >
                <input
                  type="number"
                  value={height}
                  min={heightInputBounds.min}
                  max={heightInputBounds.max}
                  step={10}
                  onChange={(event) => handleHeightChange(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                />
              </CoverCardField>

              <CoverCardField label="比例" hint="常用布局比例">
                <select
                  value={ratio}
                  onChange={(event) => handleRatioChange(event.target.value as CoverCardAspectRatio)}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {supportedRatioOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </CoverCardField>

              <CoverCardField label="主题" hint="视觉配色风格">
                <select
                  value={themeId}
                  onChange={(event) => {
                    setThemeId(event.target.value as CoverCardThemeId)
                    clearGeneratedVariants()
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {coverCardThemeOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </CoverCardField>

              <CoverCardField label="导出格式" hint="图片文件类型">
                <select
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value as CoverCardExportFormat)}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {coverCardExportFormatOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </CoverCardField>

              <CoverCardField label="模型" hint="后端模型路由">
                <select
                  value={selectedModel?.id || modelId}
                  onChange={(event) => {
                    setModelId(event.target.value)
                    clearGeneratedVariants()
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {capability.models.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} · {item.provider}
                    </option>
                  ))}
                </select>
              </CoverCardField>

              <CoverCardField label="质量" hint="生成质量策略">
                <select
                  value={quality}
                  onChange={(event) => {
                    setQuality(event.target.value as CoverCardQualityMode)
                    clearGeneratedVariants()
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {coverCardQualityOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} · {item.hint}
                    </option>
                  ))}
                </select>
              </CoverCardField>

              <CoverCardField label="随机种子" hint="留空表示随机">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={seedText}
                  onChange={(event) => {
                    setSeedText(event.target.value)
                    clearGeneratedVariants()
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                />
              </CoverCardField>

              <CoverCardField label="联动" hint="尺寸联动开关">
                <div className="flex h-9 items-center justify-between rounded-md border border-border bg-background/70 px-2.5">
                  <span className="text-xs text-muted-foreground">锁定比例</span>
                  <Switch checked={lockRatio} onCheckedChange={setLockRatio} />
                </div>
              </CoverCardField>

              <div className="sm:col-span-2 lg:col-span-3">
                <CoverCardField label="负向提示词" hint="描述不希望出现的元素">
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(event) => {
                      setNegativePrompt(event.target.value)
                      clearGeneratedVariants()
                    }}
                    className="h-9 w-full rounded-md border border-input bg-background/70 px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="例如：杂乱背景、低清晰度、过度噪点"
                  />
                </CoverCardField>
              </div>
            </div>

            {capabilityHint ? (
              <p className="rounded-md border border-border/70 bg-background/45 px-3 py-2 text-xs text-muted-foreground">
                能力提示：{capabilityHint}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateMain}
                disabled={loading === "generate-main"}
                className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "generate-main" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 size-4" />
                )}
                生成主卡
              </button>

              <button
                type="button"
                onClick={handleGenerateVariants}
                disabled={loading === "generate-variants" || extraVariantCount === 0}
                className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "generate-variants" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Layers className="mr-2 size-4" />
                )}
                {extraVariantCount > 0 ? `再生成${extraVariantCount}张候选` : "候选不可用"}
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={loading === "export"}
                className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "export" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                导出当前主卡
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="tools-word-button-transition inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background/70 px-5 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground"
              >
                <RefreshCcw className="mr-2 size-4" />
                重置配置
              </button>
            </div>

            <ToolNoticeSlot tone={notice.tone} text={notice.text} />
            {workspaceModules.aiDisclaimer ? <ToolAiGeneratedDisclaimer /> : null}
          </div>

          <div className={cn(toolsLayoutTokens.workspace.rightPaneClass, "space-y-3")}>
            <ToolConfigSummary title="实时预览" items={previewConfigSummary} />

            <section className="rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_60%)] p-3 md:p-4">
              <div
                className={cn("relative mx-auto w-full", previewStageWidthClass)}
                style={{ perspective: "1200px" }}
                onPointerMove={handleStagePointerMove}
                onPointerLeave={resetStageTilt}
              >
                <div
                  className="origin-center transition-transform duration-200 ease-out will-change-transform"
                  style={{
                    transform: `rotateX(${stageTilt.x}deg) rotateY(${stageTilt.y}deg) translateZ(0)`,
                  }}
                >
                  <CoverCardPreview document={selectedVariantDocument} />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                主卡预览：{selectedVariant.label}（{resolveCoverCardTheme(selectedVariantDocument.themeId).label}）
              </p>
            </section>

            {variants.length > 1 ? (
              <section className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3">
                <p className="text-xs font-semibold tracking-wide text-foreground/90">候选方案切换</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {variants.map((variant) => {
                    const selected = variant.id === selectedVariant.id
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={cn(
                          "group space-y-1 rounded-lg border bg-background/65 p-1.5 text-left transition-all duration-200",
                          selected
                            ? "border-primary shadow-[0_8px_24px_-14px_rgba(15,23,42,0.6)]"
                            : "border-border/70"
                        )}
                      >
                        <CoverCardPreview
                          document={variant.document}
                          compact
                          className={cn(
                            "ring-1 ring-transparent",
                            selected ? "ring-primary/30" : "group-hover:ring-border"
                          )}
                        />
                        <p className={cn("text-[11px] font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
                          {variant.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </section>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                当前仅展示主卡。
                {extraVariantCount > 0
                  ? `点击“再生成${extraVariantCount}张候选”可进行并排对比。`
                  : "当前能力配置未开放候选方案。"}
              </div>
            )}

            {workspaceModules.checklistCard ? (
              <ToolChecklistCard title="效果说明" items={coverCardPreviewChecklist} />
            ) : null}
          </div>
        </div>
      </section>

      <CoverCardFooter showFaq={Boolean(workspaceModules.faqItem)} />
    </ToolWorkspaceShell>
  )
}
