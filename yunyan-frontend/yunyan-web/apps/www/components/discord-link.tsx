import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Icons } from "@/components/icons"
import { PingDot } from "@/components/ping-dot"

interface DiscordWidgetResponse {
  presence_count?: number
}

async function getDiscordPresenceCount() {
  try {
    const response = await fetch(
      "https://discord.com/api/guilds/1151315619246002176/widget.json",
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (3600 seconds)
      }
    )

    if (!response.ok) {
      return null
    }

    const json = (await response.json()) as DiscordWidgetResponse
    const presenceCount = json.presence_count

    return typeof presenceCount === "number" ? presenceCount : null
  } catch {
    return null
  }
}

export function DiscordLink({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "shadow-none transition-colors",
            className
          )}
          href={siteConfig.links.discord}
          target="_blank"
          rel="noreferrer"
        >
          <Icons.discord />
          <React.Suspense fallback={<Skeleton className="h-4 w-8" />}>
            <ActiveMembersCount className="text-muted-foreground" />
          </React.Suspense>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <React.Suspense fallback={<Skeleton className="h-4 w-8" />}>
          <span>
            <ActiveMembersCount className="text-background" /> members online in
            our Discord community
          </span>
        </React.Suspense>
      </TooltipContent>
    </Tooltip>
  )
}

export async function ActiveMembersCount({
  className,
}: {
  className?: string
}) {
  const presenceCount = await getDiscordPresenceCount()

  if (presenceCount === null) {
    return (
      <div className={cn("ml-2 inline-flex items-center gap-1", className)}>
        <PingDot />
        <span className="min-w-[2rem] text-xs font-medium tabular-nums">
          --
        </span>
      </div>
    )
  }

  return (
    <div className={cn("ml-2 inline-flex items-center gap-1", className)}>
      <PingDot />
      <span className="min-w-[2rem] text-xs font-medium tabular-nums">
        {presenceCount >= 1000
          ? `${(presenceCount / 1000).toFixed(1)}k`
          : presenceCount.toLocaleString()}
      </span>
    </div>
  )
}
