import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  MARKETING_NAV_PILL_CLASS,
  MarketingNavPillInner,
} from "@/components/marketing/marketing-nav-pill"
import { TechStack } from "@/components/tech-stack"

export function Hero() {
  return (
    <section id="hero">
      <div className="relative h-full overflow-hidden py-5 md:py-14">
        <div className="z-10 flex flex-col">
          <div className="mt-10 grid grid-cols-1 md:mt-20">
            <div className="flex flex-col items-start gap-6 px-7 pb-8 text-center md:items-center md:px-10">
              <Link
                href={CTA_LINK.products}
                prefetch
                aria-label={CTA_TEXT.viewProducts}
                className={MARKETING_NAV_PILL_CLASS}
              >
                <MarketingNavPillInner>
                  云衍 YunYan AI 生产力操作系统
                </MarketingNavPillInner>
              </Link>
              <div className="relative flex flex-col gap-4 md:items-center lg:flex-row">
                <h1
                  className={cn(
                    "text-black dark:text-white",
                    "relative mx-0 max-w-174 pt-5 md:mx-auto md:px-4 md:py-2",
                    "text-left font-semibold tracking-tighter text-balance md:text-center",
                    "text-5xl sm:text-7xl md:text-7xl lg:text-7xl"
                  )}
                >
                  云衍 YunYan
                  <br />
                  AI 生产力的下一次进化
                </h1>
              </div>

              <p className="text-primary max-w-xl text-left text-base tracking-tight text-balance md:text-center md:text-lg">
                用AI自动完成代码生成、系统设计、Slides创作与架构设计。
                <br />
                从想法到产品，只需一次输入。
              </p>

              <div className="flex w-full flex-col gap-4 gap-y-2 md:mx-auto md:max-w-xs md:flex-row md:justify-center">
                <Link
                  href={CTA_LINK.contact}
                  prefetch
                  aria-label={CTA_TEXT.getEnterpriseQuote}
                  className={cn(
                    buttonVariants({
                      variant: "rainbow",
                      size: "lg",
                    }),
                    "w-full gap-2"
                  )}
                >
                  {CTA_TEXT.getEnterpriseQuote}
                  <ChevronRight className="ml-1 size-4 shrink-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
                </Link>
                <Link
                  href={CTA_LINK.products}
                  prefetch
                  aria-label={CTA_TEXT.viewProducts}
                  className={cn(
                    buttonVariants({
                      size: "lg",
                      variant: "rainbow-outline",
                    }),
                    "w-full gap-2"
                  )}
                >
                  {CTA_TEXT.viewProducts}
                  <ChevronRight className="ml-1 size-4 shrink-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-56 items-center justify-center">
            <TechStack
              className="mx-auto flex w-full items-center justify-between"
              technologies={[
                "react",
                "typescript",
                "tailwindcss",
                "motion",
                "shadcn",
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
