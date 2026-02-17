/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  communityTestimonials,
  type CommunityTestimonial,
} from "@/components/sections/data/community-testimonials"
import { ExpandableMasonarySection } from "@/components/sections/expandable-masonary-section"

function isExternalHref(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function CommunityTestimonialCard({
  avatarClassName,
  avatarText,
  content,
  handle,
  media,
  name,
  postedAt,
  school,
}: CommunityTestimonial) {
  return (
    <article className="border-border bg-card relative flex h-fit w-full break-inside-avoid flex-col gap-4 overflow-hidden rounded-xl border p-5 transition-[border-color,background-color,box-shadow] duration-200 ease-in-out hover:shadow-md">
      <div className="flex flex-row items-start justify-between tracking-normal">
        <div className="flex items-center space-x-3">
          <Avatar className="size-11">
            <AvatarFallback
              className={cn("text-sm font-semibold", avatarClassName)}
            >
              {avatarText}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <div className="text-foreground flex items-center font-medium whitespace-nowrap">
              {name}
            </div>
            <div className="text-muted-foreground text-sm">{handle}</div>
            <div className="text-muted-foreground text-xs">{school}</div>
          </div>
        </div>
      </div>

      <div className="text-foreground text-[15px] leading-relaxed tracking-normal wrap-break-word">
        {content}
      </div>

      {media ? (
        <div className="flex flex-1 items-center justify-center">
          <img
            src={media.src}
            alt={media.alt}
            loading="lazy"
            className="w-full rounded-xl border object-cover shadow-sm"
          />
        </div>
      ) : null}

      <div className="text-muted-foreground text-xs">{postedAt}</div>
    </article>
  )
}

function CommunityLink({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  const isExternal = isExternalHref(href)

  return (
    <Link
      href={href}
      prefetch={isExternal ? false : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
      className="group relative block contain-layout"
    >
      {children}
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/5 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-in-out will-change-[opacity] group-hover:opacity-100">
        <Button
          variant="default"
          size="default"
          className="pointer-events-none h-8 w-fit translate-y-3 px-2 transition-transform duration-200 ease-in-out will-change-transform group-hover:translate-y-0"
        >
          查看评价
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  )
}

export function Testimonials() {
  return (
    <section id="testimonials" className="container mx-auto py-10 md:py-14">
      <h2 className="text-foreground mb-10 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl lg:text-5xl">
        社区用户怎么说
      </h2>
      <ExpandableMasonarySection>
        {communityTestimonials.map((item) => (
          <CommunityLink key={item.id} href={item.link}>
            <CommunityTestimonialCard {...item} />
          </CommunityLink>
        ))}
      </ExpandableMasonarySection>
    </section>
  )
}
