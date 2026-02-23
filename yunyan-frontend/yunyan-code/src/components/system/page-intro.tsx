import React from "react";

import { type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageIntro({
  icon: Icon,
  title,
  description,
  badge,
  actions,
  className,
}: PageIntroProps) {
  return (
    <div className={cn("app-section-header", className)}>
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/12 p-2.5 shrink-0">
          <Icon className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {badge && (
          <Badge
            variant="secondary"
            className="border-none bg-muted/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest"
          >
            {badge}
          </Badge>
        )}
        {actions}
      </div>
    </div>
  );
}

