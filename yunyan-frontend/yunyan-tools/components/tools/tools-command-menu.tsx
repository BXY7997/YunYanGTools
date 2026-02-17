"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command as CommandIcon, Search } from "lucide-react"

import { toolSearchGroups } from "@/config/tools-registry"
import { cn } from "@/lib/utils"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"

interface ToolsCommandMenuProps {
  className?: string
}

export function ToolsCommandMenu({ className }: ToolsCommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-md border border-border bg-card px-3 text-left text-sm text-muted-foreground transition-all duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label="打开工具搜索"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate">搜索工具、分组或页面...</span>
        <kbd className="hidden items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-flex">
          <CommandIcon className="h-3 w-3" />K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        contentClassName="border-border bg-popover"
        commandClassName="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]]:border-border [&_[cmdk-input-wrapper]_svg]:text-muted-foreground [&_[cmdk-input]]:text-foreground [&_[cmdk-input]]:placeholder:text-muted-foreground [&_[cmdk-item]]:text-foreground"
      >
        <CommandInput placeholder="输入工具名、分类或路由..." />
        <CommandList className="max-h-[65vh]">
          <CommandEmpty>没有匹配结果</CommandEmpty>
          {toolSearchGroups.map((group, index) => (
            <React.Fragment key={group.id}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.title}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.route} ${item.summary || ""}`}
                    onSelect={() => {
                      router.push(item.route)
                      setOpen(false)
                    }}
                    className="cursor-pointer gap-2 aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <ToolIcon
                      name={item.icon}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <span className="mr-2 truncate">{item.title}</span>
                    <ToolBadgeChip badge={item.badge} />
                    <CommandShortcut>
                      {item.route.replace("/apps/", "")}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
