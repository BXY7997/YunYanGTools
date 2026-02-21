import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Brain, Lock, Zap, Award, Lightbulb } from "lucide-react";

export const AboutPage = () => {
  return (
    <>
      <PageHeader 
        title="我们的使命与愿景"
        description="我们致力于利用 AI 技术彻底改变团队可视化逻辑和设计系统的方式，消除从思想到可视化的所有阻碍。"
      />

      <div className="container pb-24 space-y-24">
        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8">
            <ScrollAnimation direction="left">
                <SpotlightCard className="h-full bg-card shadow-lg border-primary/20" spotlightColor="rgba(59, 130, 246, 0.15)">
                    <CardHeader>
                        <Award className="w-12 h-12 text-primary mb-4" />
                        <CardTitle className="text-2xl">我们的使命</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg text-muted-foreground leading-relaxed">
                        提供最直观、AI 驱动的图表工作空间，消除从思想到可视化的所有阻碍。让每一个创意都能被看见，被理解。
                    </CardContent>
                </SpotlightCard>
            </ScrollAnimation>

            <ScrollAnimation direction="right">
                <SpotlightCard className="h-full bg-card shadow-lg border-purple-500/20" spotlightColor="rgba(168, 85, 247, 0.15)">
                    <CardHeader>
                        <Lightbulb className="w-12 h-12 text-purple-500 mb-4" />
                        <CardTitle className="text-2xl">我们的愿景</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg text-muted-foreground leading-relaxed">
                        构建一个任何人都能一目了然理解复杂系统的世界，由智能设计工具赋能。让复杂的逻辑变得简单，让协作变得无缝。
                    </CardContent>
                </SpotlightCard>
            </ScrollAnimation>
        </section>

        {/* Philosophy */}
        <section className="space-y-12 text-center">
            <ScrollAnimation direction="up">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 inline-block">产品哲学</h2>
            </ScrollAnimation>
            <div className="grid md:grid-cols-3 gap-8 text-left">
                {[
                    { icon: Lock, title: "本地优先的隐私", desc: "您的数据属于您。我们优先考虑本地存储和端到端加密，确保核心资产绝对安全。", color: "text-green-500" },
                    { icon: Brain, title: "AI 作为伙伴", desc: "AI 不应仅仅是绘图，它应理解您的意图和逻辑，成为您思考过程中的智能副驾驶。", color: "text-blue-500" },
                    { icon: Zap, title: "卓越设计", desc: "工具应与其帮助创造的产品一样美观。我们追求极致的交互体验和视觉美感。", color: "text-orange-500" },
                ].map((item, i) => (
                    <ScrollAnimation key={item.title} direction="up" delay={i * 0.1}>
                        <div className="p-6 rounded-2xl bg-muted/30 border hover:border-primary/50 transition-colors h-full">
                            <item.icon className={`w-10 h-10 mb-4 ${item.color}`} />
                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    </ScrollAnimation>
                ))}
            </div>
        </section>

        {/* Roadmap */}
        <section className="max-w-4xl mx-auto space-y-12">
            <ScrollAnimation direction="up">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">未来路线图</h2>
                    <p className="text-muted-foreground mt-4">我们将持续迭代，为您带来更强大的功能。</p>
                 </div>
            </ScrollAnimation>
            
            <div className="relative border-l-2 border-muted pl-8 space-y-12 ml-4 md:ml-0">
                {[
                    { date: "2024 Q3", title: "高级云架构 AI 代理", desc: "能够自动识别并优化 AWS/Azure/GCP 架构图。", status: "completed" },
                    { date: "2024 Q4", title: "实时协作工作空间测试版", desc: "多人同屏编辑，实时光标追踪与评论系统。", status: "current" },
                    { date: "2025 Q1", title: "集成 IDE（VS Code / IntelliJ）", desc: "在代码编辑器中直接查看和编辑架构图，代码即图表。", status: "upcoming" },
                    { date: "2025 Q2", title: "企业级安全与 SSO", desc: "SAML/OIDC 支持，细粒度权限控制与审计日志。", status: "upcoming" },
                ].map((item, i) => (
                    <ScrollAnimation key={item.title} direction="left" delay={i * 0.1} className="relative">
                        <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-background ${item.status === 'completed' ? 'bg-primary' : item.status === 'current' ? 'bg-blue-500 animate-pulse' : 'bg-muted-foreground'}`} />
                        <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-sm font-bold text-primary mb-1 block">{item.date}</span>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-muted-foreground">{item.desc}</p>
                        </div>
                    </ScrollAnimation>
                ))}
            </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
