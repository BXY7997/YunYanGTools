import Image from "next/image";
import Link from "next/link";

import { Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const items = [
  {
    quote: "作为一名大四学生，这个生成器帮我省去了毕设中最枯燥的 CRUD 部分，让我有更多精力研究核心算法。",
    author: "张伟",
    role: "计算机科学 · 大四",
    image: "/testimonials/amy-chase.webp",
  },
  {
    quote: "启星代码生成器的架构非常规范，生成的代码质量很高，完全符合我们的企业开发标准。",
    author: "李明",
    role: "后端架构师 · 云衍科技",
    image: "/testimonials/jonas-kotara.webp",
  },
  {
    quote: "界面简洁明了，配置非常方便。即使是初学者也能在几分钟内生成一个完整的管理系统。",
    author: "王芳",
    role: "前端工程师 · 某大厂",
    image: "/testimonials/kevin-yam.webp",
  },
  {
    quote: "用了这个工具后，我的项目原型开发效率提升了至少 3 倍，真心推荐给各位个人开发者。",
    author: "赵刚",
    role: "独立开发者",
    image: "/testimonials/kundo-marta.webp",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 lg:py-24 overflow-hidden">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black tracking-tight md:text-5xl mb-4">
              深受开发者喜爱
            </h2>
            <p className="text-muted-foreground text-lg">
              加入 5,000+ 使用云衍加速开发的同学和工程师行列。
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full px-6 font-bold border-2" asChild>
              <Link href="/about">
                了解我们的故事
              </Link>
            </Button>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {items.map((item, index) => (
              <CarouselItem
                key={index}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full border-none bg-background/40 backdrop-blur-md hover:bg-background/60 transition-colors shadow-sm hover:shadow-md">
                  <CardContent className="p-8 flex flex-col h-full">
                    <Quote className="size-8 text-primary/20 mb-6 fill-current" />
                    <blockquote className="text-lg font-medium text-foreground leading-relaxed flex-1 mb-8">
                      "{item.quote}"
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="relative size-10 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={item.image}
                          alt={item.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{item.author}</div>
                        <div className="text-xs font-medium text-muted-foreground">{item.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-8">
            <CarouselPrevious className="static translate-y-0 h-10 w-10 border-2" />
            <CarouselNext className="static translate-y-0 h-10 w-10 border-2" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
