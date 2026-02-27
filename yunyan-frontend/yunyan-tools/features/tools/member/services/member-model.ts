import {
  memberPlanIds,
  memberPreviewDocument,
} from "@/features/tools/member/constants/member-config"
import type {
  MemberBenefitMatrixRow,
  MemberCenterDocument,
  MemberPlan,
  MemberPlanId,
  MemberSubscribeResponse,
} from "@/features/tools/member/types/member"

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
}

function toNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

function normalizePlanId(value: unknown, fallback: MemberPlanId): MemberPlanId {
  if (typeof value !== "string") {
    return fallback
  }

  return memberPlanIds.includes(value as MemberPlanId)
    ? (value as MemberPlanId)
    : fallback
}

function normalizePlan(source: unknown, fallback: MemberPlan): MemberPlan {
  const record = toRecord(source)
  if (!record) {
    return fallback
  }

  return {
    ...fallback,
    id: normalizePlanId(record.id, fallback.id),
    title:
      typeof record.title === "string" && record.title.trim()
        ? record.title.trim()
        : fallback.title,
    badge:
      typeof record.badge === "string" && record.badge.trim()
        ? record.badge.trim()
        : fallback.badge,
    subBadge:
      typeof record.subBadge === "string" && record.subBadge.trim()
        ? record.subBadge.trim()
        : fallback.subBadge,
    promoLabel:
      typeof record.promoLabel === "string" && record.promoLabel.trim()
        ? record.promoLabel.trim()
        : fallback.promoLabel,
    priceCoins: toNumber(record.priceCoins, fallback.priceCoins),
    durationLabel:
      typeof record.durationLabel === "string" && record.durationLabel.trim()
        ? record.durationLabel.trim()
        : fallback.durationLabel,
    originalPriceCoins:
      record.originalPriceCoins == null
        ? fallback.originalPriceCoins
        : toNumber(record.originalPriceCoins, fallback.originalPriceCoins || 0),
    saveYuan:
      record.saveYuan == null
        ? fallback.saveYuan
        : toNumber(record.saveYuan, fallback.saveYuan || 0),
    intro:
      typeof record.intro === "string" && record.intro.trim()
        ? record.intro.trim()
        : fallback.intro,
    features: toStringArray(record.features).length > 0 ? toStringArray(record.features) : fallback.features,
    buttonLabel:
      typeof record.buttonLabel === "string" && record.buttonLabel.trim()
        ? record.buttonLabel.trim()
        : fallback.buttonLabel,
    disabled:
      typeof record.disabled === "boolean" ? record.disabled : fallback.disabled,
    current:
      typeof record.current === "boolean" ? record.current : fallback.current,
    accentClassName:
      typeof record.accentClassName === "string" && record.accentClassName.trim()
        ? record.accentClassName.trim()
        : fallback.accentClassName,
    buttonClassName:
      typeof record.buttonClassName === "string" && record.buttonClassName.trim()
        ? record.buttonClassName.trim()
        : fallback.buttonClassName,
    textAccentClassName:
      typeof record.textAccentClassName === "string" && record.textAccentClassName.trim()
        ? record.textAccentClassName.trim()
        : fallback.textAccentClassName,
  }
}

function normalizeMatrixRow(
  source: unknown,
  fallback: MemberBenefitMatrixRow
): MemberBenefitMatrixRow {
  const record = toRecord(source)
  if (!record) {
    return fallback
  }

  const readCell = (key: keyof MemberBenefitMatrixRow) => {
    const value = record[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
    return fallback[key]
  }

  return {
    id: readCell("id"),
    category: readCell("category"),
    feature: readCell("feature"),
    free: readCell("free"),
    week: readCell("week"),
    month: readCell("month"),
    year: readCell("year"),
  }
}

export function buildLocalMemberCenterDocument(): MemberCenterDocument {
  return {
    ...memberPreviewDocument,
    plans: memberPreviewDocument.plans.map((item) => ({ ...item })),
    matrixRows: memberPreviewDocument.matrixRows.map((item) => ({ ...item })),
    faqs: memberPreviewDocument.faqs.map((item) => ({ ...item })),
  }
}

export function parseMemberCenterRemoteDocument(
  payload: unknown
): MemberCenterDocument | null {
  const root = toRecord(payload)
  if (!root) {
    return null
  }

  const nested =
    toRecord(root.data) ||
    toRecord(root.result) ||
    toRecord(root.payload) ||
    root

  const fallback = buildLocalMemberCenterDocument()

  const plansRaw = Array.isArray(nested.plans) ? nested.plans : []
  const matrixRowsRaw = Array.isArray(nested.matrixRows) ? nested.matrixRows : []

  const plans =
    plansRaw.length > 0
      ? fallback.plans.map((item) => {
          const matched = plansRaw.find((candidate) => {
            const record = toRecord(candidate)
            return normalizePlanId(record?.id, item.id) === item.id
          })
          return normalizePlan(matched, item)
        })
      : fallback.plans

  const matrixRows =
    matrixRowsRaw.length > 0
      ? matrixRowsRaw.map((row, index) =>
          normalizeMatrixRow(
            row,
            fallback.matrixRows[index] || {
              id: `row-${index + 1}`,
              feature: "",
              free: "",
              week: "",
              month: "",
              year: "",
            }
          )
        )
      : fallback.matrixRows

  const faqList = Array.isArray(nested.faqs)
    ? nested.faqs
        .map((item) => {
          const record = toRecord(item)
          if (!record) {
            return null
          }
          const question = typeof record.question === "string" ? record.question.trim() : ""
          const answer = typeof record.answer === "string" ? record.answer.trim() : ""
          if (!question || !answer) {
            return null
          }
          return {
            question,
            answer,
          }
        })
        .filter(Boolean) as MemberCenterDocument["faqs"]
    : []

  return {
    ...fallback,
    heroNotice: {
      title:
        typeof toRecord(nested.heroNotice)?.title === "string"
          ? (toRecord(nested.heroNotice)?.title as string)
          : fallback.heroNotice.title,
      description:
        typeof toRecord(nested.heroNotice)?.description === "string"
          ? (toRecord(nested.heroNotice)?.description as string)
          : fallback.heroNotice.description,
    },
    centerTitle:
      typeof nested.centerTitle === "string" && nested.centerTitle.trim()
        ? nested.centerTitle.trim()
        : fallback.centerTitle,
    centerDescription:
      typeof nested.centerDescription === "string" && nested.centerDescription.trim()
        ? nested.centerDescription.trim()
        : fallback.centerDescription,
    plans,
    purchaseNotice:
      typeof nested.purchaseNotice === "string" && nested.purchaseNotice.trim()
        ? nested.purchaseNotice.trim()
        : fallback.purchaseNotice,
    matrixTitle:
      typeof nested.matrixTitle === "string" && nested.matrixTitle.trim()
        ? nested.matrixTitle.trim()
        : fallback.matrixTitle,
    matrixDescription:
      typeof nested.matrixDescription === "string" && nested.matrixDescription.trim()
        ? nested.matrixDescription.trim()
        : fallback.matrixDescription,
    matrixRows,
    faqTitle:
      typeof nested.faqTitle === "string" && nested.faqTitle.trim()
        ? nested.faqTitle.trim()
        : fallback.faqTitle,
    faqDescription:
      typeof nested.faqDescription === "string" && nested.faqDescription.trim()
        ? nested.faqDescription.trim()
        : fallback.faqDescription,
    faqs: faqList.length > 0 ? faqList : fallback.faqs,
    activePlanId: normalizePlanId(nested.activePlanId, fallback.activePlanId),
    coinBalance: toNumber(nested.coinBalance, fallback.coinBalance),
  }
}

export function parseMemberSubscribeResult(
  payload: unknown,
  fallbackPlanId: MemberPlanId,
  fallbackCoins: number
): MemberSubscribeResponse {
  const root = toRecord(payload)
  const nested =
    toRecord(root?.data) ||
    toRecord(root?.result) ||
    toRecord(root?.payload) ||
    root

  return {
    source: "remote",
    message:
      typeof nested?.message === "string" && nested.message.trim()
        ? nested.message.trim()
        : "会员开通成功（远程接口）",
    activePlanId: normalizePlanId(nested?.activePlanId, fallbackPlanId),
    coinBalance: toNumber(nested?.coinBalance, fallbackCoins),
    orderNo:
      typeof nested?.orderNo === "string" && nested.orderNo.trim()
        ? nested.orderNo.trim()
        : `VIP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  }
}
