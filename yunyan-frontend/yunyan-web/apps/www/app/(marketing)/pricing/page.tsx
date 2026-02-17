import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Clock3 } from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { createMarketingMetadata } from "@/lib/marketing-seo"
import {
  createProductDetailFromPricingHref,
  type ProductSlug,
} from "@/lib/product-catalog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  AI_PRODUCT_ANCHOR_CONTAINER,
  AI_PRODUCT_HERO_CONTAINER,
  AIProductLayout,
} from "@/components/marketing/ai-product-layout"
import { MarketingMagicCard } from "@/components/marketing/marketing-magic-card"
import {
  MARKETING_NAV_PILL_CLASS,
  MarketingNavPillInner,
} from "@/components/marketing/marketing-nav-pill"
import { PricingSelectedProductHint } from "@/components/marketing/pricing-selected-product-hint"
import { CTASection } from "@/components/sections/cta"
import { AnimatedShinyText } from "@/registry/magicui/animated-shiny-text"
import { BlurFade } from "@/registry/magicui/blur-fade"

export const metadata: Metadata = createMarketingMetadata({
  title: "价格与套餐",
  description:
    "查看云衍 AI 操作系统的产品定价与套餐结构，覆盖 Canvas、Code、Slides、Studio 的订阅周期与企业接入路径。",
  path: "/pricing",
  keywords: ["云衍价格", "AI 产品定价", "企业报价", "套餐订阅"],
})

interface PriceOption {
  duration: string
  price: number
  features: readonly string[]
}

interface ProductPricingGroup {
  slug: ProductSlug
  name: string
  summary: string
  options: readonly PriceOption[]
}

const pricingGroups: ProductPricingGroup[] = [
  {
    slug: "canvas",
    name: "云衍 Canvas",
    summary: "面向系统设计与结构表达场景，覆盖流程图、结构图与在线编辑导出。",
    options: [
      {
        duration: "7天",
        price: 14.9,
        features: ["AI流程图生成", "AI任务结构图", "在线编辑与导出"],
      },
      {
        duration: "30天",
        price: 29.9,
        features: ["AI流程图生成", "AI任务结构图", "在线编辑与导出"],
      },
      {
        duration: "365天",
        price: 99.9,
        features: ["AI流程图生成", "AI任务结构图", "在线编辑与导出"],
      },
    ],
  },
  {
    slug: "code",
    name: "云衍 Code",
    summary: "面向研发交付场景，覆盖后端模板、全栈骨架与数据库接口联动输出。",
    options: [
      {
        duration: "7天",
        price: 14.9,
        features: [
          "FastAPI 模板生成",
          "Vue 全栈骨架生成",
          "数据库与 API 结构输出",
        ],
      },
      {
        duration: "30天",
        price: 29.9,
        features: [
          "FastAPI 模板生成",
          "Vue 全栈骨架生成",
          "数据库与 API 结构输出",
        ],
      },
      {
        duration: "365天",
        price: 99.9,
        features: [
          "FastAPI 模板生成",
          "Vue 全栈骨架生成",
          "数据库与 API 结构输出",
        ],
      },
    ],
  },
]

const comingSoonProducts = [
  {
    slug: "slides",
    name: "云衍 Slides",
    title: "敬请期待",
    description: "该产品暂不可用的订阅方案",
    status: "暂不可用",
  },
  {
    slug: "studio",
    name: "云衍 Studio",
    title: "敬请期待",
    description: "该产品暂不可用的订阅方案",
    status: "暂不可用",
  },
] as const

function PricingOptionCard({
  productSlug,
  productName,
  option,
}: {
  productSlug: ProductSlug
  productName: string
  option: PriceOption
}) {
  return (
    <MarketingMagicCard className="h-full rounded-2xl">
      <div className="p-5">
        <p className="text-muted-foreground text-xl font-semibold tracking-tight">
          {productName} · {option.duration}
        </p>
        <div className="mt-3 flex items-end gap-1.5">
          <span className="text-3xl leading-none font-semibold">¥</span>
          <span className="text-5xl leading-none font-semibold">
            {option.price.toFixed(1)}
          </span>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm">
          {option.features.map((feature) => (
            <li
              key={feature}
              className="text-muted-foreground flex items-center"
            >
              • {feature}
            </li>
          ))}
        </ul>
        <div className="mt-5 grid gap-2">
          <Link
            href={createProductDetailFromPricingHref({
              slug: productSlug,
              plan: option.duration,
            })}
            aria-label={`选择${productName} ${option.duration}并进入产品页`}
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            选择并进入产品页
            <ChevronRight className="size-4" />
          </Link>
          <Link
            href={CTA_LINK.contact}
            aria-label={`${CTA_TEXT.getEnterpriseQuote}：${productName} ${option.duration}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {CTA_TEXT.getEnterpriseQuote}
          </Link>
        </div>
      </div>
    </MarketingMagicCard>
  )
}

function ComingSoonCard({
  item,
}: {
  item: (typeof comingSoonProducts)[number]
}) {
  return (
    <MarketingMagicCard className="h-full rounded-2xl">
      <div className="flex min-h-[236px] flex-col items-center justify-center px-5 py-8 text-center">
        <span className="mb-4 inline-flex size-10 items-center justify-center rounded-full border">
          <Clock3 className="text-muted-foreground size-5" />
        </span>
        <p className="text-xl font-semibold tracking-tight">{item.title}</p>
        <p className="text-muted-foreground mt-2 text-sm">{item.description}</p>
        <p className="text-muted-foreground mt-3 text-xs">{item.status}</p>
        <Link
          href={`/products/${item.slug}`}
          aria-label={`查看${item.name}详情`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-4"
          )}
        >
          查看详情
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </MarketingMagicCard>
  )
}

export default function PricingPage() {
  const pricingMatrixId = "pricing-matrix"

  return (
    <AIProductLayout>
      <article className={AI_PRODUCT_HERO_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Link
              href={`#${pricingMatrixId}`}
              aria-label={CTA_TEXT.viewPricing}
              className={MARKETING_NAV_PILL_CLASS}
            >
              <MarketingNavPillInner>
                云衍 YunYan AI 生产力操作系统
              </MarketingNavPillInner>
            </Link>
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
            价格与套餐
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            云衍 AI 操作系统
            提供清晰的产品分层与订阅周期，支持从试用到企业规模化落地。
            <br className="hidden sm:block" />
            当前页面聚焦四大产品的价格结构展示与方案选择路径。
          </p>
          <Suspense fallback={null}>
            <PricingSelectedProductHint />
          </Suspense>
          <div className="bg-muted mt-6 inline-flex items-center rounded-full border px-4 py-2 text-sm">
            <AnimatedShinyText className="text-sm font-medium">
              云衍 AI 操作系统定价结构，术语已统一为 Canvas / Code / Slides /
              Studio
            </AnimatedShinyText>
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
              href={CTA_LINK.products}
              aria-label={CTA_TEXT.viewProducts}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {CTA_TEXT.viewProducts}
            </Link>
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            查看当前页面套餐明细：
            <Link
              href={`#${pricingMatrixId}`}
              aria-label={CTA_TEXT.viewPricing}
              className="text-foreground ml-1 underline underline-offset-4"
            >
              {CTA_TEXT.viewPricing}
            </Link>
          </p>
        </div>
      </article>

      <section
        id={pricingMatrixId}
        className={cn(AI_PRODUCT_ANCHOR_CONTAINER, "pb-12 md:pb-16")}
      >
        <div className="space-y-8">
          {pricingGroups.map((group, groupIndex) => (
            <div key={group.name}>
              <h2 className="text-muted-foreground mb-4 text-xl font-semibold tracking-tight">
                {group.name}
              </h2>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {group.summary}
              </p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {group.options.map((option, index) => (
                  <BlurFade
                    key={`${group.name}-${option.duration}`}
                    delay={0.06 + (groupIndex * 3 + index) * 0.03}
                    inView
                  >
                    <PricingOptionCard
                      productSlug={group.slug}
                      productName={group.name}
                      option={option}
                    />
                  </BlurFade>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h2 className="text-muted-foreground mb-4 text-xl font-semibold tracking-tight">
              即将开放
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {comingSoonProducts.map((item, index) => (
                <BlurFade key={item.name} delay={0.24 + index * 0.04} inView>
                  <div>
                    <h3 className="text-muted-foreground mb-3 text-base font-medium tracking-tight">
                      {item.name}
                    </h3>
                    <ComingSoonCard item={item} />
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
