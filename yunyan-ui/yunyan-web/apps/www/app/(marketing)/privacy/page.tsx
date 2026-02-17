import type { ComponentType, SVGProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronRight,
  Database,
  Eye,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { createMarketingMetadata } from "@/lib/marketing-seo"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  AI_PRODUCT_ANCHOR_CONTAINER,
  AI_PRODUCT_HERO_CONTAINER,
  AI_PRODUCT_SECTION_CONTAINER,
  AIProductLayout,
} from "@/components/marketing/ai-product-layout"
import { MarketingMagicCard } from "@/components/marketing/marketing-magic-card"
import {
  MARKETING_NAV_PILL_CLASS,
  MarketingNavPillInner,
} from "@/components/marketing/marketing-nav-pill"
import { CTASection } from "@/components/sections/cta"
import { BlurFade } from "@/registry/magicui/blur-fade"

const LAST_UPDATED = "2026-02-16"

interface PrivacyPrinciple {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface DataUsageRow {
  category: string
  examples: string
  purpose: string
  retention: string
}

const policyFacts = [
  "适用范围：云衍官网与公开页面",
  "处理原则：最小必要、目的明确、过程可追溯",
  `最近更新：${LAST_UPDATED}`,
] as const

const principles: PrivacyPrinciple[] = [
  {
    title: "最小必要收集",
    description:
      "我们仅在业务所需范围内收集信息，避免超出目的的冗余采集与长期存储。",
    icon: Database,
  },
  {
    title: "目的限制与透明说明",
    description:
      "在用户触达的页面清晰说明信息用途，包含服务交付、联系响应与产品体验优化。",
    icon: Eye,
  },
  {
    title: "安全保护与权限控制",
    description: "通过分级访问控制、审计记录与安全策略降低信息泄露和误用风险。",
    icon: LockKeyhole,
  },
  {
    title: "用户权利与合规响应",
    description:
      "对查询、更正、删除与限制处理请求建立标准化流程，在合理期限内反馈处理结果。",
    icon: Scale,
  },
] as const

const dataUsageRows: DataUsageRow[] = [
  {
    category: "联系信息",
    examples: "姓名、邮箱、单位、需求说明",
    purpose: "用于商务咨询、售前沟通与服务响应",
    retention: "沟通结束后按最短业务周期保留",
  },
  {
    category: "访问数据",
    examples: "访问时间、页面路径、设备类型",
    purpose: "用于站点性能优化、内容改进与风险审计",
    retention: "按运维与安全要求分级留存",
  },
  {
    category: "反馈内容",
    examples: "功能建议、问题描述、邮件记录",
    purpose: "用于产品迭代、问题排查与服务质量提升",
    retention: "按问题闭环周期留存并定期清理",
  },
] as const

const rights = [
  "查询我们所持有的个人信息类型、处理目的与处理依据。",
  "在合法合规前提下申请更正、删除或限制处理相关信息。",
  "对信息处理事项提出异议并获取阶段性处理反馈。",
  "通过指定邮箱反馈隐私问题并获得合规窗口支持。",
] as const

const securityMeasures = [
  "访问权限按角色最小化分配，关键数据触达过程可审计。",
  "面向高风险操作设置审计记录与异常监测机制。",
  "定期复查留存数据并清理失效或超期信息。",
] as const

export const metadata: Metadata = createMarketingMetadata({
  title: "隐私政策",
  description:
    "云衍隐私政策说明信息收集、使用、安全保护和用户权利，帮助用户清晰了解数据处理边界。",
  path: "/privacy",
  keywords: ["隐私政策", "数据保护", "个人信息", "合规声明"],
})

export default function PrivacyPage() {
  const privacyFrameworkId = "privacy-framework"

  return (
    <AIProductLayout>
      <article className={AI_PRODUCT_HERO_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Link
              href={`#${privacyFrameworkId}`}
              aria-label="查看隐私治理框架"
              className={MARKETING_NAV_PILL_CLASS}
            >
              <MarketingNavPillInner
                leadingIcon={<ShieldCheck className="size-4" />}
              >
                隐私治理与数据保护框架
              </MarketingNavPillInner>
            </Link>
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
            隐私政策
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            本政策用于说明云衍官网及相关页面在信息处理环节的规则边界。
            <br className="hidden sm:block" />
            我们围绕收集范围、用途说明、存储周期和用户权利建立可执行标准。
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {policyFacts.map((item) => (
              <span
                key={item}
                className="bg-muted text-muted-foreground rounded-full px-3 py-1.5 text-xs"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={CTA_LINK.contact}
              aria-label={CTA_TEXT.getEnterpriseQuote}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              {CTA_TEXT.getEnterpriseQuote}
              <ChevronRight className="size-4" />
            </Link>
            <Link
              href={`#${privacyFrameworkId}`}
              aria-label="查看隐私治理框架"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              查看隐私治理框架
            </Link>
          </div>
        </div>
      </article>

      <section id={privacyFrameworkId} className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          隐私治理框架
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          将数据处理拆解为可审视、可执行的流程节点，确保每项信息处理行为都有明确用途与责任归属。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {principles.map((item, index) => {
            const Icon = item.icon
            return (
              <BlurFade key={item.title} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl">
                  <article className="p-6">
                    <div className="bg-primary/10 text-primary mb-3 inline-flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-foreground text-lg font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </article>
                </MarketingMagicCard>
              </BlurFade>
            )
          })}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          收集信息与使用目的
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          我们仅处理服务所需信息，并在页面内说明类型、用途与留存策略，避免超范围使用。
        </p>
        <div className="space-y-3">
          {dataUsageRows.map((row, index) => (
            <BlurFade key={row.category} delay={0.08 + index * 0.04} inView>
              <MarketingMagicCard className="rounded-xl">
                <article className="grid gap-3 p-5 md:grid-cols-12 md:gap-4">
                  <h3 className="text-foreground text-sm font-semibold md:col-span-2">
                    {row.category}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed md:col-span-3">
                    示例：{row.examples}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed md:col-span-4">
                    用途：{row.purpose}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed md:col-span-3">
                    留存：{row.retention}
                  </p>
                </article>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <BlurFade delay={0.08} inView>
            <MarketingMagicCard className="h-full rounded-xl">
              <article className="p-6">
                <h2 className="text-foreground text-xl font-semibold tracking-tight">
                  用户权利
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {rights.map((item) => (
                    <li
                      key={item}
                      className="text-muted-foreground leading-relaxed"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </article>
            </MarketingMagicCard>
          </BlurFade>

          <BlurFade delay={0.12} inView>
            <MarketingMagicCard className="h-full rounded-xl">
              <article className="p-6">
                <h2 className="text-foreground text-xl font-semibold tracking-tight">
                  安全与联系渠道
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {securityMeasures.map((item) => (
                    <li
                      key={item}
                      className="text-muted-foreground leading-relaxed"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  隐私咨询：support@yunyan.ai
                </p>
              </article>
            </MarketingMagicCard>
          </BlurFade>
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <div className="mx-auto max-w-4xl rounded-xl border p-5 md:p-6">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            政策更新与生效
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            当业务场景、法律要求或系统能力发生变化时，我们会对政策进行更新并在本页面公示，重大调整将通过官网可见方式提示。
          </p>
        </div>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
