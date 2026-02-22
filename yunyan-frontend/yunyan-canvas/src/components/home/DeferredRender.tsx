import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DeferredRenderProps {
  children: ReactNode;
  eager?: boolean;
  rootMargin?: string;
  placeholder?: ReactNode;
  placeholderClassName?: string;
}

export const DeferredRender = ({
  children,
  eager = false,
  rootMargin = "260px 0px",
  placeholder,
  placeholderClassName,
}: DeferredRenderProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(eager);

  useEffect(() => {
    if (shouldRender) return;

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={containerRef}>
      {shouldRender ? (
        children
      ) : (
        placeholder ?? (
          <div
            aria-hidden
            className={cn(
              "container home-section-spacing-compact",
              placeholderClassName
            )}
          >
            <div className="home-card-surface h-24 animate-pulse bg-muted/40" />
          </div>
        )
      )}
    </div>
  );
};

export default DeferredRender;
