"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight, Github, Boxes, Menu, X } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "首页", href: "/" },
  { label: "生成器", href: "/generators" },
  { label: "模板库", href: "/template" },
  { label: "开发文档", href: "/docs" },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pillRect, setPillRect] = useState({ left: 0, width: 0, opacity: 0 });
  const pathname = usePathname();
  const navItemsRef = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleResize = () => {
      const activeItem = navItemsRef.current.get(pathname);
      if (activeItem) {
        const { offsetLeft, offsetWidth } = activeItem;
        setPillRect({ left: offsetLeft, width: offsetWidth, opacity: 1 });
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  // 精准计算当前活跃项的位置
  useEffect(() => {
    const activeItem = navItemsRef.current.get(pathname);
    if (activeItem) {
      const { offsetLeft, offsetWidth } = activeItem;
      setPillRect({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    } else {
      setPillRect(prev => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 md:p-6 pointer-events-none">
      <LayoutGroup id="navbar-pill-stable">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className={cn(
                            "relative w-full max-w-7xl rounded-full border pointer-events-auto transition-colors duration-500",
                            "flex items-center justify-between px-4 py-2.5 md:px-6",
                            scrolled 
                              ? "bg-background/80 backdrop-blur-xl border-border/40 shadow-2xl shadow-black/5 dark:shadow-primary/5" 
                              : "bg-background/40 backdrop-blur-md border-border/20 shadow-none"
                          )}
                        >
                          {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative size-9 rounded-xl bg-primary flex items-center justify-center text-white overflow-hidden shrink-0">
            <Boxes className="size-5 stroke-[2.5] relative z-10 transition-transform duration-500 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-base md:text-lg font-black tracking-tighter text-foreground">
              云衍<span className="text-primary ml-0.5">YUNYAN</span>
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest hidden md:block">
              Next-Gen Workshop
            </span>
          </div>
        </Link>

        {/* Center: Desktop Nav Items - Stable Single Pill logic */}
        <div className="hidden lg:flex items-center bg-muted/20 dark:bg-zinc-900/40 rounded-full border border-border/10 p-1 relative">
          {/* THE STABLE PILL: Only one div moving locally */}
          <motion.div
            className="absolute bg-primary rounded-full shadow-lg shadow-primary/20 z-0"
            initial={false}
            animate={{
              left: pillRect.left,
              width: pillRect.width,
              opacity: pillRect.opacity,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              opacity: { duration: 0.2 }
            }}
            style={{ top: 4, bottom: 4 }}
          />

          {ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                ref={(el) => {
                  if (el) navItemsRef.current.set(item.href, el);
                }}
                className={cn(
                  "relative px-5 py-1.5 text-sm font-bold transition-colors duration-300 rounded-full outline-none z-10",
                  isActive 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-1 border-r border-border/50 pr-2 mr-1">
            <Button variant="ghost" size="icon" className="rounded-full size-9 text-muted-foreground hover:text-foreground" asChild>
              <Link href="https://github.com/yunyan-tech" target="_blank">
                <Github className="size-[1.1rem]" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="max-md:hidden">
              <Button variant="ghost" size="sm" className="rounded-full px-5 text-sm font-bold text-muted-foreground hover:text-foreground">
                登录
              </Button>
            </Link>
            <Link href="/my-projects">
              <Button size="sm" className="rounded-full px-6 font-black shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 text-xs md:text-sm">
                控制台
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full size-9 bg-muted/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </motion.nav>
      </LayoutGroup>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="absolute top-[calc(100%-0.5rem)] left-4 right-4 bg-background/95 backdrop-blur-2xl border border-border/40 rounded-2xl p-4 shadow-2xl lg:hidden pointer-events-auto"
          >
            <div className="flex flex-col space-y-1">
              {ITEMS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                    pathname === link.href 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                  <ChevronRight className={cn("size-4 opacity-50", pathname === link.href && "opacity-100")} />
                </Link>
              ))}
              <div className="h-px bg-border/50 my-3" />
              <div className="grid grid-cols-2 gap-3 pt-1">
                 <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl font-bold h-11 border-2">登录</Button>
                </Link>
                <Link href="/my-projects" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-xl font-bold h-11 shadow-lg shadow-primary/20">控制台</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
