import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MagnifierIcon, WalletIcon, ChartIcon } from "./Icons";
import { FloatingShapes } from "./FloatingShapes";
import { ScrollAnimation } from "./ui/scroll-animation";

interface ServiceProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const serviceList: ServiceProps[] = [
  {
    title: "开发与工程",
    description:
      "根据 SQL 或文本自动生成 ER 图。借助 AI 辅助组件放置，设计复杂的系统架构。",
    icon: <ChartIcon />,
  },
  {
    title: "产品管理",
    description:
      "轻松绘制用户旅程和产品路线图。使用 AI 为新功能构思流程图和逻辑路径。",
    icon: <WalletIcon />,
  },
  {
    title: "教育与研究",
    description:
      "使用思维导图可视化复杂理论。非常适合学生和研究人员组织思路和展示发现。",
    icon: <MagnifierIcon />,
  },
];

export const Services = () => {
  return (
    <section className="container py-12 sm:py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-stretch">
        <ScrollAnimation direction="left" className="flex">
          <div className="flex flex-col justify-center py-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                为每位{" "}
              </span>
              专业人士打造
            </h2>

            <p className="text-muted-foreground text-lg mt-4 mb-8">
              云衍图表适应您的工作流程，为不同领域提供专业化的可视化工具。
            </p>

            <div className="flex flex-col gap-4">
              {serviceList.map(({ icon, title, description }: ServiceProps) => (
                <Card key={title} className="bg-muted/20 border-none shadow-none hover:bg-muted/40 transition-colors">
                  <CardHeader className="space-y-1 flex md:flex-row justify-start items-center gap-4 py-4 px-6">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                      {icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <CardDescription className="text-sm">
                        {description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="right" className="w-full flex items-center justify-center bg-muted/10 rounded-3xl border border-muted-foreground/5 overflow-hidden">
            <FloatingShapes />
        </ScrollAnimation>
      </div>
    </section>
  );
};
