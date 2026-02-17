/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Download,
  FolderKanban,
  Layers3,
} from "lucide-react"

import { createBusinessMailto, CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { createMarketingMetadata } from "@/lib/marketing-seo"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
import { CTASection } from "@/components/sections/cta"
import { BlurFade } from "@/components/magicui/blur-fade"

export const metadata: Metadata = createMarketingMetadata({
  title: "企业动态",
  description:
    "查看云衍产品发布、能力更新与企业合作进展，了解 Canvas、Code、Slides、Studio 的最新迭代节奏。",
  path: "/news",
  keywords: ["企业动态", "产品发布", "版本更新", "云衍新闻"],
})

interface ProductReleaseItem {
  product: string
  stage: string
  releaseWindow: string
  summary: string
  focus: readonly string[]
}

interface EnterpriseNewsItem {
  id: string
  category: string
  date: string
  readTime: string
  title: string
  summary: string
  relatedProducts: readonly string[]
  image: string
}

const releaseCadence: ProductReleaseItem[] = [
  {
    product: "云衍 Canvas",
    stage: "稳定迭代",
    releaseWindow: "2026 Q1",
    summary: "围绕系统设计、ER图与流程图场景，持续强化建模效率与输出质量。",
    focus: ["场景模板扩展", "图形结构优化", "课程项目适配"],
  },
  {
    product: "云衍 Code",
    stage: "能力扩展",
    releaseWindow: "2026 Q1",
    summary: "持续完善后端、前端与数据库联动生成，提升可运行工程交付稳定性。",
    focus: ["FastAPI 模板升级", "Vue 全栈工程结构", "API 生成规范化"],
  },
  {
    product: "云衍 Slides",
    stage: "重点推进",
    releaseWindow: "2026 Q1",
    summary: "强化教学汇报与项目路演表达能力，形成“内容到展示”的一体化产出。",
    focus: ["主题模板增强", "页面逻辑建议", "导出链路优化"],
  },
  {
    product: "云衍 Studio",
    stage: "内测迭代",
    releaseWindow: "2026 Q2",
    summary: "加速从需求输入到可运行项目的全链路编排，构建差异化核心能力。",
    focus: ["项目骨架生成", "前后端联动", "数据库结构联动"],
  },
]

const enterpriseNews: EnterpriseNewsItem[] = [
  {
    id: "news-001",
    category: "产品发布",
    date: "2026-02-10",
    readTime: "4 分钟",
    title: "云衍发布 AI 生产力操作系统整体产品矩阵",
    summary:
      "云衍正式公开 Canvas、Code、Slides、Studio 四大核心产品，明确“从想法到交付”的能力路径。",
    relatedProducts: ["云衍 Canvas", "云衍 Code", "云衍 Slides", "云衍 Studio"],
    image: "https://picsum.photos/seed/yunyan-news-01/1280/720",
  },
  {
    id: "news-002",
    category: "产品更新",
    date: "2026-02-06",
    readTime: "3 分钟",
    title: "云衍 Canvas 完成多类结构图协同生成优化",
    summary: "新增多场景结构图生成链路，进一步提升系统设计表达的一致性和效率。",
    relatedProducts: ["云衍 Canvas"],
    image: "https://picsum.photos/seed/yunyan-news-02/1280/720",
  },
  {
    id: "news-003",
    category: "产品更新",
    date: "2026-02-02",
    readTime: "3 分钟",
    title: "云衍 Code 扩展全栈生成与接口组织能力",
    summary: "面向课程项目与企业原型场景，增强后端、前端、数据库联动生成质量。",
    relatedProducts: ["云衍 Code"],
    image: "https://picsum.photos/seed/yunyan-news-03/1280/720",
  },
  {
    id: "news-004",
    category: "产品更新",
    date: "2026-01-29",
    readTime: "3 分钟",
    title: "云衍 Slides 上线教学与路演双场景模板",
    summary: "围绕课堂汇报和商业演示，提供更稳定的结构化内容生成与展示体验。",
    relatedProducts: ["云衍 Slides"],
    image: "https://picsum.photos/seed/yunyan-news-04/1280/720",
  },
  {
    id: "news-005",
    category: "核心进展",
    date: "2026-01-24",
    readTime: "4 分钟",
    title: "云衍 Studio 进入小范围场景化内测阶段",
    summary: "围绕“输入目标即生成项目”方向，持续打磨端到端自动化交付体验。",
    relatedProducts: ["云衍 Studio"],
    image: "https://picsum.photos/seed/yunyan-news-05/1280/720",
  },
  {
    id: "news-006",
    category: "价格策略",
    date: "2026-01-20",
    readTime: "2 分钟",
    title: "云衍发布 Free / Pro / Enterprise 三层订阅体系",
    summary:
      "价格体系覆盖体验、进阶与企业接入阶段，支撑四大产品的持续交付节奏。",
    relatedProducts: ["云衍 Canvas", "云衍 Code", "云衍 Slides", "云衍 Studio"],
    image: "https://picsum.photos/seed/yunyan-news-06/1280/720",
  },
  {
    id: "news-007",
    category: "客户实践",
    date: "2026-01-16",
    readTime: "4 分钟",
    title: "高校项目团队基于云衍完成课程方案一体化交付",
    summary:
      "通过设计、开发、演示流程打通，团队在项目准备与答辩交付环节实现明显提速。",
    relatedProducts: ["云衍 Canvas", "云衍 Code", "云衍 Slides"],
    image: "https://picsum.photos/seed/yunyan-news-07/1280/720",
  },
  {
    id: "news-008",
    category: "生态合作",
    date: "2026-01-12",
    readTime: "3 分钟",
    title: "云衍与教育服务伙伴共建场景化模板库",
    summary:
      "围绕高校与企业培训场景，双方持续完善可直接复用的交付模板和流程指引。",
    relatedProducts: ["云衍 Canvas", "云衍 Slides", "云衍 Studio"],
    image: "https://picsum.photos/seed/yunyan-news-08/1280/720",
  },
]

const featuredNews = enterpriseNews[0]
const latestNews = enterpriseNews.slice(1)

const milestoneTimeline = [
  {
    period: "2026.02",
    title: "四大产品矩阵正式发布",
    detail:
      "完成 Canvas、Code、Slides、Studio 的统一对外发布，明确产品协同路径。",
  },
  {
    period: "2026.01",
    title: "定价体系与发布节奏同步上线",
    detail:
      "建立 Free / Pro / Enterprise 分层策略，支持产品能力按节奏持续迭代。",
  },
  {
    period: "2025.12",
    title: "形成一体化交付方法",
    detail: "初步打通“方案设计-工程生成-演示输出”链路，沉淀可复用交付模板。",
  },
] as const

const mediaResources = [
  {
    title: "品牌与媒体资料包",
    description: "包含品牌介绍、标准文案、官方素材与对外沟通说明。",
    actionLabel: CTA_TEXT.getMediaResource,
    href: createBusinessMailto("申请媒体资料包"),
  },
  {
    title: "四大产品发布节奏说明",
    description: "统一说明 Canvas、Code、Slides、Studio 的阶段计划与应用场景。",
    actionLabel: CTA_TEXT.getMediaResource,
    href: createBusinessMailto("申请产品发布节奏说明"),
  },
  {
    title: "合作与接入资料",
    description: "面向企业客户与生态伙伴的合作流程、接入范围与支持方式说明。",
    actionLabel: CTA_TEXT.getMediaResource,
    href: createBusinessMailto("申请合作接入资料"),
  },
] as const

function formatNewsDate(date: string) {
  return date.replaceAll("-", ".")
}

export default function NewsPage() {
  const releaseCadenceId = "release-cadence"

  return (
    <AIProductLayout>
      <main className={AI_PRODUCT_HERO_CONTAINER}>
        <header className="mb-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <Link
                href={`#${releaseCadenceId}`}
                aria-label="查看四大产品发布节奏"
                className={MARKETING_NAV_PILL_CLASS}
              >
                <MarketingNavPillInner>
                  云衍 YunYan AI 生产力操作系统
                </MarketingNavPillInner>
              </Link>
            </div>
            <h1 className="text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
              企业动态
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
              围绕云衍 AI
              操作系统四大产品矩阵，展示发布节奏、关键进展与企业动态。
            </p>

            <Badge variant="default" className="mt-4 text-xs shadow-none">
              {enterpriseNews.length} 条动态
            </Badge>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={CTA_LINK.contact}
                aria-label={CTA_TEXT.getEnterpriseQuote}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" })
                )}
              >
                {CTA_TEXT.getEnterpriseQuote}
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href={CTA_LINK.products}
                aria-label={CTA_TEXT.viewProducts}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                {CTA_TEXT.viewProducts}
              </Link>
            </div>
            <p className="text-muted-foreground mt-3 text-sm">
              优先查看四大产品发布节奏：
              <Link
                href={`#${releaseCadenceId}`}
                aria-label="查看四大产品发布节奏"
                className="text-foreground ml-1 underline underline-offset-4"
              >
                发布节奏
              </Link>
            </p>
          </div>
        </header>
      </main>

      <section id={releaseCadenceId} className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <div className="mb-6 flex items-center gap-2">
          <Layers3 className="text-primary size-4" />
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            四大产品发布节奏
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {releaseCadence.map((item, index) => (
            <BlurFade key={item.product} delay={0.06 + index * 0.04} inView>
              <MarketingMagicCard className="h-full rounded-xl p-5">
                <div className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base leading-tight font-semibold">
                      {item.product}
                    </h3>
                    <span className="text-primary bg-primary/10 rounded-md px-2 py-1 text-xs">
                      {item.stage}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.releaseWindow}
                  </p>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {item.summary}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {item.focus.map((focusPoint) => (
                      <li
                        key={focusPoint}
                        className="text-muted-foreground text-xs leading-relaxed"
                      >
                        • {focusPoint}
                      </li>
                    ))}
                  </ul>
                </div>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="featured-update" className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <BlurFade delay={0.08} inView>
          <MarketingMagicCard className="rounded-xl">
            <article
              id={featuredNews.id}
              className="group overflow-hidden rounded-xl"
            >
              <Link
                href={`/news#${featuredNews.id}`}
                aria-label={featuredNews.title}
                className="flex h-full flex-col lg:flex-row"
              >
                <div className="overflow-hidden border-b lg:w-1/2 lg:border-r lg:border-b-0">
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-primary bg-primary/10 rounded-md px-2 py-1 text-xs">
                      {featuredNews.category}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatNewsDate(featuredNews.date)}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-muted-foreground text-xs">
                      {featuredNews.readTime}
                    </span>
                  </div>
                  <h2 className="group-hover:text-primary text-2xl leading-tight font-semibold tracking-tight transition-colors">
                    {featuredNews.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {featuredNews.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {featuredNews.relatedProducts.map((product) => (
                      <span
                        key={product}
                        className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                  <span
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "mt-auto w-fit"
                    )}
                  >
                    {CTA_TEXT.viewDetail}
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </article>
          </MarketingMagicCard>
        </BlurFade>
      </section>

      <section id="enterprise-feed" className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((item, index) => (
            <BlurFade key={item.id} delay={0.06 + index * 0.03} inView>
              <MarketingMagicCard className="h-full rounded-xl">
                <article
                  id={item.id}
                  className="group h-full overflow-hidden rounded-xl"
                >
                  <Link
                    href={`/news#${item.id}`}
                    aria-label={item.title}
                    className="flex h-full flex-col"
                  >
                    <div className="overflow-hidden border-b">
                      <img
                        src={item.image}
                        alt={item.title}
                        width={1280}
                        height={720}
                        className="h-auto w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col space-y-3 p-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-primary bg-primary/10 rounded-md px-2 py-1 text-xs">
                            {item.category}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatNewsDate(item.date)}
                          </span>
                        </div>
                        <h3 className="group-hover:text-primary line-clamp-2 text-xl leading-tight font-semibold transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                        <span>{item.readTime}</span>
                        <span>·</span>
                        {item.relatedProducts.map((product) => (
                          <span key={`${item.id}-${product}`}>{product}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </article>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="milestones" className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <div className="mb-6 flex items-center gap-2">
          <CalendarDays className="text-primary size-4" />
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            阶段里程碑
          </h2>
        </div>
        <div className="space-y-3">
          {milestoneTimeline.map((item, index) => (
            <BlurFade
              key={item.period + item.title}
              delay={0.06 + index * 0.04}
              inView
            >
              <MarketingMagicCard className="rounded-xl p-5">
                <h3 className="text-base leading-tight font-semibold">
                  {item.period} · {item.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {item.detail}
                </p>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="media-kit" className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <div className="mb-6 flex items-center gap-2">
          <FolderKanban className="text-primary size-4" />
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            媒体资料中心
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {mediaResources.map((resource, index) => (
            <BlurFade key={resource.title} delay={0.06 + index * 0.04} inView>
              <MarketingMagicCard className="h-full rounded-xl p-5">
                <div className="flex h-full flex-col">
                  <h3 className="text-base font-semibold">{resource.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {resource.description}
                  </p>
                  <a
                    href={resource.href}
                    aria-label={`${resource.actionLabel}：${resource.title}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-5 w-fit"
                    )}
                  >
                    {resource.actionLabel}
                    <Download className="size-4" />
                  </a>
                </div>
              </MarketingMagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
