import Link from "next/link";

import { FileQuestion, ArrowRight } from "lucide-react";

import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Background className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl"></div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-background/50 border border-border backdrop-blur-xl shadow-2xl">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      
      <h1 className="mb-4 text-4xl font-black tracking-tight lg:text-5xl">
        404 - 页面未找到
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground text-lg">
        您似乎来到了云衍知识库的荒原。
        <br />
        这个页面可能已经被移动、删除，或者从未存在过。
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/">
            返回首页
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8 gap-2">
          <Link href="/generators">
            前往生成器
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Background>
  );
}
