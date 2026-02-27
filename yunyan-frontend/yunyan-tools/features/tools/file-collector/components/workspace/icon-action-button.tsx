import type * as React from "react"

import { cn } from "@/lib/utils"

interface IconActionButtonProps {
  title: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function IconActionButton({
  title,
  onClick,
  disabled,
  children,
}: IconActionButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors",
        disabled ? "cursor-not-allowed opacity-45" : "hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
