import { NavItem } from "@/types"

interface DocsConfig {
  mainNav: NavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "首页",
      href: "/",
    },
    {
      title: "产品",
      href: "/products",
    },
    {
      title: "企业动态",
      href: "/news",
    },
    {
      title: "解决方案",
      href: "/solutions",
    },
    {
      title: "价格",
      href: "/pricing",
    },
    {
      title: "关于我们",
      href: "/about",
    },
    {
      title: "帮助中心",
      href: "/help",
    },
  ],
}
