import type { ComponentType, SVGProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronRight,
  Code2,
  LifeBuoy,
  Mail,
  Presentation,
  Sparkles,
  Workflow,
} from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { createMarketingMetadata } from "@/lib/marketing-seo"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export const metadata: Metadata = createMarketingMetadata({
  title: "帮助中心",
  description:
    "在云衍帮助中心查看四大产品使用路径、常见问题与支持联系方式，快速完成从了解到落地的闭环。",
  path: "/help",
  keywords: ["帮助中心", "使用路径", "常见问题", "技术支持"],
})

interface ProductGuideItem {
  name: string
  summary: string
  scenario: string
  path: readonly string[]
  outcome: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface FaqItem {
  id: string
  question: string
  answer: string
}

const productGuides: ProductGuideItem[] = [
  {
    name: "云衍 Canvas",
    summary: "系统设计与结构化表达入口。",
    scenario: "课程项目建模 / 业务流程梳理 / 架构讨论",
    path: ["输入目标场景", "生成流程图或ER图", "在线调整并导出"],
    outcome: "快速形成可沟通、可评审的设计稿。",
    icon: Sparkles,
  },
  {
    name: "云衍 Code",
    summary: "工程实现与代码落地入口。",
    scenario: "原型开发 / 毕设实现 / MVP 构建",
    path: ["描述功能需求", "生成前后端与数据库结构", "按项目标准组织代码"],
    outcome: "更快获得可运行工程骨架。",
    icon: Code2,
  },
  {
    name: "云衍 Slides",
    summary: "汇报演示与表达交付入口。",
    scenario: "课程汇报 / 项目路演 / 方案讲解",
    path: ["输入主题与受众", "生成页面结构与核心文案", "调整视觉并导出"],
    outcome: "形成结构完整、表达清晰的演示材料。",
    icon: Presentation,
  },
  {
    name: "云衍 Studio",
    summary: "端到端编排与系统生成入口。",
    scenario: "多模块联动项目 / 企业级原型验证",
    path: ["定义业务目标", "联动生成设计与工程资产", "按场景持续迭代"],
    outcome: "缩短从想法到可交付系统的周期。",
    icon: Workflow,
  },
]

const faqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "应该先使用哪个产品？",
    answer:
      "建议优先从云衍 Canvas 开始完成结构设计，再进入云衍 Code 进行工程实现；若需要汇报材料，可使用云衍 Slides；需要全链路联动时使用云衍 Studio。",
  },
  {
    id: "faq-2",
    question: "云衍 Slides 和传统演示工具有什么关系？",
    answer:
      "云衍 Slides 是面向内容生成与结构化表达的演示能力模块，定位是“先生成再精修”，可作为课程汇报、方案展示的快速起点。",
  },
  {
    id: "faq-3",
    question: "云衍 Studio 当前处于什么阶段？",
    answer:
      "云衍 Studio 当前为阶段性内测与迭代能力，主要用于验证端到端自动化编排路径，开放节奏以官方动态页公告为准。",
  },
  {
    id: "faq-4",
    question: "如何理解 Free / Pro / Enterprise 的差异？",
    answer:
      "Free 适合体验与学习，Pro 适合高频个人或项目使用，Enterprise 面向团队与企业接入场景。可先试用再按需升级。",
  },
  {
    id: "faq-5",
    question: "这是静态官网，是否提供登录入口？",
    answer:
      "当前官网用于品牌展示与信息导航，不提供登录注册流程。产品接入与合作请通过底部联系入口或邮件沟通。",
  },
  {
    id: "faq-6",
    question: "遇到产品问题或合作需求怎么联系？",
    answer:
      "技术支持请发送邮件至 support@yunyan.ai，商务合作请联系 bd@yunyan.ai。我们会按优先级尽快响应。",
  },
]

export default function HelpPage() {
  const usagePathsId = "usage-paths"

  return (
    <AIProductLayout>
      <article className={AI_PRODUCT_HERO_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Link
              href={`#${usagePathsId}`}
              aria-label="查看四大产品使用路径"
              className={MARKETING_NAV_PILL_CLASS}
            >
              <MarketingNavPillInner>
                云衍 YunYan AI 生产力操作系统
              </MarketingNavPillInner>
            </Link>
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
            帮助中心
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            围绕云衍 AI 操作系统四大产品的使用路径与常见问题，
            <br className="hidden sm:block" />
            帮你更快从了解走向落地。
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
            优先查看四大产品使用路径：
            <Link
              href={`#${usagePathsId}`}
              aria-label="查看四大产品使用路径"
              className="text-foreground ml-1 underline underline-offset-4"
            >
              使用路径
            </Link>
          </p>
        </div>
      </article>

      <section id={usagePathsId} className={AI_PRODUCT_ANCHOR_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          四大产品使用路径
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          围绕 Canvas、Code、Slides、Studio 提供建议使用顺序与交付结果。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {productGuides.map((guide, index) => {
            const Icon = guide.icon
            return (
              <BlurFade key={guide.name} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl">
                  <article className="p-6">
                    <div className="bg-primary/10 text-primary mb-3 inline-flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-foreground text-xl font-semibold tracking-tight">
                      {guide.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {guide.summary}
                    </p>
                    <p className="text-muted-foreground mt-4 text-sm">
                      适用场景：{guide.scenario}
                    </p>
                    <ol className="mt-3 space-y-1.5">
                      {guide.path.map((step, stepIndex) => (
                        <li
                          key={step}
                          className="text-muted-foreground text-sm"
                        >
                          {stepIndex + 1}. {step}
                        </li>
                      ))}
                    </ol>
                    <p className="text-muted-foreground mt-4 text-sm">
                      交付结果：{guide.outcome}
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
          常见问题
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          聚焦术语定义、阶段说明、价格策略与官网使用边界，减少理解偏差。
        </p>
        <BlurFade delay={0.08} inView>
          <Card className="rounded-xl border">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-base">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </BlurFade>
      </section>

      <section className={AI_PRODUCT_SECTION_CONTAINER}>
        <h2 className="text-foreground mb-8 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl">
          支持与合作
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
          统一通过技术支持与商务合作两条路径处理问题反馈和接入需求。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <BlurFade delay={0.08} inView>
            <MarketingMagicCard className="h-full rounded-xl">
              <article className="p-6">
                <h3 className="text-foreground inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <LifeBuoy className="text-primary size-5" />
                  技术支持
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  产品使用问题、功能反馈与故障排查支持。
                </p>
                <Link
                  href={CTA_LINK.supportMail}
                  aria-label={CTA_TEXT.contactSupport}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-4"
                  )}
                >
                  {CTA_TEXT.contactSupport}
                  <Mail className="size-4" />
                </Link>
              </article>
            </MarketingMagicCard>
          </BlurFade>

          <BlurFade delay={0.12} inView>
            <MarketingMagicCard className="h-full rounded-xl">
              <article className="p-6">
                <h3 className="text-foreground inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <LifeBuoy className="text-primary size-5" />
                  商务合作
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  企业采购、合作接入与联合方案咨询。
                </p>
                <Link
                  href={CTA_LINK.contact}
                  aria-label={CTA_TEXT.getEnterpriseQuote}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-4"
                  )}
                >
                  {CTA_TEXT.getEnterpriseQuote}
                  <ChevronRight className="size-4" />
                </Link>
              </article>
            </MarketingMagicCard>
          </BlurFade>
        </div>
      </section>

      <CTASection />
    </AIProductLayout>
  )
}
