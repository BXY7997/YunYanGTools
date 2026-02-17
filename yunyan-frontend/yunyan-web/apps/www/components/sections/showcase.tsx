import Image from "next/image"
import Link from "next/link"
import { ChevronRightIcon } from "@radix-ui/react-icons"

import { CTA_LINK } from "@/lib/cta-map"
import { PRODUCT_DETAILS } from "@/lib/product-catalog"
import { cn } from "@/lib/utils"
import { Marquee } from "@/components/magicui/marquee"

function isExternalHref(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export interface ShowcaseCardProps {
  title: string
  image: string
  href: string
  affiliation?: string
  className?: string
}

export function ShowcaseCard({
  title,
  image,
  href,
  affiliation,
  className,
}: ShowcaseCardProps) {
  const isExternal = isExternalHref(href)

  return (
    <Link
      href={href}
      prefetch={isExternal ? false : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col gap-2 overflow-hidden",
        className
      )}
    >
      <Image
        src={image}
        alt={title}
        width={500}
        height={300}
        className="size-full h-[300px] max-h-[300px] rounded-xl object-cover"
      />

      <div className="flex flex-col">
        <div className="text-foreground group-hover:text-primary inline-flex items-center justify-start gap-1 text-xl font-semibold transition-colors duration-200">
          {title}
          <ChevronRightIcon className="size-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
        <p className="text-muted-foreground text-sm">{affiliation}</p>
      </div>
    </Link>
  )
}

const productShowcases = [
  {
    title: "云衍 Canvas",
    image: "https://cdn.magicui.design/showcase/lyra.png",
    href: PRODUCT_DETAILS.canvas.detailHref,
    affiliation: "AI驱动的系统设计画布，自动生成架构图、ER图与流程图",
  },
  {
    title: "云衍 Code",
    image: "https://cdn.magicui.design/showcase/langfuse.png",
    href: PRODUCT_DETAILS.code.detailHref,
    affiliation: "AI自动生成完整后端与前端系统",
  },
  {
    title: "云衍 Slides",
    image: "https://cdn.magicui.design/showcase/querylab.png",
    href: PRODUCT_DETAILS.slides.detailHref,
    affiliation: "AI自动创建专业级演示内容",
  },
  {
    title: "云衍 Studio",
    image: "https://cdn.magicui.design/showcase/aomni.png",
    href: PRODUCT_DETAILS.studio.detailHref,
    affiliation: "AI自动构建完整软件产品",
  },
  {
    title: "云衍 AI OS · 控制台",
    image: "https://cdn.magicui.design/showcase/querylab.png",
    href: CTA_LINK.products,
    affiliation: "统一管理多产品能力与团队协作权限",
  },
  {
    title: "云衍 AI OS · 企业版",
    image: "https://cdn.magicui.design/showcase/aomni.png",
    href: CTA_LINK.products,
    affiliation: "企业专属模型策略与私有化部署支持",
  },
  {
    title: "云衍 Campus · 助手",
    image: "https://cdn.magicui.design/showcase/lyra.png",
    href: CTA_LINK.products,
    affiliation: "校园任务与资料处理的智能协作助手",
  },
  {
    title: "云衍 Campus · 咨询",
    image: "https://cdn.magicui.design/showcase/langfuse.png",
    href: CTA_LINK.products,
    affiliation: "面向学生场景的问答与流程引导能力",
  },
  {
    title: "云衍 Canvas · 流程图",
    image: "https://cdn.magicui.design/showcase/querylab.png",
    href: CTA_LINK.products,
    affiliation: "一键生成项目流程图与协作视图",
  },
  {
    title: "云衍 Code · 全栈",
    image: "https://cdn.magicui.design/showcase/aomni.png",
    href: CTA_LINK.products,
    affiliation: "前后端联动生成并支持持续迭代",
  },
  {
    title: "云衍 Slides · 路演版",
    image: "https://cdn.magicui.design/showcase/lyra.png",
    href: CTA_LINK.products,
    affiliation: "一键生成路演结构与演示节奏，快速完成表达打磨",
  },
  {
    title: "云衍 Studio · 交付台",
    image: "https://cdn.magicui.design/showcase/langfuse.png",
    href: CTA_LINK.products,
    affiliation: "从需求到上线的企业级交付流程一体化编排",
  },
] as const

export function Showcase() {
  return (
    <section id="showcase" className="container py-10 md:py-14">
      <h2
        id="products"
        className="text-foreground mb-2 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl lg:text-5xl"
      >
        完整AI工具矩阵
      </h2>
      <h3 className="text-foreground/80 mx-auto mb-8 text-center text-lg font-medium tracking-tight text-balance">
        覆盖开发、设计与创作的完整生产力系统。
      </h3>
      <div className="relative flex flex-col">
        <Marquee className="max-w-screen [--duration:90s]">
          {productShowcases.map((item) => (
            <ShowcaseCard key={item.title} {...item} />
          ))}
        </Marquee>
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 h-full w-1/12 bg-linear-to-r"></div>
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 h-full w-1/12 bg-linear-to-l"></div>
      </div>
    </section>
  )
}
