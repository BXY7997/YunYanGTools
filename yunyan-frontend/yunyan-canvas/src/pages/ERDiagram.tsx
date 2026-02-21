import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Database, Network, Share2, Code2, ArrowRight, Zap } from "lucide-react";

export const ERDiagramPage = () => {
  return (
    <article className="min-h-screen bg-background pb-24 space-y-24">
      <PageHeader 
        title="在线 ER 图工具" 
        description="借助 AI 的便捷与精准，为您的数据库设计专业的实体关系图（ER 图）。从 SQL 到可视化，仅需几秒钟。"
      >
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                立即免费创建 ER 图 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg backdrop-blur-sm bg-background/50 hover:bg-accent/50">
                查看示例图库
            </Button>
         </div>
      </PageHeader>

      <div className="container max-w-[1000px] space-y-24">
        {/* Why ER Diagram */}
        <section className="space-y-12">
            <ScrollAnimation direction="up">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold">为什么 ER 图至关重要</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                        实体关系图（ER 图）不仅仅是文档，它是您数据架构的蓝图。在编写任何代码之前，先理清业务逻辑。
                    </p>
                </div>
            </ScrollAnimation>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
                <ScrollAnimation direction="left">
                    <div className="p-8 bg-muted/30 border rounded-2xl h-full hover:border-primary/30 transition-colors">
                        <Database className="w-12 h-12 text-blue-500 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">清晰的数据库设计</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            在编写任何 SQL 之前，确保您的数据架构高效、可扩展且符合范式规则。发现潜在的冗余和关系冲突。
                        </p>
                    </div>
                </ScrollAnimation>
                
                <ScrollAnimation direction="right">
                    <div className="p-8 bg-muted/30 border rounded-2xl h-full hover:border-primary/30 transition-colors">
                        <Share2 className="w-12 h-12 text-purple-500 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">跨团队沟通桥梁</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            通过直观的可视化图表，向非技术利益相关者和开发人员清晰解释复杂的数据结构，减少沟通误解。
                        </p>
                    </div>
                </ScrollAnimation>
            </div>
        </section>

        {/* What is ER Diagram */}
        <ScrollAnimation direction="up">
            <section className="bg-gradient-to-br from-muted/50 via-muted/30 to-background p-8 md:p-12 rounded-3xl border space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <h2 className="text-3xl md:text-4xl font-bold text-center">什么是 ER 图？</h2>
                <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
                    核心而言，ER 图由三个主要部分组成，我们让每一个都变得简单易懂：
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 pt-8 relative z-10">
                    {[
                        { num: "01", title: "实体 (Entities)", desc: "代表对象或概念，如“客户”、“订单”。在我们的工具中，它们自动映射为表结构。", icon: Database },
                        { num: "02", title: "属性 (Attributes)", desc: "实体的特征，如“客户ID”、“邮箱”。支持所有标准 SQL 数据类型。", icon: Code2 },
                        { num: "03", title: "关系 (Relationships)", desc: "实体如何互动，如“客户下订单”。自动识别 1:1, 1:N, N:M 关系。", icon: Network },
                    ].map((item) => (
                        <div key={item.num} className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-4xl font-bold text-primary/20">{item.num}</span>
                                <item.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="text-xl font-bold">{item.title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </ScrollAnimation>

        {/* How to Draw */}
        <section className="space-y-12">
             <ScrollAnimation direction="up">
                <h2 className="text-3xl md:text-4xl font-bold text-center">如何在线绘制 ER 图</h2>
             </ScrollAnimation>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { step: 1, title: "输入提示词", desc: "自然语言描述您的需求，或粘贴 SQL。", icon: Zap },
                    { step: 2, title: "AI 生成结构", desc: "瞬间获得完整的实体与关系图。", icon: BrainIcon },
                    { step: 3, title: "拖拽精修", desc: "直观的画布操作，调整布局与样式。", icon: MousePointerClick },
                    { step: 4, title: "导出分享", desc: "生成高清 SVG/PDF 或嵌入代码。", icon: DownloadCloud },
                ].map((item, i) => (
                    <ScrollAnimation key={item.step} direction="up" delay={i * 0.1}>
                        <div className="relative p-6 border rounded-xl bg-card hover:shadow-lg transition-all hover:-translate-y-1 group">
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                {item.step}
                            </div>
                            <item.icon className="w-8 h-8 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                            <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                            <p className="text-muted-foreground text-sm">{item.desc}</p>
                        </div>
                    </ScrollAnimation>
                ))}
             </div>
        </section>

        {/* FAQ */}
        <section className="space-y-8 max-w-3xl mx-auto">
            <ScrollAnimation direction="up">
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">ER 图常见问题</h2>
            </ScrollAnimation>
            <Accordion type="single" collapsible className="w-full bg-card rounded-2xl border px-6 py-2">
                {[
                    { q: "逻辑 ER 图和物理 ER 图有什么区别？", a: "逻辑 ER 图专注于业务需求和实体间的关系，不考虑底层数据库技术。物理 ER 图则描述数据库的实际实现，包括表名、列数据类型以及主键、外键等具体约束。" },
                    { q: "这个 ER 图工具是免费的吗？", a: "是的，我们的平台提供全面的免费层级，用于创建和导出 ER 图。高级 AI 代理和团队协作等专业功能在我们的付费计划中提供。" },
                    { q: "我可以从 SQL 脚本生成 ER 图吗？", a: "当然可以。只需将您的 SQL DDL 脚本粘贴到编辑器中，我们的工具就会自动将您的数据库结构可视化为 ER 图，并支持反向导出 SQL。" },
                ].map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-b-0 mb-4 last:mb-0">
                        <AccordionTrigger className="text-lg font-medium hover:text-primary py-4 text-left">{item.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-4">
                            {item.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>

        {/* CTA */}
        <ScrollAnimation direction="up">
            <section className="bg-primary text-primary-foreground p-10 md:p-12 rounded-[2rem] text-center space-y-6 shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight relative z-10">准备好规划您的数据库了吗？</h2>
                <p className="text-lg opacity-90 max-w-[600px] mx-auto leading-relaxed relative z-10">
                    加入成千上万名开发人员和数据库架构师的行列，体验精准与 AI 赋能的极速设计。
                </p>
                <Button size="lg" variant="secondary" className="h-11 px-8 text-base font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all relative z-10 text-primary">
                    立即体验 AI 绘图
                </Button>
            </section>
        </ScrollAnimation>
      </div>
    </article>
  );
};

// Simple icon components for this file to avoid clutter
const BrainIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const MousePointerClick = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/></svg>;
const DownloadCloud = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>;

export default ERDiagramPage;
