"use client";

import React, { useState, useMemo } from "react";

import Image from "next/image";
import Link from "next/link";

import { Search, Filter, Download, Star, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = ["全部", "毕业设计", "课程作业", "企业级", "UI组件"];

const baseTemplates = [
  { id: "1", name: "Education Pro", desc: "全功能教务管理系统，包含排课算法与成绩分析。", preview: "/hero.webp", tags: ["SpringBoot", "Vue3"], price: "¥29", category: "毕业设计", stats: { dl: "8.2k", star: "4.9" } },
  { id: "2", name: "Course Master", desc: "高并发选课平台，支持秒杀与队列削峰。", preview: "/hero.webp", tags: ["Java", "Redis"], price: "¥19", category: "课程作业", stats: { dl: "4.5k", star: "4.8" } },
  { id: "3", name: "Library SaaS", desc: "多租户图书馆系统，支持多校区借阅管理。", preview: "/hero.webp", tags: ["Node", "Postgres"], price: "¥49", category: "企业级", stats: { dl: "2.1k", star: "4.7" } },
  { id: "4", name: "Dev Blog", desc: "极客技术博客，支持 MDX 与暗黑模式。", preview: "/hero.webp", tags: ["Next.js", "MDX"], price: "Free", category: "UI组件", stats: { dl: "12k", star: "5.0" } },
  { id: "5", name: "Admin Dashboard", desc: "通用后台管理系统，内置 50+ 常用业务组件。", preview: "/hero.webp", tags: ["React", "AntD"], price: "¥15", category: "企业级", stats: { dl: "3.1k", star: "4.6" } },
  { id: "6", name: "Inventory System", desc: "轻量级库存管理，支持扫码入库与预警。", preview: "/hero.webp", tags: ["Python", "SQLite"], price: "¥9", category: "课程作业", stats: { dl: "1.2k", star: "4.5" } },
];

export default function TemplatePage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return baseTemplates.filter(tpl => {
      const matchesCategory = activeCategory === "全部" || tpl.category === activeCategory;
      const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tpl.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <Background variant="dots">
      <section className="container py-24 lg:py-28 max-w-7xl">
        
        {/* Dashboard-Style Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-primary/5 pb-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                <LayoutGrid className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  精选模板库
                </h1>
                <p className="text-muted-foreground mt-2 text-base font-medium max-w-2xl">
                  探索高质量项目骨架，开箱即用，加速您的工程交付。
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-muted/50 border-none">
              Marketplace v1.2
            </Badge>
          </div>
        </Reveal>

        {/* Toolbar & Filter */}
        <Reveal direction="up" delay={0.2}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-full px-5 h-8 text-[10px] font-bold uppercase tracking-wider transition-all",
                    activeCategory === cat ? "shadow-md shadow-primary/20" : "hover:bg-primary/5 hover:text-primary border-border/40"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="搜索模板..." 
                  className="pl-9 h-9 bg-background/50 border-border/40 rounded-xl text-xs focus-visible:ring-primary/20" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-xl border-2 hover:bg-background">
                <Filter className="size-3.5" />
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Templates Grid with Animation */}
        <div className="min-h-[400px]">
          {filteredTemplates.length > 0 ? (
            <motion.div 
              layout
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((tpl) => (
                  <motion.div
                    key={tpl.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="group relative overflow-hidden bg-background/40 backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 rounded-2xl h-full flex flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted shrink-0">
                        <Image src={tpl.preview} alt={tpl.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <Button size="sm" className="rounded-full font-bold h-8 px-6 shadow-lg" asChild>
                            <Link href={`/template/${tpl.id}`}>查看详情</Link>
                          </Button>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/90 text-black border-none font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter shadow-sm">{tpl.price}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-base group-hover:text-primary transition-colors tracking-tight">{tpl.name}</h3>
                          <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                            <Star className="size-2.5 fill-current" /> {tpl.stats.star}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-xs mb-4 line-clamp-2 font-medium leading-relaxed">{tpl.desc}</p>
                        <div className="flex items-center gap-2 border-t border-border/20 pt-4 mt-auto">
                          {tpl.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded-md">{tag}</span>
                          ))}
                          <div className="ml-auto text-[9px] font-bold text-muted-foreground/60 flex items-center gap-1 uppercase tracking-tighter"><Download className="size-2.5" /> {tpl.stats.dl}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="py-32 text-center"
            >
              <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Search className="size-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-bold mb-4 text-lg">没有找到匹配的模板</p>
              <Button 
                variant="outline" 
                onClick={() => { setSearchQuery(""); setActiveCategory("全部"); }} 
                className="font-bold border-2 rounded-xl"
              >
                清除所有筛选条件
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </Background>
  );
}
