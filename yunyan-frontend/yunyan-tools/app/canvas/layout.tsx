import "@/features/canvas-marketing/styles/app.css"
import "@/features/canvas-marketing/styles/theme.css"

import type { ReactNode } from "react"

import { CanvasSiteShell } from "@canvas/components/canvas-site-shell"

interface CanvasLayoutProps {
  children: ReactNode
}

export default function CanvasLayout({ children }: CanvasLayoutProps) {
  return <CanvasSiteShell>{children}</CanvasSiteShell>
}
