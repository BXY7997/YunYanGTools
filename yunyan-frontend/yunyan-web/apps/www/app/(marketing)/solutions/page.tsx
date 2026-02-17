import type { ComponentType, SVGProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpenCheck,
  Building2,
  ChevronRight,
  GraduationCap,
  Layers3,
  Rocket,
  Route,
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
  title: "解决方案",
  description:
    "查看云衍面向高校课程项目、毕业设计、创业团队与企业培训的 AI 解决方案，了解四大产品如何协同完成落地交付。",
  path: "/solutions",
  keywords: ["AI 解决方案", "高校课程项目", "毕业设计", "企业培训"],
})

interface ScenarioItem {
  title: string
  audience: string
  challenge: string
  solution: string
  products: readonly string[]
  outcomes: readonly string[]
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const PRODUCT_ORDER = [
  "云衍 Canvas",
  "云衍 Code",
  "云衍 Slides",
  "云衍 Studio",
] as const

function sortProducts(products: readonly string[]) {
  return [...products].sort(
    (left, right) =>
      PRODUCT_ORDER.indexOf(left as (typeof PRODUCT_ORDER)[number]) -
      PRODUCT_ORDER.indexOf(right as (typeof PRODUCT_ORDER)[number])
  )
}

const scenarioItems: ScenarioItem[] = [
  {
    title: "高校课程项目方案",
    audience: "任课教师 / 学生项目组 / 实训中心",
    challenge: "课程项目从需求梳理到成果交付链路长，重复性准备工作占比高。",
    solution:
      "通过 Canvas 统一系统设计，Code 快速生成工程骨架，Slides 自动输出汇报内容。",
    products: ["云衍 Canvas", "云衍 Code", "云衍 Slides"],
    outcomes: [
      "项目准备周期缩短",
      "课堂交付质量更稳定",
      "教学与实践衔接更顺畅",
    ],
    icon: GraduationCap,
  },
  {
    title: "毕业设计交付方案",
    audience: "毕设学生 / 指导教师 / 课题团队",
    challenge: "毕设阶段常见“设计、实现、文档、答辩”割裂，协同成本高。",
    solution:
      "以 Studio 串联前后端与数据库生成，配合 Slides 完成答辩材料与过程文档沉淀。",
    products: ["云衍 Studio", "云衍 Code", "云衍 Slides"],
    outcomes: ["题目落地速度更快", "文档与代码一致性更高", "答辩准备更高效"],
    icon: BookOpenCheck,
  },
  {
    title: "创业团队 MVP 方案",
    audience: "校园创业团队 / 创新工作室 / 初创项目组",
    challenge: "小团队资源有限，难以同时覆盖产品设计、研发与演示交付。",
    solution:
      "先用 Canvas 明确业务结构，再用 Code 和 Studio 生成可运行版本，快速验证方向。",
    products: ["云衍 Canvas", "云衍 Code", "云衍 Studio"],
    outcomes: ["MVP 上线更快", "试错成本更低", "路演材料可同步生成"],
    icon: Rocket,
  },
  {
    title: "企业培训与知识沉淀方案",
    audience: "企业大学 / 培训部门 / 业务团队",
    challenge: "内部知识更新频繁，培训内容分散，难形成统一的可复用资产。",
    solution:
      "基于 Slides 统一培训内容表达，结合 Canvas 做流程化建模，沉淀可复用模板。",
    products: ["云衍 Slides", "云衍 Canvas", "云衍 Studio"],
    outcomes: ["培训内容标准化", "知识复用效率提升", "跨团队协作更清晰"],
    icon: Building2,
  },
]

const capabilityLayers = [
  {
    title: "设计建模层",
    product: "云衍 Canvas",
    value: "负责流程图、ER图、架构图等可视化设计表达。",
  },
  {
    title: "工程生成层",
    product: "云衍 Code",
    value: "负责前后端、数据库与 API 的代码生成与组织。",
  },
  {
    title: "演示交付层",
    product: "云衍 Slides",
    value: "负责课程汇报、项目路演、方案说明的内容输出。",
  },
  {
    title: "系统编排层",
    product: "云衍 Studio",
    value: "负责从输入目标到可运行项目的全链路自动化编排。",
  },
] as const

const deliveryPhases = [
  {
    step: "01",
    title: "需求诊断",
    description: "明确目标场景、角色分工和交付边界，定义可量化结果。",
  },
  {
    step: "02",
    title: "能力映射",
    description: "将 Canvas、Code、Slides、Studio 组合成可落地方案。",
  },
  {
    step: "03",
    title: "快速落地",
    description: "输出可验证成果，完成内容、代码与演示材料的一体化交付。",
  },
  {
    step: "04",
    title: "持续优化",
    description: "基于反馈和数据持续迭代，形成可复制的长期方案模板。",
  },
] as const

interface ScenarioCardProps extends ScenarioItem {
  delay: number
}

function ScenarioCard({
  title,
  audience,
  challenge,
  solution,
  products,
  outcomes,
  icon: Icon,
  delay,
}: ScenarioCardProps) {
  const orderedProducts = sortProducts(products)

  return (
    <BlurFade delay={delay} inView>
      <MarketingMagicCard className="h-full rounded-xl">
        <article className="p-6">
          <div className="bg-primary/10 text-primary mb-3 inline-flex size-10 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </div>
          <h3 className="text-foreground text-lg font-semibold tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">{audience}</p>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            {challenge}
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {solution}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {orderedProducts.map((product) => (
              <span
                key={product}
                className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs"
              >
                {product}
              </span>
            ))}
          </div>

          <ul className="mt-4 space-y-2">
            {outcomes.map((outcome) => (
              <li key={outcome} className="text-muted-foreground text-sm">
                • {outcome}
              </li>
            ))}
          </ul>
        </article>
      </MarketingMagicCard>
    </BlurFade>
  )
}

export default function SolutionsPage() {
  const scenarioMatrixId = "scenario-matrix"

  return (
    <AIProductLayout>
      <article className={AI_PRODUCT_HERO_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Link
              href={`#${scenarioMatrixId}`}
              aria-label="查看场景方案矩阵"
              className={MARKETING_NAV_PILL_CLASS}
            >
              <MarketingNavPillInner>
                云衍 YunYan AI 生产力操作系统
              </MarketingNavPillInner>
            </Link>
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
            解决方案
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            基于云衍 AI 操作系统的四大核心产品能力，
            <br className="hidden sm:block" />
            为高校与企业提供从想法到交付的一体化解决方案。
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
            查看方案分层与路径：
            <Link
              href={`#${scenarioMatrixId}`}
              aria-label="查看场景方案矩阵"
              className="text-foreground ml-1 underline underline-offset-4"
            >
              场景方案矩阵
            </Link>
          </p>
        </div>
      </article>

      <section id={scenarioMatrixId} className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <div className="mb-6 flex items-center justify-center gap-2">
          <Layers3 className="text-primary size-5" />
          <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
            场景方案矩阵
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          所有方案都围绕云衍四大产品能力构建，保持“设计-开发-演示-编排”一致的信息层级。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {scenarioItems.map((item, index) => (
            <ScenarioCard
              key={item.title}
              delay={0.08 + index * 0.04}
              {...item}
            />
          ))}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <div className="mb-6 flex items-center justify-center gap-2">
          <Route className="text-primary size-5" />
          <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
            能力层级映射
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          将四大产品按能力职责分层映射，确保每个场景都能快速匹配可执行方案。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {capabilityLayers.map((layer, index) => (
            <BlurFade key={layer.title} delay={0.08 + index * 0.04} inView>
              <MarketingMagicCard className="h-full rounded-xl">
                <article className="p-6">
                  <p className="text-muted-foreground text-sm">{layer.title}</p>
                  <h3 className="text-foreground mt-1 text-lg font-semibold tracking-tight">
                    {layer.product}
                  </h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {layer.value}
                  </p>
                </article>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <div className="mb-6 flex items-center justify-center gap-2">
          <Route className="text-primary size-5" />
          <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
            交付路径
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          交付流程统一为需求诊断、能力映射、快速落地、持续优化四个阶段。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {deliveryPhases.map((phase, index) => (
            <BlurFade key={phase.step} delay={0.08 + index * 0.04} inView>
              <MarketingMagicCard className="h-full rounded-xl">
                <article className="p-6">
                  <p className="text-primary text-sm font-medium">
                    {phase.step}
                  </p>
                  <h3 className="text-foreground mt-1 text-lg font-semibold tracking-tight">
                    {phase.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {phase.description}
                  </p>
                </article>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
