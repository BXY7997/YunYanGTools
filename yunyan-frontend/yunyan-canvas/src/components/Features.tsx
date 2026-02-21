import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
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
    description: "只需输入自然语言描述，秒级生成专业的 ER 图、流程图和思维导图。无需手动拖拽，让创意瞬间落地。内置多种行业模板，懂技术更懂业务。",
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
    icon: <Cloud className="w-8 h-8 text-orange-500" />,
    className: "md:col-span-1",
    delay: 0.2,
  },
  {
    title: "企业级安全",
    description: "支持私有化部署，细粒度权限控制，保障核心资产安全。",
    icon: <Lock className="w-8 h-8 text-green-500" />,
    className: "md:col-span-1",
    delay: 0.3,
  },
  {
    title: "高性能渲染引擎",
    description: "Canvas/SVG 双引擎支持，万级节点流畅操作。",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    className: "md:col-span-1",
    delay: 0.4,
  },
   {
    title: "无限画布",
    description: "打破边界，在一个画布上整理所有思路与资产。",
    icon: <LayoutGrid className="w-8 h-8 text-purple-500" />,
    className: "md:col-span-1",
    delay: 0.5,
  },
];

export const Features = () => {
  return (
    <section id="features" className="container py-12 sm:py-16 space-y-6">
      <ScrollAnimation direction="up">
        <div className="text-center space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold">
            释放您的 <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">业务逻辑</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
                不仅是画图工具，更是您的业务梳理专家。融合 AI 智慧与强大工程能力。
            </p>
        </div>
      </ScrollAnimation>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <ScrollAnimation key={feature.title} direction="up" delay={feature.delay} className={feature.className}>
             <SpotlightCard className="bg-card text-card-foreground shadow-sm h-full" spotlightColor="rgba(59, 130, 246, 0.25)">
                <CardHeader>
                    <div className="mb-2 w-fit p-2 rounded-lg bg-muted/50">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                {/* Decorative background element */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 scale-150 pointer-events-none text-foreground">
                    {feature.icon}
                </div>
            </SpotlightCard>
          </ScrollAnimation>
        ))}
      </div>
    </section>
  );
};
