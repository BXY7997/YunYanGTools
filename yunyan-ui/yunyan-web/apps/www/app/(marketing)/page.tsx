import type { Metadata } from "next"
import type { Organization, WebSite, WithContext } from "schema-dts"

import { siteConfig } from "@/config/site"
import { createMarketingMetadata } from "@/lib/marketing-seo"
import { absoluteUrl } from "@/lib/utils"
import { CTASection } from "@/components/sections/cta"
import { Hero } from "@/components/sections/hero"
import { Showcase } from "@/components/sections/showcase"
import { Testimonials } from "@/components/sections/testimonials"
import { VideoTestimonials } from "@/components/sections/video-testimonials"

const HOME_DESCRIPTION =
  "云衍 YunYan 面向高校与企业场景，提供 Canvas、Code、Slides、Studio 四大 AI 产品能力，帮助团队从想法到交付实现一体化落地。"

export const metadata: Metadata = createMarketingMetadata({
  title: "AI 生产力操作系统",
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: [
    "云衍 YunYan",
    "AI 生产力操作系统",
    "Canvas",
    "Code",
    "Slides",
    "Studio",
  ],
})

export default function Home() {
  const organizationStructuredData: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "云衍 YunYan",
    alternateName: "YUNYAN",
    url: siteConfig.url,
    logo: absoluteUrl("/icon.png"),
    description: HOME_DESCRIPTION,
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.instagram,
      siteConfig.links.github,
    ],
  }

  const websiteStructuredData: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "云衍 YunYan",
    url: siteConfig.url,
    inLanguage: "zh-CN",
    description: HOME_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: "云衍 YunYan",
      url: siteConfig.url,
    },
  }

  const serializedOrganizationStructuredData = JSON.stringify(
    organizationStructuredData
  ).replace(/</g, "\\u003c")
  const serializedWebsiteStructuredData = JSON.stringify(
    websiteStructuredData
  ).replace(/</g, "\\u003c")

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializedOrganizationStructuredData,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedWebsiteStructuredData }}
      />
      <div className="pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Hero />
        <Showcase />
        <Testimonials />
        <VideoTestimonials />
        <CTASection />
      </div>
    </>
  )
}
