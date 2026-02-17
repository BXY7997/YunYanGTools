import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { PRODUCT_DETAILS, PRODUCT_ORDER } from "@/lib/product-catalog"
import { cn } from "@/lib/utils"

const companyName = "云衍网络科技有限公司"
const icpRecord = "黔ICP备2026002589号-1"
const publicSecurityRecord = "黔公网安备52011102000668号"
const currentYear = new Date().getFullYear()

const sectionTitleClass = "text-foreground text-sm font-semibold tracking-tight"
const sectionLinkClass =
  "group/link focus-visible:ring-ring text-foreground hover:text-primary inline-flex min-h-11 items-center gap-1 rounded-md px-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
const sectionSummaryClass =
  "text-muted-foreground mt-0.5 pl-1.5 text-xs leading-relaxed"
const actionLinkClass =
  "focus-visible:ring-ring border-border/70 bg-background text-foreground hover:bg-muted inline-flex min-h-11 items-center rounded-md border px-3 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
const metaLinkClass =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded-md px-1 py-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"

interface FooterNavItem {
  href: string
  label: string
  ariaLabel: string
  summary: string
}

function FooterNavSection({
  title,
  items,
  className,
}: {
  title: string
  items: readonly FooterNavItem[]
  className?: string
}) {
  return (
    <section className={cn("lg:pl-6", className)}>
      <h2 className={sectionTitleClass}>{title}</h2>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-label={item.ariaLabel}
              className={sectionLinkClass}
            >
              {item.label}
              <ChevronRight className="text-muted-foreground size-3.5" />
            </Link>
            <p className={sectionSummaryClass}>{item.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function SiteFooter() {
  const productItems: FooterNavItem[] = PRODUCT_ORDER.map((slug) => {
    const product = PRODUCT_DETAILS[slug]
    return {
      label: product.name,
      href: product.detailHref,
      ariaLabel: `查看${product.name}`,
      summary: product.listCard.slogan,
    }
  })

  const serviceItems: readonly FooterNavItem[] = [
    {
      href: CTA_LINK.pricing,
      label: "产品定价",
      ariaLabel: CTA_TEXT.viewPricing,
      summary: "查看套餐周期、订阅策略与企业采购方式。",
    },
    {
      href: "/solutions",
      label: "解决方案",
      ariaLabel: "查看解决方案",
      summary: "按高校与企业场景选择落地路径。",
    },
    {
      href: CTA_LINK.news,
      label: "企业动态",
      ariaLabel: CTA_TEXT.viewAllNews,
      summary: "了解产品发布节奏与关键能力迭代。",
    },
    {
      href: CTA_LINK.contact,
      label: "联系我们",
      ariaLabel: CTA_TEXT.getEnterpriseQuote,
      summary: "获取商务咨询与技术支持入口。",
    },
  ]

  const policyItems: readonly FooterNavItem[] = [
    {
      href: CTA_LINK.privacy,
      label: CTA_TEXT.privacyPolicy,
      ariaLabel: CTA_TEXT.privacyPolicy,
      summary: "了解数据收集、存储与使用边界。",
    },
    {
      href: CTA_LINK.terms,
      label: CTA_TEXT.termsOfService,
      ariaLabel: CTA_TEXT.termsOfService,
      summary: "查看平台服务规则与责任约定。",
    },
    {
      href: "/help",
      label: "帮助中心",
      ariaLabel: "帮助中心",
      summary: "快速定位常见问题与使用指南。",
    },
    {
      href: "/about",
      label: "关于云衍",
      ariaLabel: "关于云衍",
      summary: "查看公司介绍、品牌定位与发展方向。",
    },
  ]

  const quickActionItems = [
    {
      href: CTA_LINK.products,
      label: CTA_TEXT.viewProducts,
      ariaLabel: CTA_TEXT.viewProducts,
    },
    {
      href: CTA_LINK.pricing,
      label: CTA_TEXT.viewPricing,
      ariaLabel: CTA_TEXT.viewPricing,
    },
    {
      href: CTA_LINK.contact,
      label: CTA_TEXT.getEnterpriseQuote,
      ariaLabel: CTA_TEXT.getEnterpriseQuote,
    },
  ] as const

  return (
    <footer className="group-has-[.section-soft]/body:bg-surface/45 border-border/70 to-background/55 relative [margin-inline:calc(50%-50vw)] border-t bg-gradient-to-b from-transparent group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-6 md:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <section>
            <p className="text-muted-foreground text-xs font-medium tracking-wide">
              云衍 AI 操作系统
            </p>
            <h2 className="text-foreground mt-2 text-xl font-semibold tracking-tight">
              云衍 YunYan
            </h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
              面向高校与企业的 AI
              生产力操作系统，覆盖设计、开发、演示与系统编排，帮助团队更快完成从想法到交付。
            </p>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              企业服务邮箱：bd@yunyan.ai
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              <span className="bg-muted/55 text-muted-foreground border-border/60 inline-flex min-h-9 items-center rounded-md border px-2.5">
                高校场景
              </span>
              <span className="bg-muted/55 text-muted-foreground border-border/60 inline-flex min-h-9 items-center rounded-md border px-2.5">
                企业场景
              </span>
            </div>
          </section>

          <FooterNavSection
            title="核心产品"
            items={productItems}
            className="border-border/60 lg:border-l"
          />
          <FooterNavSection
            title="公司服务"
            items={serviceItems}
            className="border-border/60 lg:border-l"
          />
          <FooterNavSection
            title="支持与合规"
            items={policyItems}
            className="border-border/60 lg:border-l"
          />
        </div>

        <div className="border-border/70 mt-8 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2 lg:justify-center">
            {quickActionItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.ariaLabel}
                className={actionLinkClass}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground leading-relaxed">
              © {currentYear} {companyName} 版权所有
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className={metaLinkClass}
              >
                {icpRecord}
              </a>
              <a
                href="https://beian.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className={metaLinkClass}
              >
                {publicSecurityRecord}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
