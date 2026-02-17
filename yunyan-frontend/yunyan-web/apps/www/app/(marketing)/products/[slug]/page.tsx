import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowRight,
  Blocks,
  ChevronRight,
  ExternalLink,
  Layers3,
  Route,
  TerminalSquare,
} from "lucide-react"
import type { Product, WithContext } from "schema-dts"

import { siteConfig } from "@/config/site"
import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"
import {
  createProductPricingHref,
  getProductBySlug,
  PRODUCT_DETAILS,
  PRODUCT_ORDER,
} from "@/lib/product-catalog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  AI_PRODUCT_HERO_CONTAINER,
  AI_PRODUCT_SECTION_CONTAINER,
  AI_PRODUCT_TOC_ANCHOR_CONTAINER,
  AIProductLayout,
} from "@/components/marketing/ai-product-layout"
import { MarketingMagicCard } from "@/components/marketing/marketing-magic-card"
import {
  MARKETING_NAV_PILL_CLASS,
  MarketingNavPillInner,
} from "@/components/marketing/marketing-nav-pill"
import { ProductDetailToc } from "@/components/products/product-detail-toc"
import { ProductSelectedPlanHint } from "@/components/products/product-selected-plan-hint"
import { CTASection } from "@/components/sections/cta"
import { BlurFade } from "@/registry/magicui/blur-fade"

export const dynamicParams = false

interface ProductDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

function getMetadataBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || siteConfig.url
}

export function generateStaticParams() {
  return PRODUCT_ORDER.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: Pick<ProductDetailPageProps, "params">): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {}
  }

  const metadataBaseUrl = getMetadataBaseUrl()
  const canonicalUrl = new URL(product.detailHref, metadataBaseUrl).toString()
  const ogUrl = new URL("/og", metadataBaseUrl)
  ogUrl.searchParams.set("title", `${product.name} | 云衍 YunYan`)
  ogUrl.searchParams.set("description", product.heroSubheadline)

  return {
    title: `${product.name} | 云衍 YunYan`,
    description: product.heroSubheadline,
    keywords: [
      ...siteConfig.keywords,
      product.name,
      product.infrastructureName,
      product.engineName,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | 云衍 YunYan`,
      description: product.heroSubheadline,
      url: canonicalUrl,
      type: "website",
      siteName: "云衍 YunYan",
      locale: "zh_CN",
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | 云衍 YunYan`,
      description: product.heroSubheadline,
      images: [ogUrl.toString()],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) {
    notFound()
  }

  const siblingProducts = PRODUCT_ORDER.filter((item) => item !== product.slug)

  const conversionSteps = [
    "进入定价页",
    "选择套餐",
    "返回产品详情页",
    "点击启动产品",
    `跳转到 ${product.appDomain}`,
  ] as const

  const sectionIds = {
    capabilities: `${product.slug}-capabilities`,
    workflow: `${product.slug}-workflow`,
    useCases: `${product.slug}-use-cases`,
    integration: `${product.slug}-integration`,
    pricing: `${product.slug}-pricing`,
    finalCta: `${product.slug}-final-cta`,
  } as const

  const tocItems = [
    {
      id: sectionIds.capabilities,
      label: "核心能力",
    },
    {
      id: sectionIds.workflow,
      label: "生成流程",
    },
    {
      id: sectionIds.useCases,
      label: "应用场景",
    },
    {
      id: sectionIds.integration,
      label: "开发集成",
    },
    {
      id: sectionIds.pricing,
      label: "套餐入口",
    },
    {
      id: sectionIds.finalCta,
      label: "启动入口",
    },
  ] as const

  const metadataBaseUrl = getMetadataBaseUrl()
  const productUrl = new URL(product.detailHref, metadataBaseUrl).toString()
  const pricingUrl = new URL(
    createProductPricingHref(product.slug),
    metadataBaseUrl
  ).toString()

  const productStructuredData: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.heroSubheadline,
    category: product.infrastructureName,
    brand: {
      "@type": "Brand",
      name: "云衍 YunYan",
      url: siteConfig.url,
    },
    url: productUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "CNY",
      availability: "https://schema.org/InStock",
      url: pricingUrl,
    },
    sameAs: [product.appHref],
  }

  const serializedStructuredData = JSON.stringify(
    productStructuredData
  ).replace(/</g, "\\u003c")

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedStructuredData }}
      />
      <AIProductLayout
        density="compact"
        className="[--product-detail-anchor-offset:calc(var(--header-height)+var(--product-toc-height)+0.75rem)] [--product-toc-height:3.5rem]"
      >
        <article className={AI_PRODUCT_HERO_CONTAINER}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <Link
                href={`#${sectionIds.capabilities}`}
                aria-label={`定位到${product.name}核心能力模块`}
                className={MARKETING_NAV_PILL_CLASS}
              >
                <MarketingNavPillInner>
                  {product.infrastructureName}
                </MarketingNavPillInner>
              </Link>
            </div>
            <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tighter md:text-6xl">
              {product.heroHeadline}
            </h1>
            <p className="text-muted-foreground/80 mx-auto mt-4 max-w-2xl text-sm leading-relaxed">
              {product.name} · {product.engineName}
            </p>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
              {product.heroSubheadline}
            </p>
            <p className="text-muted-foreground/80 mx-auto mt-3 max-w-2xl text-sm leading-relaxed">
              {product.heroStatement}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={createProductPricingHref(product.slug)}
                aria-label={product.pricingCtaLabel}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" })
                )}
              >
                {product.pricingCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`#${sectionIds.workflow}`}
                aria-label="定位到生成流程"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                定位生成流程
              </Link>
            </div>

            <Suspense fallback={null}>
              <ProductSelectedPlanHint />
            </Suspense>
          </div>
        </article>

        <ProductDetailToc items={tocItems} />

        <section
          id={sectionIds.capabilities}
          className={cn(
            AI_PRODUCT_TOC_ANCHOR_CONTAINER,
            "product-detail-anchor-section"
          )}
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <Layers3 className="text-primary size-5" />
            <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
              核心能力
            </h2>
          </div>
          <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
            {product.infrastructureTagline}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {product.capabilities.map((item, index) => (
              <BlurFade key={item.title} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </MarketingMagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        <section
          id={sectionIds.workflow}
          className={cn(
            AI_PRODUCT_TOC_ANCHOR_CONTAINER,
            "product-detail-anchor-section"
          )}
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <Route className="text-primary size-5" />
            <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
              生成流程
            </h2>
          </div>
          <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
            标准化流程：从输入需求到可交付结果，形成可复用的基础设施路径。
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-5">
            {product.workflow.map((step, index) => (
              <BlurFade key={step.title} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl p-5">
                  <p className="text-primary text-sm font-medium">
                    {step.step}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </MarketingMagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        <section
          id={sectionIds.useCases}
          className={cn(
            AI_PRODUCT_TOC_ANCHOR_CONTAINER,
            "product-detail-anchor-section"
          )}
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <Blocks className="text-primary size-5" />
            <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
              应用场景
            </h2>
          </div>
          <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
            典型场景覆盖高校、团队与企业，强调交付结果可验证、可扩展、可持续。
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {product.useCases.map((item, index) => (
              <BlurFade key={item.title} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                    结果：{item.outcome}
                  </p>
                </MarketingMagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        <section
          id={sectionIds.integration}
          className={cn(
            AI_PRODUCT_TOC_ANCHOR_CONTAINER,
            "product-detail-anchor-section"
          )}
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <TerminalSquare className="text-primary size-5" />
            <h2 className="text-foreground text-center text-3xl font-semibold tracking-tight md:text-4xl">
              开发集成
            </h2>
          </div>
          <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed md:text-base">
            支持导出、集成和脚手架生成，方便接入现有研发流程。
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {product.developerIntegration.map((item, index) => (
              <BlurFade key={item.title} delay={0.08 + index * 0.04} inView>
                <MarketingMagicCard className="h-full rounded-xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </MarketingMagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        <section
          id={sectionIds.pricing}
          className={cn(
            AI_PRODUCT_TOC_ANCHOR_CONTAINER,
            "product-detail-anchor-section"
          )}
        >
          <BlurFade delay={0.08} inView>
            <MarketingMagicCard className="rounded-xl p-6">
              <h3 className="text-2xl font-semibold">
                {product.pricingCtaLabel}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                价格页选择套餐后将回到当前产品页，再由你启动应用空间。
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
                {conversionSteps.map((step, index) => (
                  <div
                    key={step}
                    className="bg-muted text-muted-foreground flex items-center justify-center rounded-lg px-3 py-2 text-center text-xs"
                  >
                    {index + 1}. {step}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={createProductPricingHref(product.slug)}
                  aria-label={product.pricingCtaLabel}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" })
                  )}
                >
                  {product.pricingCtaLabel}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={CTA_LINK.pricing}
                  aria-label={CTA_TEXT.viewPricing}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" })
                  )}
                >
                  {CTA_TEXT.viewPricing}
                </Link>
              </div>
            </MarketingMagicCard>
          </BlurFade>
        </section>

        <section className={AI_PRODUCT_SECTION_CONTAINER}>
          <h2 className="text-foreground mb-6 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            其他核心产品
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {siblingProducts.map((item, index) => {
              const sibling = PRODUCT_DETAILS[item]
              return (
                <BlurFade key={item} delay={0.08 + index * 0.04} inView>
                  <MarketingMagicCard className="h-full rounded-xl">
                    <div className="p-6">
                      <h3 className="text-foreground text-lg font-semibold tracking-tight">
                        {sibling.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {sibling.infrastructureName}
                      </p>
                      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                        {sibling.heroStatement}
                      </p>
                      <Link
                        href={sibling.detailHref}
                        aria-label={`查看${sibling.name}详情`}
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
                </BlurFade>
              )
            })}
          </div>
        </section>

        <section
          id={sectionIds.finalCta}
          className={cn(
            AI_PRODUCT_TOC_ANCHOR_CONTAINER,
            "product-detail-anchor-section"
          )}
        >
          <BlurFade delay={0.08} inView>
            <MarketingMagicCard className="rounded-xl p-6">
              <h3 className="text-2xl font-semibold">
                {product.finalCtaTitle}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {product.finalCtaDescription}
              </p>
              <div className="bg-muted text-muted-foreground mt-5 mb-4 rounded-lg px-3 py-2 text-sm">
                应用域名：{product.appDomain}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={product.appHref}
                  prefetch={false}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${product.finalCtaLabel} - ${product.appDomain}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" })
                  )}
                >
                  {product.finalCtaLabel}
                  <ExternalLink className="size-4" />
                </Link>
                <Link
                  href={CTA_LINK.contact}
                  aria-label={CTA_TEXT.getEnterpriseQuote}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" })
                  )}
                >
                  {CTA_TEXT.getEnterpriseQuote}
                </Link>
              </div>
            </MarketingMagicCard>
          </BlurFade>
        </section>

        <CTASection />
      </AIProductLayout>
    </>
  )
}
