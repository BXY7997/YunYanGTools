"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight, Github, Boxes } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "首页", href: "/" },
  { label: "生成器", href: "/generators" },
  { label: "模板", href: "/template" },
  { label: "文档", href: "/docs" },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <section
      className={cn(
        "fixed left-1/2 z-50 w-[min(92%,1200px)] -translate-x-1/2 top-6",
        "transition-all duration-300"
      )}
    >
      <div className="relative rounded-full border border-border/40 bg-background/70 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-primary/5 pl-6 pr-3 py-2 flex items-center justify-between">
        {/* Logo Area */}
        <Link href="/" className="flex shrink-0 items-center gap-3 group">
          <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
            <Boxes className="size-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground selection:bg-primary/30">
            云衍<span className="text-primary/60 ml-1 font-medium">Yunyan</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="max-lg:hidden absolute left-1/2 -translate-x-1/2">
          <NavigationMenuList className="gap-1">
            {ITEMS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NavigationMenuItem key={link.label}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive ? "bg-accent/50 text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Panel: Tools & Auth */}
        <div className="flex items-center gap-2">
          {/* Tools Group */}
          <div className="hidden sm:flex items-center gap-1 pr-2 border-r border-border/50 mr-2">
            <Button variant="ghost" size="icon" className="rounded-full size-9 text-muted-foreground hover:text-foreground" asChild>
              <Link href="https://github.com/yunyan-tech" target="_blank">
                <Github className="size-[1.1rem]" />
              </Link>
            </Button>
            <div className="flex items-center justify-center size-9">
              <ThemeToggle />
            </div>
          </div>

          {/* Auth Group */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="max-lg:hidden">
              <Button variant="ghost" size="sm" className="rounded-full px-5 text-muted-foreground hover:text-foreground font-medium">
                登录
              </Button>
            </Link>
            <Link href="/my-projects">
              <Button size="sm" className="rounded-full px-5 font-bold shadow-md shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                控制台
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="ml-2 text-muted-foreground relative flex size-8 lg:hidden items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <div className="relative w-5 h-4">
              <span
                className={cn(
                  "absolute block h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out",
                  isMenuOpen ? "top-1.5 rotate-45" : "top-0"
                )}
              />
              <span
                className={cn(
                  "absolute block h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out",
                  isMenuOpen ? "opacity-0" : "top-1.5"
                )}
              />
              <span
                className={cn(
                  "absolute block h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out",
                  isMenuOpen ? "top-1.5 -rotate-45" : "top-3"
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          "absolute inset-x-0 top-[calc(100%+0.5rem)] bg-background/90 backdrop-blur-xl border border-border/40 rounded-3xl p-4 shadow-2xl transition-all duration-300 ease-in-out origin-top lg:hidden",
          isMenuOpen
            ? "opacity-100 scale-100 translate-y-0 visible"
            : "opacity-0 scale-95 -translate-y-4 invisible"
        )}
      >
        <nav className="flex flex-col space-y-1">
          {ITEMS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === link.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
              <ChevronRight className="size-4 opacity-50" />
            </Link>
          ))}
          <div className="h-px bg-border/50 my-2" />
          <div className="flex items-center gap-2 pt-2">
             <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl">登录</Button>
            </Link>
            <Link href="/my-projects" className="flex-1">
              <Button className="w-full rounded-xl">控制台</Button>
            </Link>
          </div>
        </nav>
      </div>
    </section>
  );
};
