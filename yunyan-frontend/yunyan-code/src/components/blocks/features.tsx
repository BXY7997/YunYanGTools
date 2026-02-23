"use client";

import React from "react";

import Link from "next/link";

import { ShieldCheck, Zap, Laptop, Database, Github, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { PageIntro } from "@/components/system/page-intro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const bentoItems = [
  {
    title: "工业级源码规范",
    desc: "生成的每一行代码都符合大厂内部开发手册，杜绝‘学生气’，直接对齐企业标准。",
    icon: ShieldCheck,
    color: "bg-blue-500",
    size: "md:col-span-2",
    delay: 0,
  },
  {
    title: "极速秒级构建",
    desc: "复杂系统 10 秒内完成构建。",
    icon: Zap,
    color: "bg-amber-500",
    size: "md:col-span-1",
    delay: 0.1,
  },
  {
    title: "多端适配支持",
    desc: "Web、桌面、移动端同步。",
    icon: Laptop,
    color: "bg-purple-500",
    size: "md:col-span-1",
    delay: 0.2,
  },
  {
    title: "自动建模引擎",
    desc: "只需上传 Excel 或输入表结构，AI 自动完成数据库建模与 CRUD 逻辑注入。",
    icon: Database,
    color: "bg-emerald-500",
    size: "md:col-span-2",
    delay: 0.3,
  }
];

export const Features = () => {
  return (
    <section id="features" className="pb-20 lg:pb-24 overflow-hidden">
      <div className="container max-w-7xl">
        <PageIntro
          icon={Sparkles}
          title="不仅是工具，更是您的开发助手"
          description="云衍将重复开发流程抽象成可配置工作流，持续输出高质量、可运行、可扩展的工程代码。"
          badge="Core Capabilities"
          className="mb-16"
        />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {bentoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.5 }}
                className={`${item.size} group`}
              >
                <Card className="app-surface app-interactive h-full hover:bg-background/80 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden relative group/card">
                  <CardContent className="p-8 h-full flex flex-col justify-between">
                    <div>
                      <div className={`${item.color} size-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500`}>
                        <Icon className="size-6" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </CardContent>
                  
                  {/* Subtle Border Glow on Hover */}
                  <div className="absolute inset-0 border-2 border-primary/0 group-hover/card:border-primary/10 rounded-xl transition-colors duration-500 pointer-events-none" />
                  
                  {/* Background Icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/card:opacity-[0.08] transition-all duration-700 group-hover/card:scale-110 pointer-events-none">
                    <Icon className="size-48" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* GitHub & CTA */}
        <Card className="app-surface-strong bg-zinc-950/95 border-white/10 rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <CardContent className="p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative z-10 gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <Github className="size-6 text-white" />
                <span className="text-white/60 font-mono text-sm tracking-tight">github.com/yunyan-tech</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">
                全面拥抱开源生态
              </h3>
              <p className="text-zinc-400 max-w-md text-base leading-relaxed">
                云衍生成的项目不依赖任何闭源组件。您可以完全拥有源码，并在任何地方部署运行。
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Button asChild size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-zinc-200 font-bold transition-all active:scale-95 shadow-lg shadow-white/10 group/btn">
                <Link href="/generators" className="flex items-center">
                  立即开始生成
                  <ArrowRight className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" className="h-12 px-8 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/40 font-bold transition-all active:scale-95">
                <Link href="/template">
                  查看项目模板
                </Link>
              </Button>
            </div>
          </CardContent>
          
          <div className="absolute inset-0 pointer-events-none opacity-10 [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_2px,rgba(255,255,255,0.12)_2px,rgba(255,255,255,0.12)_3px)] mix-blend-overlay" />
        </Card>
      </div>
    </section>
  );
};
