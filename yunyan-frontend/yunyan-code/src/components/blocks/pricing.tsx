"use client";

import { useState } from "react";

import { Check, GraduationCap } from "lucide-react";

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

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 lg:py-24 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-xs font-bold tracking-widest">
            SIMPLE PRICING
          </Badge>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl mb-6 text-foreground">
            为价值付费，<span className="text-primary">不为溢价买单</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            无论是学生毕设还是企业开发，我们都提供了极具性价比的方案。
            <br className="hidden md:block" />
            认证学生身份可享 <span className="text-foreground font-bold underline decoration-primary decoration-2 underline-offset-4">5 折优惠</span>。
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-bold ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>月付</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-bold ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              年付 <span className="text-xs text-green-500 font-black ml-1">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={cn(
                "relative flex flex-col border-none transition-all duration-300",
                plan.popular 
                  ? "bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/10 border-2 border-primary/20 z-10 scale-105" 
                  : "bg-background/40 backdrop-blur-md hover:bg-background/60 shadow-lg border border-white/10"
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
                      : "bg-white text-foreground border-2 border-primary/5 hover:bg-primary/5 hover:border-primary/10"
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
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-primary/5">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
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
