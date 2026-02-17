import type { ComponentType, SVGProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronRight,
  Code2,
  Layers3,
  Presentation,
  Sparkles,
  Workflow,
} from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { createMarketingMetadata } from "@/lib/marketing-seo"
import {
  PRODUCT_DETAILS,
  PRODUCT_ORDER,
  type ProductSlug,
} from "@/lib/product-catalog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ShowcaseCard } from "@/components/sections/showcase"
import { BlurFade } from "@/components/magicui/blur-fade"
import { Marquee } from "@/components/magicui/marquee"

export const metadata: Metadata = createMarketingMetadata({
  title: "核心产品列表",
  description:
    "查看云衍 Canvas、Code、Slides、Studio 四大核心产品能力，覆盖可视化建模、工程生成、演示交付与系统编排。",
  path: "/products",
  keywords: [
    "核心产品",
    "云衍 Canvas",
    "云衍 Code",
    "云衍 Slides",
    "云衍 Studio",
  ],
})

interface ProductCardItem {
  name: string
  slogan: string
  infrastructureName: string
  description: string
  capabilities: readonly string[]
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const productIconMap: Record<
  ProductSlug,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  canvas: Sparkles,
  code: Code2,
  slides: Presentation,
  studio: Workflow,
}

const productCards: ProductCardItem[] = PRODUCT_ORDER.map((slug) => {
  const detail = PRODUCT_DETAILS[slug]

  return {
    name: detail.name,
    slogan: detail.listCard.slogan,
    infrastructureName: detail.infrastructureName,
    description: detail.listCard.description,
    capabilities: detail.listCard.capabilities,
    href: detail.detailHref,
    icon: productIconMap[slug],
  }
})

const featureCards = [
  {
    title: "AI 原生架构",
    detail: "从底层设计开始围绕 AI 能力构建，支持持续迭代与多场景扩展。",
  },
  {
    title: "全自动生成系统",
    detail: "从想法输入到结果输出形成自动化闭环，降低复杂项目交付成本。",
  },
  {
    title: "企业级架构",
    detail: "兼顾稳定性、可维护性与扩展性，适配从试点到规模化部署路径。",
  },
  {
    title: "开发者优先",
    detail: "围绕研发实际流程优化交互与产出结构，提升团队协作与工程效率。",
  },
] as const

const animatedShowcases = [
  {
    title: "云衍 Canvas 演示",
    image: "https://cdn.magicui.design/showcase/lyra.png",
    href: PRODUCT_DETAILS.canvas.detailHref,
    affiliation: "AI流程图 / ER图 / 架构图",
  },
  {
    title: "云衍 Code 演示",
    image: "https://cdn.magicui.design/showcase/langfuse.png",
    href: PRODUCT_DETAILS.code.detailHref,
    affiliation: "FastAPI / Vue / 全栈生成",
  },
  {
    title: "云衍 Slides 演示",
    image: "https://cdn.magicui.design/showcase/querylab.png",
    href: PRODUCT_DETAILS.slides.detailHref,
    affiliation: "自动主题 / 自动动画 / 导出",
  },
  {
    title: "云衍 Studio 演示",
    image: "https://cdn.magicui.design/showcase/aomni.png",
    href: PRODUCT_DETAILS.studio.detailHref,
    affiliation: "完整项目联动生成",
  },
  {
    title: "云衍 AI 操作系统",
    image: "https://cdn.magicui.design/showcase/nativeexpress.png",
    href: "/solutions",
    affiliation: "统一生产力系统",
  },
  {
    title: "云衍 Product Stack",
    image: "https://cdn.magicui.design/showcase/million.png",
    href: CTA_LINK.pricing,
    affiliation: "Free / Pro / Enterprise",
  },
] as const

export default function ProductsPage() {
  const productMatrixId = "product-matrix"

  return (
    <AIProductLayout>
      <article className={AI_PRODUCT_HERO_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Link
              href={`#${productMatrixId}`}
              aria-label={CTA_TEXT.viewProducts}
              className={MARKETING_NAV_PILL_CLASS}
            >
              <MarketingNavPillInner>
                云衍 YunYan AI 生产力操作系统
              </MarketingNavPillInner>
            </Link>
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
            云衍 YunYan
            <br />
            AI 生产力的下一次进化
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            用AI自动完成代码生成、系统设计、Slides创作与架构设计。
            <br className="hidden sm:block" />
            从想法到产品，只需一次输入。
          </p>
          <p className="text-muted-foreground/80 mx-auto mt-3 max-w-2xl text-sm leading-relaxed">
            云衍 AI 操作系统由 Canvas、Code、Slides、Studio 四大产品能力组成。
          </p>
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
              href={`#${productMatrixId}`}
              aria-label={CTA_TEXT.viewProducts}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {CTA_TEXT.viewProducts}
            </Link>
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            需要查看套餐与价格信息？
            <Link
              href={CTA_LINK.pricing}
              aria-label={CTA_TEXT.viewPricing}
              className="text-foreground ml-1 underline underline-offset-4"
            >
              {CTA_TEXT.viewPricing}
            </Link>
          </p>
        </div>
      </article>

      <section id={productMatrixId} className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <h2 className="text-foreground mb-2 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl lg:text-5xl">
          核心产品列表
        </h2>
        <h3 className="text-foreground/80 mx-auto mb-8 text-center text-lg font-medium tracking-tight text-balance">
          云衍 Canvas、Code、Slides、Studio 组成完整 AI 工具矩阵。
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {productCards.map((product, index) => {
            const Icon = product.icon
            return (
              <BlurFade key={product.name} delay={0.1 + index * 0.05} inView>
                <MarketingMagicCard className="h-full rounded-xl">
                  <div className="p-6">
                    <div className="bg-primary/10 text-primary mb-3 inline-flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-foreground text-xl font-semibold tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {product.slogan}
                    </p>
                    <p className="text-muted-foreground/80 mt-1 text-xs">
                      {product.infrastructureName}
                    </p>
                    <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                      {product.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {product.capabilities.map((point) => (
                        <li key={point} className="text-muted-foreground">
                          • {point}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={product.href}
                      aria-label={`${CTA_TEXT.viewDetail}：${product.name}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "mt-5"
                      )}
                    >
                      {CTA_TEXT.viewDetail}
                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </MarketingMagicCard>
              </BlurFade>
            )
          })}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <div className="mb-6 flex items-center justify-center gap-2">
          <Layers3 className="text-primary size-5" />
          <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
            系统核心优势
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {featureCards.map((feature, index) => (
            <BlurFade key={feature.title} delay={0.1 + index * 0.05} inView>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.detail}
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <h2 className="text-foreground mb-2 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl lg:text-5xl">
          产品能力演示
        </h2>
        <h3 className="text-foreground/80 mx-auto mb-8 text-center text-lg font-medium tracking-tight text-balance">
          覆盖开发、设计与创作的完整生产力系统。
        </h3>
        <div className="relative flex flex-col">
          <Marquee className="max-w-screen [--duration:90s]">
            {animatedShowcases.map((item) => (
              <ShowcaseCard key={item.title} {...item} />
            ))}
          </Marquee>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 h-full w-1/12 bg-linear-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 h-full w-1/12 bg-linear-to-l"></div>
        </div>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
