"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface ProductDetailTocItem {
  id: string
  label: string
}

interface ProductDetailTocProps {
  items: readonly ProductDetailTocItem[]
}

export function ProductDetailToc({ items }: ProductDetailTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")
  const tocRef = useRef<HTMLElement | null>(null)

  const getScrollOffset = () => {
    const headerElement = document.querySelector("header")
    const headerHeight =
      headerElement instanceof HTMLElement ? headerElement.offsetHeight : 0
    const tocHeight = tocRef.current?.offsetHeight ?? 0
    return headerHeight + tocHeight + 12
  }

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((item): item is HTMLElement => Boolean(item))

    if (sections.length === 0) {
      return
    }

    let scrollOffset = 0
    let frameId = 0

    const refreshOffset = () => {
      scrollOffset = getScrollOffset()
    }

    const syncActiveSection = () => {
      const offsetTop = scrollOffset + 4
      let nextId = sections[0].id

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offsetTop) {
          nextId = section.id
        } else {
          break
        }
      }
      setActiveId((current) => (current === nextId ? current : nextId))
    }

    const onScroll = () => {
      if (frameId !== 0) {
        return
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        syncActiveSection()
      })
    }

    const onResize = () => {
      refreshOffset()
      onScroll()
    }

    refreshOffset()
    syncActiveSection()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)
    const lateSyncId = window.requestAnimationFrame(onScroll)

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
      window.cancelAnimationFrame(lateSyncId)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
    }
  }, [items])

  return (
    <section
      ref={tocRef}
      data-product-detail-toc="true"
      className="sticky top-[calc(var(--header-height)+0.5rem)] z-20 container mb-8 h-[var(--product-toc-height)] md:mb-10"
    >
      <div className="bg-background/90 border-border flex h-full items-center rounded-xl border px-3 py-2 shadow-sm backdrop-blur-sm">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveId(item.id)}
              aria-label={`跳转到${item.label}`}
              className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-muted inline-flex shrink-0 rounded-md px-3 py-1.5 text-xs transition-colors",
                activeId === item.id && "bg-primary/10 text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
