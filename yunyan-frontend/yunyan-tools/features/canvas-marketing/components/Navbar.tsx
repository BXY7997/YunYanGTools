import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@canvas/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canvas/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@canvas/components/ui/accordion";

import { Button, buttonVariants } from "./ui/button";
import { 
  Menu, 
  Database, 
  Network, 
  Layout, 
  Box, 
  Columns, 
  Server, 
  CircleDot, 
  Timer, 
  ArrowLeftRight, 
  Activity, 
  BarChart3, 
  PieChart, 
  Component, 
  Puzzle, 
  User, 
  Star, 
  Zap, 
  LayoutTemplate 
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { LogoIcon } from "./Icons";
import { CanvasLink } from "./canvas-link";

interface RouteProps {
  href: string;
  label: string;
}

interface FeatureItem {
  title: string;
  href: string;
  description: string;
  icon: JSX.Element;
}

const routeList: RouteProps[] = [
  {
    href: "/template",
    label: "模板中心",
  },
  {
    href: "/editor",
    label: "编辑器",
  },
  {
    href: "/about",
    label: "关于我们",
  },
];

const featureList: FeatureItem[] = [
  { title: "ER图绘制", href: "/er-diagram", description: "专业的数据库建模工具", icon: <Database className="w-4 h-4" /> },
  { title: "流程图制作", href: "/diagram/flowchart", description: "可视化业务流程与逻辑", icon: <Network className="w-4 h-4" /> },
  { title: "功能结构图", href: "/diagram/feature-map", description: "清晰展示产品功能架构", icon: <Layout className="w-4 h-4" /> },
  { title: "类图", href: "/diagram/class-diagram", description: "面向对象建模必备", icon: <Box className="w-4 h-4" /> },
  { title: "泳道图", href: "/diagram/swimlane", description: "跨部门协作流程可视化", icon: <Columns className="w-4 h-4" /> },
  { title: "部署图", href: "/diagram/deployment", description: "系统拓扑与部署架构", icon: <Server className="w-4 h-4" /> },
  { title: "状态图", href: "/diagram/state", description: "描述对象状态迁移过程", icon: <CircleDot className="w-4 h-4" /> },
  { title: "时序图", href: "/diagram/sequence", description: "展示对象间的时间交互", icon: <Timer className="w-4 h-4" /> },
  { title: "数据流图", href: "/diagram/data-flow", description: "分析系统中数据流向", icon: <ArrowLeftRight className="w-4 h-4" /> },
  { title: "活动图", href: "/diagram/activity", description: "详尽的工作流控制逻辑", icon: <Activity className="w-4 h-4" /> },
  { title: "甘特图", href: "/diagram/gantt", description: "项目进度管理与跟踪", icon: <BarChart3 className="w-4 h-4" /> },
  { title: "饼图", href: "/diagram/pie", description: "数据比例可视化分析", icon: <PieChart className="w-4 h-4" /> },
  { title: "对象图", href: "/diagram/object", description: "实时的对象实例关系", icon: <Component className="w-4 h-4" /> },
  { title: "构件图", href: "/diagram/component", description: "软件系统物理构件组织", icon: <Puzzle className="w-4 h-4" /> },
  { title: "用例图", href: "/diagram/use-case", description: "用户与系统功能交互", icon: <User className="w-4 h-4" /> },
  { title: "AI专业风格图", href: "/diagram/ai-pro", description: "AI 赋能的高级感图表", icon: <Star className="w-4 h-4" /> },
  { title: "AI现代风格图", href: "/diagram/ai-modern", description: "简约时尚的 AI 设计", icon: <Zap className="w-4 h-4" /> },
  { title: "模板库", href: "/template", description: "海量专业模板一键使用", icon: <LayoutTemplate className="w-4 h-4" /> },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white/80 backdrop-blur-md dark:border-b-slate-700 dark:bg-background/80">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <CanvasLink
              href="/"
              className="ml-2 font-bold text-xl flex items-center"
            >
              <LogoIcon />
              云衍图表
            </CanvasLink>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            <ModeToggle />

            <Sheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SheetTrigger className="px-2" aria-label="打开菜单">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                />
                <span className="sr-only">菜单</span>
              </SheetTrigger>

              <SheetContent side={"right"} className="overflow-y-auto max-h-screen p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="font-bold text-xl">
                    云衍图表
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4 gap-2">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="features" className="border-b-0">
                      <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">产品功能</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-1 pb-2">
                          {featureList.map((feature) => (
                            <CanvasLink
                              key={feature.title}
                              href={feature.href}
                              onClick={() => setIsOpen(false)}
                              className="text-sm py-3 px-2 pl-6 hover:bg-muted rounded-md flex items-center gap-3 transition-colors min-h-[44px] text-muted-foreground hover:text-foreground"
                            >
                              <span className="opacity-70">{feature.icon}</span>
                              {feature.title}
                            </CanvasLink>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {routeList.map(({ href, label }: RouteProps) => (
                    <CanvasLink
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="py-3 px-2 text-base font-medium hover:bg-muted rounded-md transition-colors min-h-[48px] flex items-center"
                    >
                      {label}
                    </CanvasLink>
                  ))}
                  
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full h-12 text-base">登录</Button>
                    <Button className="w-full h-12 text-base">免费使用</Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          <nav className="hidden md:flex gap-2">
            <NavigationMenuItem className="list-none">
              <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                产品功能
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-3 lg:grid-cols-4">
                  {featureList.map((feature) => (
                    <li key={feature.title}>
                      <NavigationMenuLink asChild>
                        <CanvasLink
                          href={feature.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            {feature.icon}
                            {feature.title}
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {feature.description}
                          </p>
                        </CanvasLink>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {routeList.map((route: RouteProps, i) => (
              <CanvasLink
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </CanvasLink>
            ))}
          </nav>

          <div className="hidden md:flex gap-2">
            <Button variant="outline">登录</Button>
            <Button>免费使用</Button>
            <ModeToggle />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
