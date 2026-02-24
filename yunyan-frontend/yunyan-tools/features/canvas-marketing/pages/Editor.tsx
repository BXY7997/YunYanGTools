import { Button } from "@canvas/components/ui/button";
import { Badge } from "@canvas/components/ui/badge";
import { PageHeader } from "@canvas/components/PageHeader";
import { ScrollAnimation } from "@canvas/components/ui/scroll-animation";
import { SpotlightCard } from "@canvas/components/ui/spotlight-card";
import { CardHeader, CardContent, CardTitle } from "@canvas/components/ui/card";
import { Rocket, Lock, Share2, Database, LayoutTemplate, Check } from "lucide-react";

export const EditorPage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="强大的 AI 辅助编辑器" 
        description="满足您所有专业绘图需求的一站式工作空间。无论您是独立开发者还是企业团队，都能找到适合您的工作流。"
      >
        <div className="mt-8 flex justify-center">
            <Button size="lg" className="rounded-full px-12 py-6 text-xl shadow-lg hover:scale-105 transition-transform">
                <Rocket className="mr-2 w-5 h-5" />
                进入工作空间
            </Button>
        </div>
      </PageHeader>

      <div className="container space-y-24">
        {/* Core Capabilities */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { title: "20+ 图表类型", desc: "ER 图、流程图、UML、思维导图等全覆盖，满足不同场景需求。", icon: LayoutTemplate, color: "text-blue-500" },
                { title: "AI 自动补全", desc: "智能预测您的下一步操作，自动建议连接线和布局样式，效率倍增。", icon: Rocket, color: "text-purple-500" },
                { title: "本地极速响应", desc: "基于 WebAssembly 技术，在您的设备上体验零延迟的原生级编辑体验。", icon: ZapIcon, color: "text-yellow-500" },
                { title: "高级格式导出", desc: "支持导出为 SVG、PNG、PDF 或嵌入代码，无损集成到您的文档中。", icon: Share2, color: "text-green-500" },
            ].map((item, i) => (
                <ScrollAnimation key={item.title} direction="up" delay={i * 0.1}>
                    <SpotlightCard className="h-full bg-card hover:border-primary/20" spotlightColor="rgba(59, 130, 246, 0.1)">
                        <CardHeader>
                            <item.icon className={`w-8 h-8 mb-4 ${item.color}`} />
                            <CardTitle className="text-xl">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.desc}</p>
                        </CardContent>
                    </SpotlightCard>
                </ScrollAnimation>
            ))}
        </section>

        {/* Storage Models */}
        <section className="space-y-12">
            <ScrollAnimation direction="up">
                <h2 className="text-3xl font-bold text-center">灵活的存储模型，由您掌控</h2>
            </ScrollAnimation>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <ScrollAnimation direction="left">
                    <div className="p-8 border rounded-3xl bg-card hover:shadow-lg transition-all h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Lock className="w-48 h-48 -rotate-12 translate-x-12 -translate-y-12" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <Badge variant="outline" className="bg-background text-foreground border-foreground/20">隐私优先</Badge>
                            <h3 className="text-2xl font-bold">仅本地存储 (Local-Only)</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                数据完全保留在您的机器上，不经过任何服务器。最适合处理敏感数据、高安全性项目或离线工作。
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /> 无网络依赖</li>
                                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /> 零数据泄露风险</li>
                                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /> 浏览器 IndexedDB 存储</li>
                            </ul>
                        </div>
                    </div>
                </ScrollAnimation>
                
                <ScrollAnimation direction="right">
                    <div className="p-8 border rounded-3xl bg-card hover:shadow-lg transition-all h-full relative overflow-hidden group border-primary/20 bg-primary/5">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Database className="w-48 h-48 -rotate-12 translate-x-12 -translate-y-12 text-primary" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <Badge className="bg-primary text-primary-foreground">推荐</Badge>
                            <h3 className="text-2xl font-bold text-primary">云端同步 (Cloud Sync)</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                跨设备无缝同步您的工作，并与团队实时协作。享受版本控制、评论和共享链接带来的便利。
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary" /> 实时多人协作</li>
                                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary" /> 自动版本历史</li>
                                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary" /> 跨设备访问</li>
                            </ul>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>
        </section>

        {/* Final CTA */}
        <ScrollAnimation direction="up">
            <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 md:p-14 rounded-[2rem] text-center space-y-6 shadow-2xl overflow-hidden relative">
                 {/* Decorative circles */}
                 <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
                 
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight relative z-10">准备好构建伟大的产品了吗？</h2>
                <p className="text-lg opacity-80 max-w-2xl mx-auto relative z-10">
                    今天就开始体验可视化的未来。无需信用卡，免费开始。
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 pt-2">
                    <Button size="lg" variant="secondary" className="h-11 px-8 text-base font-semibold rounded-full hover:bg-white text-slate-900 hover:-translate-y-0.5 transition-all">
                        立即启动编辑器
                    </Button>
                    <Button size="lg" variant="outline" className="h-11 px-8 text-base font-semibold rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white hover:-translate-y-0.5 transition-all">
                        联系销售
                    </Button>
                </div>
            </section>
        </ScrollAnimation>
      </div>
    </div>
  );
};

// Helper icon
const ZapIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

export default EditorPage;
