"use client"

import type { ReactNode } from "react"

import { Footer } from "@canvas/components/Footer"
import { Navbar } from "@canvas/components/Navbar"
import { ScrollToTop } from "@canvas/components/ScrollToTop"

interface CanvasSiteShellProps {
  children: ReactNode
}

export function CanvasSiteShell({ children }: CanvasSiteShellProps) {
  return (
    <div className="canvas-marketing min-h-screen bg-background text-foreground">
      <Navbar />
      {children}
      <Footer />
      <ScrollToTop />
    </div>
  )
}
