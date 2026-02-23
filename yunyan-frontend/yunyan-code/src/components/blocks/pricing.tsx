"use client";

import { useState } from "react";

import { Check, GraduationCap, WalletCards } from "lucide-react";

import { PageIntro } from "@/components/system/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "社区版",
    desc: "适合个人学习与简单毕设",
    price: "¥0",
    features: [
      "每月 5 次生成额度",
      "标准 SpringBoot/Vue 模板",
      "基础 CRUD 代码生成",
      "社区技术支持",
    ],
    cta: "免费开始",
    popular: false,
  },
  {
    id: "pro",
    name: "专业版",
    desc: "解除所有限制，解锁生产力",
    price: "¥29",
    period: "/月",
    originalPrice: "¥59",
    features: [
      "无限次生成额度",
      "解锁微服务/企业级架构",
      "AI 业务逻辑智能注入",
      "1对1 架构师指导",
      "优先体验新功能",
      "去除所有版权标识",
    ],
    cta: "立即升级",
    popular: true,
  },
  {
    id: "team",
    name: "团队版",
    desc: "适合工作室与企业小队",
    price: "¥199",
    period: "/年",
    features: [
      "包含 5 个专业版席位",
      "团队共享模板库",
      "私有化部署支持",
      "专属发票与合同",
    ],
    cta: "联系销售",
    popular: false,
  },
];

interface PricingProps {
  className?: string;
}

export const Pricing = ({ className }: PricingProps) => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className={cn("relative overflow-hidden py-16 lg:py-24", className)}
    >
      <div className="container relative z-10 max-w-6xl">
        <PageIntro
          icon={WalletCards}
          title="为价值付费，不为溢价买单"
          description="覆盖个人、专业与团队场景的定价方案。认证学生身份可享专业版 5 折优惠。"
          badge="Simple Pricing"
          className="mb-12"
          actions={(
            <div className="app-surface inline-flex items-center gap-3 rounded-full px-4 py-2">
              <span
                className={cn(
                  "text-xs font-bold",
                  !isAnnual ? "text-foreground" : "text-muted-foreground",
                )}
              >
                月付
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span
                className={cn(
                  "text-xs font-bold",
                  isAnnual ? "text-foreground" : "text-muted-foreground",
                )}
              >
                年付
                <span className="ml-1 text-[10px] font-black text-emerald-500">
                  -20%
                </span>
              </span>
            </div>
          )}
        />

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={cn(
                "relative flex flex-col app-interactive",
                plan.popular 
                  ? "app-surface-strong z-10 border-2 border-primary/25 shadow-2xl shadow-primary/15 md:-translate-y-1" 
                  : "app-surface hover:border-primary/20 hover:shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 -mt-3 flex justify-center">
                  <Badge className="bg-primary text-white border-none px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="p-8 pb-0">
                <h3 className="text-lg font-black text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground font-medium mb-6">{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm font-bold text-muted-foreground">{plan.period}</span>}
                  {plan.originalPrice && (
                    <span className="ml-2 text-sm text-muted-foreground/60 line-through decoration-2 decoration-muted-foreground/40 font-bold">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-8 flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-medium text-foreground/80">
                      <div className={cn(
                        "mt-0.5 p-0.5 rounded-full", 
                        plan.popular ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Check className="size-2.5 stroke-[4]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-8 pt-0">
                <Button 
                  className={cn(
                    "w-full h-11 rounded-xl text-sm font-bold shadow-md transition-all",
                    plan.popular 
                      ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20" 
                      : "bg-background text-foreground border-2 border-primary/10 hover:bg-primary/5 hover:border-primary/20"
                  )}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Student Discount Banner */}
        <div className="mt-16 mx-auto max-w-3xl">
          <div className="app-surface rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-primary/10">
            <div className="flex items-center gap-4">
              <div className="app-surface rounded-xl p-3 shadow-sm">
                <GraduationCap className="size-6 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">在校学生？</h4>
                <p className="text-xs text-muted-foreground font-medium mt-1">使用 .edu 邮箱注册，自动获得专业版 5 折优惠券。</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-6 font-bold border-2 border-primary/10 hover:bg-primary/5 text-primary">
              验证身份
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
