"use client"

import Link from "next/link"
import {
  forwardRef,
  type AnchorHTMLAttributes,
} from "react"

import { toCanvasHref } from "@canvas/lib/routes"

interface CanvasLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

export const CanvasLink = forwardRef<HTMLAnchorElement, CanvasLinkProps>(
  ({ href, ...props }, ref) => {
    const resolvedHref = toCanvasHref(href)
    const isExternal =
      resolvedHref.startsWith("http://") ||
      resolvedHref.startsWith("https://") ||
      resolvedHref.startsWith("mailto:") ||
      resolvedHref.startsWith("tel:") ||
      resolvedHref.startsWith("#")

    if (isExternal) {
      return <a ref={ref} href={resolvedHref} {...props} />
    }

    return <Link ref={ref} href={resolvedHref} {...props} />
  }
)

CanvasLink.displayName = "CanvasLink"
