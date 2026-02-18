"use client";

import React from "react";

import Link from "next/link";

import { ShieldCheck, Zap, Laptop, Database, Github } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const bentoItems = [
  {
    title: "工业级源码规范",
    desc: "生成的每一行代码都符合大厂内部开发手册，杜绝‘学生气’，直接对齐企业标准。",
    icon: ShieldCheck,
    color: "bg-blue-500",
    size: "md:col-span-2",
  },
  {
    title: "极速秒级构建",
    desc: "基于云端分布式生成引擎，复杂的管理系统也能在 10 秒内完成构建。",
    icon: Zap,
    color: "bg-amber-500",
    size: "md:col-span-1",
  },
  {
    title: "多端适配支持",
    desc: "支持 Web、桌面 GUI、H5 移动端等多端源码同步生成。",
    icon: Laptop,
    color: "bg-purple-500",
    size: "md:col-span-1",
  },
  {
    title: "自动建模引擎",
    desc: "只需上传 Excel 或输入表结构，AI 自动完成数据库建模与 CRUD 逻辑注入。",
    icon: Database,
    color: "bg-emerald-500",
    size: "md:col-span-2",
  }
];

export const Features = () => {
  return (
    <section id="features" className="pb-28 lg:pb-32 overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <Badge className="mb-4 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold border-none">CORE CAPABILITIES</Badge>
          <h2 className="text-4xl font-bold tracking-tight md:text-6xl mb-6">
            不仅是工具，<br />更是您的开发助手
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            云衍将枯燥的重复开发转化为简单的配置勾选。我们专注于生成高质量、可运行、易扩展的代码，让您将时间花在更有价值的事情上。
          </p>
        </div>

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
                transition={{ delay: i * 0.1 }}
                className={`${item.size} group`}
              >
                <Card className="h-full border-none bg-background/40 backdrop-blur-xl hover:bg-background transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden relative border-t border-l border-white/20">
                  <CardContent className="p-8">
                    <div className={`${item.color} size-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                  </CardContent>
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon className="size-32" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* GitHub & CTA */}
        <Card className="bg-zinc-950 border-none rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <CardContent className="p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative z-10 gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <Github className="size-6 text-white" />
                <span className="text-white/60 font-mono text-sm">github.com/yunyan-tech</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                全面拥抱开源生态
              </h3>
              <p className="text-zinc-400 max-w-md text-base leading-relaxed">
                云衍生成的项目不依赖任何闭源组件。您可以完全拥有源码，并在任何地方部署运行。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button asChild size="lg" className="h-11 px-8 rounded-full bg-white text-black hover:bg-zinc-200 font-bold transition-all active:scale-95 shadow-lg shadow-white/5">
                <Link href="/generators">
                  立即开始生成
                </Link>
              </Button>
              <Button asChild size="lg" className="h-11 px-8 rounded-full border-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 font-bold transition-all active:scale-95">
                <Link href="/template">
                  查看项目模板
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
