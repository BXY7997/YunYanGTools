import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { CTA_LINK, CTA_TEXT } from "@/lib/cta-map"

export function DealBanner() {
  return (
    <div className="bg-background relative top-0 py-3 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-12 md:flex-row">
        <Link
          href={CTA_LINK.pricing}
          aria-label={CTA_TEXT.viewPricing}
          className="flex flex-row items-center justify-center gap-2 text-center text-sm leading-loose font-bold text-black dark:text-white"
        >
          套餐与权益更新：立即查看云衍最新价格说明
          <ExternalLink className="size-4" />
        </Link>
      </div>
      <hr className="absolute bottom-0 m-0 h-px w-full bg-neutral-200/30" />
    </div>
  )
}
