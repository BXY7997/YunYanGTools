import type { ComponentType, SVGProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronRight,
  Code2,
  Cpu,
  GraduationCap,
  Layers3,
  Presentation,
  Rocket,
  Sparkles,
  Target,
  Workflow,
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
import { BlurFade } from "@/components/magicui/blur-fade"

export const metadata: Metadata = createMarketingMetadata({
  title: "关于云衍",
  description:
    "了解云衍 YunYan 的品牌定位、核心主张与产品矩阵，查看面向高校与企业场景的 AI 生产力操作系统建设方向。",
  path: "/about",
  keywords: ["关于云衍", "品牌定位", "AI 生产力平台", "企业级 AI"],
})

interface IconCardItem {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface ProductMatrixItem {
  name: string
  summary: string
  highlights: readonly string[]
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const brandPositioning: IconCardItem[] = [
  {
    title: "品牌定位",
    description: "云衍 YunYan 是面向高校与企业场景的 AI 生产力操作系统。",
    icon: Target,
  },
  {
    title: "核心主张",
    description: "从想法到产品，从设计到交付，通过统一工具矩阵提升整体效率。",
    icon: Rocket,
  },
  {
    title: "服务人群",
    description: "覆盖课程项目团队、创新团队与企业组织的数字化生产场景。",
    icon: GraduationCap,
  },
]

const productMatrix: ProductMatrixItem[] = [
  {
    name: "云衍 Canvas",
    summary: "负责可视化设计与建模表达。",
    highlights: ["AI流程图", "ER图", "架构图"],
    icon: Sparkles,
  },
  {
    name: "云衍 Code",
    summary: "负责工程代码生成与组织。",
    highlights: ["FastAPI 生成", "Vue 生成", "数据库与 API 生成"],
    icon: Code2,
  },
  {
    name: "云衍 Slides",
    summary: "负责教学汇报与方案演示输出。",
    highlights: ["AI生成演示稿", "自动主题", "导出能力"],
    icon: Presentation,
  },
  {
    name: "云衍 Studio",
    summary: "负责端到端系统编排与交付。",
    highlights: ["前后端联动", "数据库联动", "可运行项目生成"],
    icon: Workflow,
  },
]

const valueFramework: IconCardItem[] = [
  {
    title: "AI 原生架构",
    description: "能力设计从底层围绕 AI 展开，减少后期拼接式改造成本。",
    icon: Cpu,
  },
  {
    title: "全自动生成系统",
    description: "覆盖设计、工程、演示与编排，让交付链路更连贯。",
    icon: Layers3,
  },
  {
    title: "企业级可扩展",
    description: "从个人试用到团队协作再到企业接入，路径清晰且可持续。",
    icon: Target,
  },
  {
    title: "开发者与场景优先",
    description: "围绕真实项目场景迭代功能，而非孤立堆叠工具。",
    icon: Sparkles,
  },
]

interface IconCardProps extends IconCardItem {
  delay: number
}

function IconCard({ title, description, icon: Icon, delay }: IconCardProps) {
  return (
    <BlurFade delay={delay} inView>
      <MarketingMagicCard className="h-full rounded-xl">
        <article className="p-6">
          <div className="bg-primary/10 text-primary mb-4 inline-flex size-10 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </div>
          <h3 className="text-foreground text-lg font-semibold tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {description}
          </p>
        </article>
      </MarketingMagicCard>
    </BlurFade>
  )
}

export default function AboutPage() {
  const brandPositioningId = "brand-positioning"

  return (
    <AIProductLayout>
      <article className={AI_PRODUCT_HERO_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Link
              href={`#${brandPositioningId}`}
              aria-label="查看品牌定位"
              className={MARKETING_NAV_PILL_CLASS}
            >
              <MarketingNavPillInner>
                云衍 YunYan AI 生产力操作系统
              </MarketingNavPillInner>
            </Link>
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
            关于云衍
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            云衍以 AI 生产力操作系统为定位，
            <br className="hidden sm:block" />
            构建从设计、开发到交付的一体化产品能力。
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
              href={CTA_LINK.products}
              aria-label={CTA_TEXT.viewProducts}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {CTA_TEXT.viewProducts}
            </Link>
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            先看品牌与能力定位：
            <Link
              href={`#${brandPositioningId}`}
              aria-label="查看品牌定位"
              className="text-foreground ml-1 underline underline-offset-4"
            >
              品牌定位
            </Link>
          </p>
        </div>
      </article>

      <section id={brandPositioningId} className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          品牌定位
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          从品牌定位、核心主张到服务人群，形成统一的对外表达与场景边界。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {brandPositioning.map((item, index) => (
            <IconCard key={item.title} delay={0.08 + index * 0.04} {...item} />
          ))}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          核心产品矩阵
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          四大产品按 Canvas、Code、Slides、Studio 统一命名与能力分工协同。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {productMatrix.map((item, index) => {
            const Icon = item.icon
            return (
              <BlurFade key={item.name} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl">
                  <div className="p-6">
                    <div className="bg-primary/10 text-primary mb-3 inline-flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-foreground text-xl font-semibold tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {item.summary}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {item.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="text-muted-foreground text-sm"
                        >
                          • {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </MarketingMagicCard>
              </BlurFade>
            )
          })}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          价值主张
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          以 AI 原生能力为基础，覆盖从试用到企业接入的完整增长路径。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {valueFramework.map((item, index) => (
            <IconCard key={item.title} delay={0.08 + index * 0.04} {...item} />
          ))}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <MarketingMagicCard className="rounded-xl">
          <div className="p-8 md:p-10">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight">
              我们的愿景
            </h2>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              让每个组织都能以更低成本构建和交付 AI
              能力，让“从想法到产品”的过程标准化、可复制、可持续优化。
            </p>
            <p className="text-foreground mt-6 text-xl font-semibold tracking-tight">
              云衍 YunYan
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              下一代 AI 生产力基础设施。
            </p>
          </div>
        </MarketingMagicCard>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
