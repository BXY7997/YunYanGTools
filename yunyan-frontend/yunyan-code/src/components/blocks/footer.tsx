import Link from "next/link";

import { Github, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const links = {
  product: [
    { name: "生成器", href: "/generators" },
    { name: "模板市场", href: "/template" },
    { name: "更新日志", href: "/changelog" },
  ],
  support: [
    { name: "使用文档", href: "/docs" },
    { name: "常见问题", href: "/faq" },
    { name: "联系我们", href: "/contact" },
  ],
  legal: [
    { name: "隐私政策", href: "/privacy" },
    { name: "服务条款", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-foreground">
                云衍 <span className="text-primary">YUNYAN</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              面向开发者的现代代码生成平台。统一构建、统一交付、统一协作。
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-full bg-background/50"
                asChild
              >
                <Link href="https://github.com/yunyan-tech" target="_blank">
                  <Github className="size-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
            </div>
          </div>

          <FooterCol title="产品" items={links.product} />
          <FooterCol title="支持" items={links.support} />
          <FooterCol title="法律" items={links.legal} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© 2026 Yunyan Inc. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5 text-primary" />
            Crafted for developers
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterColProps {
  title: string;
  items: { name: string; href: string }[];
}

function FooterCol({ title, items }: FooterColProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

