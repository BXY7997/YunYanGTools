export const CTA_TEXT = {
  viewProducts: "查看产品",
  getEnterpriseQuote: "获取企业报价",
  viewPricing: "查看价格",
  viewAllNews: "查看全部",
  viewDetail: "查看详情",
  getMediaResource: "获取资料",
  contactSupport: "联系 support@yunyan.ai",
  privacyPolicy: "隐私政策",
  termsOfService: "服务条款",
} as const

export const CTA_LINK = {
  products: "/products",
  pricing: "/pricing",
  news: "/news",
  contact: "/#contact",
  privacy: "/privacy",
  terms: "/terms",
  businessMail: "mailto:bd@yunyan.ai",
  supportMail: "mailto:support@yunyan.ai",
} as const

export function createBusinessMailto(subject: string) {
  return `${CTA_LINK.businessMail}?subject=${encodeURIComponent(subject)}`
}
