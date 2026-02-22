import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { SectionHeader } from "@/components/home/SectionHeader";
import { Brain, Cloud, Users, Lock, Zap, LayoutGrid } from "lucide-react";

interface FeatureProps {
  title: string;
  description: string;
  icon: JSX.Element;
  className?: string;
  delay?: number;
}

const features: FeatureProps[] = [
  {
    title: "AI 智能生成",
    description:
      "输入自然语言即可秒级生成 ER 图、流程图和思维导图，快速从想法进入可评审方案。",
    icon: <Brain className="w-10 h-10 text-primary" />,
    className: "md:col-span-2 md:row-span-2",
    delay: 0,
  },
  {
    title: "实时团队协作",
    description: "邀请团队成员实时编辑，多人同屏互动，即时反馈。",
    icon: <Users className="w-8 h-8 text-blue-500" />,
    className: "md:col-span-1",
    delay: 0.1,
  },
  {
    title: "本地优先 + 云端同步",
    description: "数据本地存储保障隐私，云端同步确保多端无缝切换。",
    icon: <Cloud className="w-8 h-8 text-cyan-500" />,
    className: "md:col-span-1",
    delay: 0.2,
  },
  {
    title: "企业级安全",
    description: "支持私有化部署，细粒度权限控制，保障核心资产安全。",
    icon: <Lock className="w-8 h-8 text-sky-600" />,
    className: "md:col-span-1",
    delay: 0.3,
  },
  {
    title: "高性能渲染引擎",
    description: "Canvas/SVG 双引擎支持，万级节点流畅操作。",
    icon: <Zap className="w-8 h-8 text-blue-600" />,
    className: "md:col-span-1",
    delay: 0.4,
  },
  {
    title: "无限画布",
    description: "打破边界，在一个画布上整理所有思路与资产。",
    icon: <LayoutGrid className="w-8 h-8 text-indigo-500" />,
    className: "md:col-span-1",
    delay: 0.5,
  },
];

export const Features = () => {
  return (
    <section id="features" className="container home-section-spacing space-y-12">
      <ScrollAnimation direction="up">
        <SectionHeader
          title={(
            <>
              释放您的{" "}
              <span className="home-accent-text">
                业务逻辑
              </span>
            </>
          )}
          subtitle="不仅是画图工具，更是业务共识平台。融合 AI 理解能力与工程可执行性，让复杂系统被快速看懂。"
          subtitleClassName="home-body-copy"
        />
      </ScrollAnimation>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <ScrollAnimation
            key={feature.title}
            direction="up"
            delay={feature.delay}
            className={feature.className}
          >
            <SpotlightCard
              className="home-card-surface home-card-surface-hover h-full"
              spotlightColor="rgba(59, 130, 246, 0.22)"
            >
              <CardHeader>
                <div className="mb-2 w-fit rounded-xl bg-primary/10 p-2.5">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl leading-snug">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </CardContent>
              <div className="pointer-events-none absolute -bottom-6 -right-6 scale-150 rotate-12 opacity-[0.03] text-foreground">
                {feature.icon}
              </div>
            </SpotlightCard>
          </ScrollAnimation>
        ))}
      </div>
    </section>
  );
};
