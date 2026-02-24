import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MedalIcon, MapIcon, PlaneIcon, GiftIcon } from "../components/Icons";
import { SectionHeader } from "@canvas/components/home/SectionHeader";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "易用性",
    description:
      "直观的拖拽操作，无需学习成本，即使是非技术人员也能轻松上手绘图。",
  },
  {
    icon: <MapIcon />,
    title: "社区支持",
    description:
      "加入云衍图表活跃社区，分享您的设计模版，获取全球开发者的灵感支持。",
  },
  {
    icon: <PlaneIcon />,
    title: "可扩展性",
    description:
      "支持从简单的个人草图到复杂的企业级系统架构设计，满足不同阶段需求。",
  },
  {
    icon: <GiftIcon />,
    title: "趣味性",
    description:
      "丰富的预置图标库和配色方案，让专业的图表设计过程也能充满乐趣。",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container home-section-spacing text-center"
    >
      <SectionHeader
        title={(
          <>
            如何使用{" "}
            <span className="home-accent-text">
              分步指南{" "}
            </span>
          </>
        )}
        subtitle="只需几步，即可将您的想法转化为精美的专业图表。"
        subtitleClassName="home-body-copy md:max-w-2xl mb-10"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="home-card-surface home-card-surface-hover"
          >
            <CardHeader>
              <CardTitle className="grid place-items-center gap-4 text-xl">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              {description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
