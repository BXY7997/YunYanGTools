"use client";

import React, { useState, useMemo } from "react";

import Image from "next/image";
import Link from "next/link";

import { Search, Filter, Download, Star, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

import { Background } from "@/components/background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const categories = ["全部", "毕业设计", "课程作业", "企业级", "UI组件"];

// 基础数据
const baseTemplates = [
  {
    id: "1",
    name: "Education Pro",
    desc: "全功能教务管理系统，包含排课算法与成绩分析。",
    preview: "/hero.webp",
    tags: ["SpringBoot", "Vue3"],
    price: "¥29",
    category: "毕业设计",
    stats: { dl: "8.2k", star: "4.9" }
  },
  {
    id: "2",
    name: "Course Master",
    desc: "高并发选课平台，支持秒杀与队列削峰。",
    preview: "/hero.webp",
    tags: ["Java", "Redis"],
    price: "¥19",
    category: "课程作业",
    stats: { dl: "4.5k", star: "4.8" }
  },
  {
    id: "3",
    name: "Library SaaS",
    desc: "多租户图书馆系统，支持多校区借阅管理。",
    preview: "/hero.webp",
    tags: ["Node", "Postgres"],
    price: "¥49",
    category: "企业级",
    stats: { dl: "2.1k", star: "4.7" }
  },
  {
    id: "4",
    name: "Dev Blog",
    desc: "极客技术博客，支持 MDX 与暗黑模式。",
    preview: "/hero.webp",
    tags: ["Next.js", "MDX"],
    price: "Free",
    category: "UI组件",
    stats: { dl: "12k", star: "5.0" }
  },
  {
    id: "5",
    name: "Inventory",
    desc: "企业仓储管理，支持扫码枪与库存预警。",
    preview: "/hero.webp",
    tags: ["Go", "Vue"],
    price: "¥39",
    category: "企业级",
    stats: { dl: "1.8k", star: "4.6" }
  },
  {
    id: "6",
    name: "E-Commerce",
    desc: "跨境电商独立站，集成 PayPal 支付。",
    preview: "/hero.webp",
    tags: ["React", "Shopify"],
    price: "¥99",
    category: "企业级",
    stats: { dl: "900+", star: "4.5" }
  }
];

// 生成更多模拟数据以演示分页
const allTemplates = [
  ...baseTemplates,
  ...Array.from({ length: 18 }).map((_, i) => ({
    id: `mock-${i}`,
    name: `通用管理后台 v${i + 1}`,
    desc: "标准 RBAC 权限管理系统，开箱即用。",
    preview: "/hero.webp",
    tags: ["React", "AntD"],
    price: i % 3 === 0 ? "Free" : "¥9.9",
    category: i % 2 === 0 ? "UI组件" : "课程作业",
    stats: { dl: `${100 + i}`, star: "4.2" }
  }))
];

export default function TemplatePage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // 筛选逻辑
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(t => {
      const matchesCategory = activeCategory === "全部" || t.category === activeCategory;
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const currentTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 处理筛选变更时重置页码
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Background>
      <section className="container py-16 lg:py-24">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight mb-4">模板市场</h1>
            <p className="text-muted-foreground text-lg">
              探索由社区和官方维护的高质量项目骨架，开箱即用。
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="搜索模板..." 
                className="pl-10 h-10 bg-background" 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
              <Filter className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => handleCategoryChange(cat)}
              className="rounded-full px-5 h-8 text-xs font-medium"
            >
              {cat}
            </Button>
          ))}
        </div>

        {currentTemplates.length > 0 ? (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {currentTemplates.map((tpl) => (
                <Card key={tpl.id} className="group border-0 bg-transparent shadow-none hover:shadow-none overflow-visible">
                  {/* Image Container */}
                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted mb-4 group-hover:ring-2 ring-primary/20 transition-all shadow-sm group-hover:shadow-md">
                                  <Image 
                                    src={tpl.preview} 
                                    alt={tpl.name} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">                      <Button size="sm" className="rounded-full font-medium h-8 px-4" asChild>
                        <Link href={`/template/${tpl.id}`}>查看详情</Link>
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-black backdrop-blur-md shadow-sm hover:bg-white font-bold px-2 py-0.5">
                        {tpl.price}
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{tpl.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {tpl.stats.star}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-1">{tpl.desc}</p>
                    <div className="flex items-center gap-2">
                      {tpl.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                          {tag}
                        </span>
                      ))}
                      <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="size-3" /> {tpl.stats.dl}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  第 {currentPage} 页 / 共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            <p>没有找到匹配的模板</p>
            <Button variant="link" onClick={() => { setSearchQuery(""); setActiveCategory("全部"); }}>
              清除筛选条件
            </Button>
          </div>
        )}
      </section>
    </Background>
  );
}
