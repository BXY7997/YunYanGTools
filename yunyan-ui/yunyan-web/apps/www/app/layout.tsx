import type { Viewport } from "next"
import { Metadata } from "next"
import { Provider as JotaiProvider } from "jotai"

import { fontVariables } from "@/lib/fonts"
import { absoluteUrl, cn, constructMetadata } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PHProvider } from "@/components/posthog-provider"
import { ThemeProvider } from "@/components/theme-provider"

import "@/styles/globals.css"

export const metadata: Metadata = constructMetadata({
  title: "云衍 YUNYAN",
  description:
    "云衍企业级 AI 智能体与数字员工平台，覆盖知识问答、资讯分析、流程自动化与私有化部署。",
  image: absoluteUrl("/og"),
})

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="layout-fixed">
      <head />
      <body
        className={cn(
          "text-foreground group/body overscroll-none font-sans antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] xl:[--footer-height:calc(var(--spacing)*24)]",
          fontVariables
        )}
      >
        <JotaiProvider>
          <PHProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider>
                {children}
                <Toaster position="top-center" richColors toastOptions={{}} />
              </TooltipProvider>
            </ThemeProvider>
          </PHProvider>
        </JotaiProvider>
      </body>
    </html>
  )
}
