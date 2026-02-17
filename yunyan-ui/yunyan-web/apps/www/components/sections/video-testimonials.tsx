"use client"

import type { SVGProps } from "react"
import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"

import {
  featuredVideoItems,
  getFeaturedVideoLayoutClassName,
} from "@/components/sections/data/featured-videos"

function buildEmbedSrc(url: string, shouldAutoplay: boolean) {
  if (!shouldAutoplay) {
    return url
  }

  return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`
}

function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <title>播放</title>
      <circle cx="30" cy="30" r="30" opacity="0.85" />
      <polygon points="24,18 44,30 24,42" fill="#fff" />
    </svg>
  )
}

export function VideoTestimonials() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section
      id="video-testimonials"
      className="container mx-auto py-10 md:py-14"
    >
      <h2 className="text-foreground mb-10 text-center text-3xl leading-[1.2] font-semibold tracking-tighter text-balance md:text-4xl lg:text-5xl">
        国内平台精选内容
      </h2>
      <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:auto-rows-[300px] md:grid-cols-6 md:gap-6 lg:auto-rows-[320px]">
        {featuredVideoItems.map((item, index) => {
          const isActive = activeIndex === index
          const columnClasses = getFeaturedVideoLayoutClassName(item.layout)

          return (
            <motion.button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`播放精选内容：${item.platform} - ${item.title}`}
              onClick={() => {
                setActiveIndex(index)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setActiveIndex(index)
                }
              }}
              className={`group bg-card focus-visible:outline-primary border-border hover:border-border/80 relative cursor-pointer overflow-hidden rounded-xl border transition-[border-color,transform] duration-200 ease-in-out focus-visible:outline focus-visible:outline-offset-2 ${columnClasses}`}
              whileHover={{ scale: 1.01 }}
            >
              {!isActive && (
                <>
                  <Image
                    fill
                    priority={index === 0}
                    src={item.thumbnail}
                    alt={`${item.platform} - ${item.title}`}
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="bg-card/5 pointer-events-none absolute inset-0 z-10 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <PlayIcon className="h-20 w-20 drop-shadow-xl transition-transform duration-200 group-hover:scale-[1.08]" />
                  </span>
                </>
              )}
              {isActive && (
                <iframe
                  src={buildEmbedSrc(item.embedUrl, true)}
                  title={`${item.platform} ${item.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                  loading="lazy"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
