import type { Metadata } from "next"

import { createMarketingMetadata } from "@/lib/marketing-seo"
import { showcaseSource } from "@/lib/source"
import { MarketingMagicCard } from "@/components/marketing/marketing-magic-card"
import { ShowcaseCard } from "@/components/sections/showcase"
import { BlurFade } from "@/registry/magicui/blur-fade"

export const metadata: Metadata = createMarketingMetadata({
  title: "产品能力演示",
  description:
    "查看高校团队与企业基于云衍构建的项目案例，了解 AI 生产力工具在真实场景中的落地效果。",
  path: "/showcase",
  keywords: ["产品能力演示", "案例展示", "项目案例", "云衍实践"],
})

export default function Page() {
  const showcases = showcaseSource.getPages()
  return (
    <article className="container max-w-[120ch] py-14">
      <h2 className="text-foreground mb-2 text-center text-5xl leading-[1.2] font-bold tracking-tighter">
        案例展示
      </h2>
      <h3 className="text-foreground/80 mx-auto mb-8 text-center text-lg font-medium tracking-tight text-balance">
        校园团队与企业正在基于云衍构建项目展示页面。
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showcases.map((showcase, idx) => (
          <BlurFade key={idx} delay={0.25 + idx * 0.05}>
            <MarketingMagicCard className="h-full rounded-xl p-4">
              <ShowcaseCard
                {...showcase}
                href={showcase.url}
                title={showcase.data.title ?? ""}
                image={showcase.data.image ?? ""}
                affiliation={showcase.data.affiliation ?? ""}
              />
            </MarketingMagicCard>
          </BlurFade>
        ))}
      </div>
    </article>
  )
}
