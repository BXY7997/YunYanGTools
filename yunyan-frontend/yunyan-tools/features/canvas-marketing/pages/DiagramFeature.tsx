import { Button } from "@canvas/components/ui/button";
import { PageHeader } from "@canvas/components/PageHeader";
import { ScrollAnimation } from "@canvas/components/ui/scroll-animation";
import { SpotlightCard } from "@canvas/components/ui/spotlight-card";
import { 
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
  LayoutTemplate,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@canvas/components/ui/card";

const featureConfig: Record<string, { title: string; description: string; icon: any }> = {
  "flowchart": { title: "流程图制作", description: "轻松绘制业务流程、决策路径和逻辑步骤。内置多种符号库，支持 BPMN 标准。", icon: Network },
  "feature-map": { title: "功能结构图", description: "清晰展示产品功能架构与层级关系。适合产品经理梳理需求。", icon: Layout },
  "class-diagram": { title: "类图", description: "面向对象建模的核心工具，展示类与类之间的静态关系。自动生成 Java/C# 代码。", icon: Box },
  "swimlane": { title: "泳道图", description: "跨职能部门的流程可视化，明确职责边界。优化业务流程的利器。", icon: Columns },
  "deployment": { title: "部署图", description: "可视化软件系统的物理部署方案与拓扑结构。DevOps 必备。", icon: Server },
  "state": { title: "状态图", description: "详细描述单个对象在其生命周期内的状态迁移。适合复杂业务逻辑分析。", icon: CircleDot },
  "sequence": { title: "时序图", description: "精确捕捉对象之间的时间交互序列。理清 API 调用链路。", icon: Timer },
  "data-flow": { title: "数据流图", description: "分析系统中数据的流入、处理和流出过程。确保数据合规与安全。", icon: ArrowLeftRight },
  "activity": { title: "活动图", description: "深入展示工作流的控制逻辑与分支路径。比流程图更具技术细节。", icon: Activity },
  "gantt": { title: "甘特图", description: "专业的项目进度管理工具，确保按时交付。支持关键路径分析。", icon: BarChart3 },
  "pie": { title: "饼图", description: "简单直观的数据比例可视化分析工具。适合仪表盘展示。", icon: PieChart },
  "object": { title: "对象图", description: "展示系统在特定时间点的对象实例及其关系。用于调试与快照分析。", icon: Component },
  "component": { title: "构件图", description: "展示软件构件的物理组织形式及依赖关系。模块化设计的蓝图。", icon: Puzzle },
  "use-case": { title: "用例图", description: "定义用户需求与系统功能之间的交互场景。以用户为中心的设计起点。", icon: User },
  "ai-pro": { title: "AI专业风格图", description: "利用 AI 生成具有专业设计师水准的高端图表。一键美化，告别丑陋图表。", icon: Star },
  "ai-modern": { title: "AI现代风格图", description: "极简主义风格，自动美化，让您的表达更具冲击力。适合演示文稿。", icon: Zap },
};

interface DiagramFeaturePageProps {
  type?: string;
}

export const DiagramFeaturePage = ({ type }: DiagramFeaturePageProps) => {
  const config = featureConfig[type || ""] || { title: "专业绘图", description: "强大的在线绘图工具，助力高效可视化。", icon: LayoutTemplate };
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title={config.title}
        description={config.description}
      >
        <div className="flex justify-center mt-8">
            <div className="p-4 bg-background/50 backdrop-blur-md rounded-2xl border shadow-sm">
                <Icon className="w-16 h-16 text-primary" />
            </div>
        </div>
      </PageHeader>
      
      <div className="container max-w-5xl space-y-24">
        {/* Core Benefits */}
        <section className="grid md:grid-cols-3 gap-8">
            {[
                { title: "智能对齐", desc: "自动计算间距，吸附对齐，确保每一个元素都在完美的位置，强迫症福音。", icon: Layout },
                { title: "多格式导出", desc: "支持 SVG, PNG, PDF 矢量无损导出，无论是打印还是嵌入网页，清晰度始终如一。", icon: CheckCircle2 },
                { title: "实时同步", desc: "云端实时保存，多设备无缝切换。在办公室用电脑画，在路上用平板改。", icon: Zap },
            ].map((item, i) => (
                <ScrollAnimation key={item.title} direction="up" delay={i * 0.1}>
                    <SpotlightCard className="h-full bg-card border-muted hover:border-primary/20" spotlightColor="rgba(59, 130, 246, 0.1)">
                        <CardHeader>
                            <item.icon className="w-8 h-8 text-primary mb-2" />
                            <CardTitle className="text-xl">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.desc}</p>
                        </CardContent>
                    </SpotlightCard>
                </ScrollAnimation>
            ))}
        </section>

        {/* Feature Deep Dive (Generic for now, could be specific based on type) */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
             <ScrollAnimation direction="left">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold">不仅仅是 {config.title}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        云衍图表不仅仅提供单一的绘图功能，更是一个集成化的视觉协作平台。
                        您可以将{config.title}与其他图表类型混合使用，在一个无限画布上构建完整的项目视图。
                    </p>
                    <ul className="space-y-4">
                        {[
                            "支持 Markdown 语法的文本编辑",
                            "嵌入外部链接与文档",
                            "版本历史回溯与恢复",
                            "团队成员评论与标注"
                        ].map((feat, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>
             </ScrollAnimation>
             
             <ScrollAnimation direction="right">
                <div className="aspect-square bg-muted rounded-3xl border relative overflow-hidden group">
                     {/* Abstract Visual */}
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                        <Icon className="w-48 h-48 text-primary/20" />
                     </div>
                     <div className="absolute bottom-8 left-8 right-8 bg-background/90 backdrop-blur-md px-6 py-5 rounded-xl border shadow-lg">
                        <p className="font-medium text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            正在编辑: {config.title} v1.0
                        </p>
                        <div className="h-1.5 w-full bg-muted mt-3 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-green-500 rounded-full" />
                        </div>
                     </div>
                </div>
             </ScrollAnimation>
        </section>

        {/* CTA */}
        <ScrollAnimation direction="up">
            <div className="text-center space-y-6 py-8">
                <h2 className="text-3xl md:text-4xl font-bold">开始您的 {config.title} 设计</h2>
                <Button size="lg" className="h-11 px-8 text-base font-semibold rounded-full shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                    立即开始绘制 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default DiagramFeaturePage;
