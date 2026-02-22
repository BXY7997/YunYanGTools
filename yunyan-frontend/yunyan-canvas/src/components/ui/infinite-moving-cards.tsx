import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    icon: JSX.Element;
    name: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const hasDuplicatedRef = React.useRef(false);

  const [start, setStart] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(media.matches);
    syncPreference();

    if (media.addEventListener) {
      media.addEventListener("change", syncPreference);
      return () => media.removeEventListener("change", syncPreference);
    }
    media.addListener(syncPreference);
    return () => media.removeListener(syncPreference);
  }, []);

  useEffect(() => {
    getDirection();
    getSpeed();
  }, [direction, speed]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setStart(false);
      return;
    }

    addAnimation();
  }, [prefersReducedMotion]);

  function addAnimation() {
    if (hasDuplicatedRef.current) return;
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      hasDuplicatedRef.current = true;
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl",
        prefersReducedMotion
          ? "overflow-visible"
          : "overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full gap-4 py-1",
          prefersReducedMotion
            ? "w-full flex-wrap justify-center"
            : "w-max shrink-0 flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            className="home-card-surface home-card-surface-hover relative w-[160px] max-w-full flex-shrink-0 px-4 py-2.5 md:w-[200px]"
            key={item.name + idx}
          >
            <div className="flex items-center gap-3">
              <div className="text-primary/90">{item.icon}</div>
              <span className="text-sm font-semibold text-foreground/90">{item.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
