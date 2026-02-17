import Link from "next/link"
import {
  Building2,
  ChevronRight,
  Headset,
  Layers3,
  ShieldCheck,
} from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MarketingMagicCard } from "@/components/marketing/marketing-magic-card"

export function CTASection() {
  const highlightItems = [
    {
      icon: Layers3,
      title: "全链路咨询",
      description: "围绕产品、定价、接入路径给出可执行建议。",
    },
    {
      icon: ShieldCheck,
      title: "快速响应",
      description: "工作日优先响应企业咨询与合作需求。",
    },
    {
      icon: Building2,
      title: "场景适配",
      description: "支持高校团队与企业组织的不同落地节奏。",
    },
  ] as const

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="container pb-10 md:pb-14">
        <MarketingMagicCard className="relative overflow-hidden rounded-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(158,122,255,0.22)_0%,rgba(254,139,187,0.1)_42%,transparent_78%)]"
          />
          <div className="relative grid gap-6 p-6 md:p-8 lg:grid-cols-[1.35fr_1fr] lg:gap-8 lg:p-10">
            <div>
              <div className="text-primary bg-primary/10 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                <Headset className="size-3.5" />
                企业联络入口
              </div>
              <h2 className="text-foreground mt-4 text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
                立即开始构建你的 AI 产品
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed md:text-base">
                从想法到落地，统一提供产品咨询、报价沟通与技术支持，帮助你更快完成决策与接入。
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {highlightItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <article
                      key={item.title}
                      className="bg-muted/55 border-border/65 rounded-xl border px-3.5 py-3"
                    >
                      <Icon className="text-primary size-4" />
                      <h3 className="text-foreground mt-2 text-sm font-semibold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    </article>
                  )
                })}
              </div>
            </div>

            <aside className="bg-background/80 border-border/70 flex h-full flex-col justify-between rounded-xl border p-4 backdrop-blur-sm md:p-5">
              <div>
                <h3 className="text-foreground text-base font-semibold tracking-tight md:text-lg">
                  联系与合作
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  选择你的当前需求入口
                </p>

                <div className="mt-4 space-y-2">
                  <div className="bg-muted/60 border-border/65 rounded-lg border px-3 py-2.5">
                    <p className="text-foreground text-sm font-medium">
                      商务合作
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      bd@yunyan.ai
                    </p>
                  </div>
                  <div className="bg-muted/60 border-border/65 rounded-lg border px-3 py-2.5">
                    <p className="text-foreground text-sm font-medium">
                      技术支持
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      support@yunyan.ai
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                <a
                  href={CTA_LINK.businessMail}
                  aria-label={CTA_TEXT.getEnterpriseQuote}
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  {CTA_TEXT.getEnterpriseQuote}
                  <ChevronRight className="size-4" />
                </a>
                <a
                  href={CTA_LINK.supportMail}
                  aria-label={CTA_TEXT.contactSupport}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" })
                  )}
                >
                  {CTA_TEXT.contactSupport}
                </a>
                <Link
                  href={CTA_LINK.products}
                  prefetch
                  aria-label={CTA_TEXT.viewProducts}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "ghost" })
                  )}
                >
                  {CTA_TEXT.viewProducts}
                </Link>
              </div>
            </aside>
          </div>
        </MarketingMagicCard>
      </div>
    </section>
  )
}
