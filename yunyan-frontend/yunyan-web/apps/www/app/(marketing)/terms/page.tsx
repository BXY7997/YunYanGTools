import type { ComponentType, SVGProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  ChevronRight,
  Gavel,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
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

interface TermsCard {
  title: string
  content: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const termsFacts = [
  "适用范围：官网公开页面与相关说明文档",
  "核心目标：明确使用规则、责任边界与争议处理机制",
  `最近更新：${LAST_UPDATED}`,
] as const

const termsBlocks: TermsCard[] = [
  {
    title: "服务范围",
    content:
      "云衍官网用于品牌信息展示、产品能力说明与商务联系，具体产品功能与交付范围以双方签订的协议为准。",
    icon: SlidersHorizontal,
  },
  {
    title: "使用规范",
    content:
      "用户应遵守适用法律法规，不得通过本站点实施影响平台安全、业务稳定或他人合法权益的行为。",
    icon: ShieldCheck,
  },
  {
    title: "知识产权",
    content:
      "站点内文本、图形、商标及相关内容归云衍或合法权利方所有，未经授权不得进行复制、传播或商业化使用。",
    icon: Gavel,
  },
  {
    title: "责任边界",
    content:
      "对于因不可抗力、第三方服务中断或超出合理控制范围导致的服务影响，我们将尽力修复但不承担超出法律规定范围的责任。",
    icon: AlertTriangle,
  },
] as const

const userRules = {
  allowed: [
    "基于官网公开信息了解产品能力、定价方案与合作方式。",
    "通过官方入口提交咨询、反馈和业务联系需求。",
    "在合规前提下引用公开资料并标注来源。",
  ],
  prohibited: [
    "未经授权抓取、复制、传播站内受保护内容用于商业用途。",
    "通过脚本、攻击或异常请求破坏站点可用性与安全性。",
    "利用官网内容进行误导性宣传或侵犯第三方合法权益。",
  ],
} as const

const disputeFlow = [
  {
    step: "01",
    title: "提出问题",
    description: "通过官方邮箱提交条款或服务相关争议说明与证据材料。",
  },
  {
    step: "02",
    title: "合规核查",
    description: "由业务与合规窗口联合核实事实并形成处理意见。",
  },
  {
    step: "03",
    title: "结果反馈",
    description: "在合理期限内向相关方同步处理结论与后续执行安排。",
  },
] as const

export const metadata: Metadata = createMarketingMetadata({
  title: "服务条款",
  description:
    "云衍服务条款用于说明官网使用规则、知识产权、责任边界与争议处理机制，保障各方权益。",
  path: "/terms",
  keywords: ["服务条款", "用户协议", "知识产权", "责任边界"],
})

export default function TermsPage() {
  const termsFrameworkId = "terms-framework"

  return (
    <AIProductLayout>
      <article className={AI_PRODUCT_HERO_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Link
              href={`#${termsFrameworkId}`}
              aria-label="查看条款框架"
              className={MARKETING_NAV_PILL_CLASS}
            >
              <MarketingNavPillInner leadingIcon={<Scale className="size-4" />}>
                服务条款与责任边界框架
              </MarketingNavPillInner>
            </Link>
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
            服务条款
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            本条款用于规范云衍官网及相关页面的使用行为，明确可为与不可为、权利归属与争议处理路径。
            <br className="hidden sm:block" />
            访问或使用本站点即视为已阅读并同意遵守本条款。
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {termsFacts.map((item) => (
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
              href={`#${termsFrameworkId}`}
              aria-label="查看条款框架"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              查看条款框架
            </Link>
          </div>
        </div>
      </article>

      <section id={termsFrameworkId} className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          条款框架总览
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          用清晰条款结构保障平台稳定运行，降低沟通歧义与执行偏差，确保双方权责可追溯。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {termsBlocks.map((block, index) => {
            const Icon = block.icon
            return (
              <BlurFade key={block.title} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl">
                  <article className="p-6">
                    <div className="bg-primary/10 text-primary mb-3 inline-flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-foreground text-lg font-semibold tracking-tight">
                      {block.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {block.content}
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
          使用规范与责任边界
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <BlurFade delay={0.08} inView>
            <MarketingMagicCard className="h-full rounded-xl">
              <article className="p-6">
                <h3 className="text-foreground text-lg font-semibold tracking-tight">
                  建议行为
                </h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {userRules.allowed.map((item) => (
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
                <h3 className="text-foreground text-lg font-semibold tracking-tight">
                  禁止行为
                </h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {userRules.prohibited.map((item) => (
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
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          争议处理流程
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {disputeFlow.map((item, index) => (
            <BlurFade key={item.step} delay={0.08 + index * 0.04} inView>
              <MarketingMagicCard className="h-full rounded-xl">
                <article className="p-6">
                  <p className="text-primary text-sm font-medium">
                    {item.step}
                  </p>
                  <h3 className="text-foreground mt-1 text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </article>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <div className="mx-auto max-w-4xl rounded-xl border p-5 md:p-6">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            联系与争议沟通
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            若对条款内容存在疑问，或需发起合作与合规沟通，请联系：bd@yunyan.ai。我们将按法律法规与合同约定处理相关事项。
          </p>
        </div>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
