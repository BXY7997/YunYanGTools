"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { CTA_LINK } from "@/lib/cta-map"
import { capturePosthog } from "@/lib/posthog"

export function ProBanner() {
  return (
    <div className="group relative top-0 bg-indigo-600 py-3 text-white transition-all duration-300 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-12 md:flex-row">
        <Link
          href={CTA_LINK.contact}
          aria-label="查看企业体验与联系入口"
          onClick={() => capturePosthog("banner_cta_clicked")}
          className="inline-flex text-xs leading-normal md:text-sm"
        >
          ✨{" "}
          <span className="ml-1 font-[580] dark:font-[550]">
            {" "}
            云衍企业智能平台开放体验中，支持私有化部署与行业化定制
          </span>{" "}
          <ChevronRight className="mt-[3px] ml-1 hidden size-4 transition-all duration-300 ease-out group-hover:translate-x-1 lg:inline-block" />
        </Link>
      </div>
      <hr className="absolute bottom-0 m-0 h-px w-full bg-neutral-200/30" />
    </div>
  )
}

export function ProductHuntBanner() {
  return (
    <div className="group relative top-0 bg-[#ff6154] py-3 text-white transition-all duration-300 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-12 md:flex-row">
        <Link
          href={CTA_LINK.products}
          aria-label="查看云衍产品矩阵"
          onClick={() => capturePosthog("product_hunt_banner_clicked")}
          className="inline-flex text-xs leading-normal md:text-sm"
        >
          ✨{" "}
          <span className="ml-1 font-[580] dark:font-[550]">
            {" "}
            查看云衍子产品矩阵：智能体开发、资讯引擎、知识问答、数字员工
          </span>{" "}
          <ChevronRight className="mt-[3px] ml-1 hidden size-4 transition-all duration-300 ease-out group-hover:translate-x-1 lg:inline-block" />
        </Link>
      </div>
      <hr className="absolute bottom-0 m-0 h-px w-full bg-neutral-200/30" />
    </div>
  )
}

export function SiteBanner() {
  return <ProBanner />
}
