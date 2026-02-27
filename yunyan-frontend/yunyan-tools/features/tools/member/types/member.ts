export type MemberPlanId = "free" | "week" | "month" | "year"

export interface MemberHeroNotice {
  title: string
  description: string
}

export interface MemberPlan {
  id: MemberPlanId
  title: string
  badge?: string
  subBadge?: string
  promoLabel?: string
  priceCoins: number
  durationLabel: string
  originalPriceCoins?: number
  saveYuan?: number
  intro: string
  features: string[]
  buttonLabel: string
  disabled?: boolean
  current?: boolean
  accentClassName: string
  buttonClassName: string
  textAccentClassName: string
}

export interface MemberBenefitMatrixRow {
  id: string
  category?: string
  feature: string
  free: string
  week: string
  month: string
  year: string
}

export interface MemberFaqItem {
  question: string
  answer: string
}

export interface MemberCenterDocument {
  heroNotice: MemberHeroNotice
  centerTitle: string
  centerDescription: string
  plans: MemberPlan[]
  purchaseNotice: string
  matrixTitle: string
  matrixDescription: string
  matrixHeaders: [string, string, string, string, string]
  matrixRows: MemberBenefitMatrixRow[]
  faqTitle: string
  faqDescription: string
  faqs: MemberFaqItem[]
  activePlanId: MemberPlanId
  coinBalance: number
}

export interface MemberCenterGenerateRequest {
  includeFaq?: boolean
}

export interface MemberCenterGenerateResponse {
  document: MemberCenterDocument
  source: "local" | "remote"
  message?: string
}

export interface MemberSubscribeRequest {
  planId: MemberPlanId
}

export interface MemberSubscribeResponse {
  source: "local" | "remote"
  message?: string
  activePlanId: MemberPlanId
  coinBalance: number
  orderNo: string
}

export interface MemberExportRequest {
  document: MemberCenterDocument
}

export interface MemberExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  message?: string
}
