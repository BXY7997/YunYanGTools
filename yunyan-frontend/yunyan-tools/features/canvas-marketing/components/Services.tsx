import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MagnifierIcon, WalletIcon, ChartIcon } from "./Icons";
import { FloatingShapes } from "./FloatingShapes";
import { ScrollAnimation } from "./ui/scroll-animation";
import { SectionHeader } from "@canvas/components/home/SectionHeader";

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
    <section className="container home-section-spacing">
      <div className="grid lg:grid-cols-2 gap-12 items-stretch">
        <ScrollAnimation direction="left" className="flex">
          <div className="flex flex-col justify-center py-4">
            <SectionHeader
              align="left"
              className="mb-8"
              title={(
                <>
                  <span className="home-accent-text">
                    为每位{" "}
                  </span>
                  专业人士打造
                </>
              )}
              subtitle="云衍图表适应您的工作流程，为不同领域提供专业化的可视化工具。"
              subtitleClassName="max-w-xl home-body-copy"
            />

            <div className="flex flex-col gap-4">
              {serviceList.map(({ icon, title, description }: ServiceProps) => (
                <Card
                  key={title}
                  className="home-card-surface home-card-surface-hover"
                >
                  <CardHeader className="flex items-center gap-4 space-y-0 px-6 py-5 md:flex-row md:justify-start">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                      {icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <CardDescription className="mt-1 text-sm leading-6">
                        {description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation
          direction="right"
          className="home-panel-soft w-full overflow-hidden rounded-3xl flex items-center justify-center"
        >
            <FloatingShapes />
        </ScrollAnimation>
      </div>
    </section>
  );
};
