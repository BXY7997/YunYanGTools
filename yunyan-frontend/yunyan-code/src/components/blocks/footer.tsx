import Link from "next/link";

import { Github } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Footer() {
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
    ]
  };

  return (
    <footer className="border-t bg-background/50 backdrop-blur-xl mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold tracking-tight">云衍 Yunyan</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
              专为大学生和开发者打造的高质量代码生成平台。
              <br />
              跳过重复劳动，直达核心创造。
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="rounded-full size-9" asChild>
                <Link href="https://github.com/yunyan-tech" target="_blank">
                  <Github className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">产品</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">支持</h3>
            <ul className="space-y-3">
              {links.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">法律</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Yunyan Inc. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <span>Made with ❤️ for Developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
