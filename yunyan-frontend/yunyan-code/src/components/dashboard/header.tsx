import Link from "next/link";

import { Box, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-primary/5 pb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Box className="size-5 text-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Workspace</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl text-foreground">
          我的工作台
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          管理您的代码资产。所有项目均已加密存储。
        </p>
      </div>
      <Button asChild size="lg" className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">
        <Link href="/generators">
          <PlusCircle className="mr-2 size-4" />
          新建项目
        </Link>
      </Button>
    </div>
  );
}
