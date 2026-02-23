import Link from "next/link";

import { Box, PlusCircle } from "lucide-react";

import { PageIntro } from "@/components/system/page-intro";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <PageIntro
      icon={Box}
      title="我的工作台"
      description="管理您的代码资产。所有项目均已加密存储。"
      badge="Workspace"
      actions={(
        <Button
          asChild
          size="lg"
          className="h-11 rounded-xl px-6 font-bold shadow-lg shadow-primary/20"
        >
          <Link href="/generators">
            <PlusCircle className="mr-2 size-4" />
            新建项目
          </Link>
        </Button>
      )}
      className="mb-10"
    />
  );
}
