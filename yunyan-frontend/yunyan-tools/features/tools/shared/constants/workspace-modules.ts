export interface ToolWorkspaceModules {
  promoNotice: boolean
  sectionHeading: boolean
  aiDisclaimer: boolean
  faqItem: boolean
  checklistCard: boolean
}

const defaultModules: ToolWorkspaceModules = {
  promoNotice: true,
  sectionHeading: true,
  aiDisclaimer: true,
  faqItem: true,
  checklistCard: true,
}

// 路由级可选装配清单：新增页面时只需在这里声明差异。
const moduleOverridesByRoute: Partial<Record<string, Partial<ToolWorkspaceModules>>> =
  {
    "/apps/use-case-doc": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/sql-to-table": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: false,
    },
    "/apps/test-doc": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/word-table": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/aigc-check": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/aigc-reduce": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/paper-rewrite": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/pseudo-code": {
      promoNotice: false,
      sectionHeading: false,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: false,
    },
    "/apps/cover-card": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: true,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/code-runner": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: false,
      faqItem: true,
      checklistCard: true,
    },
    "/apps/file-collector": {
      promoNotice: true,
      sectionHeading: true,
      aiDisclaimer: false,
      faqItem: true,
      checklistCard: true,
    },
  }

export function resolveToolWorkspaceModules(route: string): ToolWorkspaceModules {
  const normalizedRoute =
    route.length > 1 && route.endsWith("/") ? route.slice(0, -1) : route
  const override = moduleOverridesByRoute[normalizedRoute]
  return {
    ...defaultModules,
    ...override,
  }
}
