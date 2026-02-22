import React from "react";

import { cn } from "@/lib/utils";

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bottom" | "dots"; 
}

export const Background = ({ children, className, variant = "default" }: BackgroundProps) => {
  return (
    <div className={cn("relative w-full bg-background selection:bg-primary/20", className)}>
      {/* Grid/Pattern Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base Grid */}
        {variant !== "dots" && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        )}

        {/* Dots Pattern */}
        {variant === "dots" && (
          <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        )}

        {/* Gradient Overlays */}
        {variant === "default" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#00000000_70%,transparent_100%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,119,198,0.05)_0%,transparent_100%)]" />
        )}
        
        {variant === "bottom" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(120,119,198,0.05)_0%,transparent_100%)]" />
        )}

        {/* Noise/Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 brightness-100" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
