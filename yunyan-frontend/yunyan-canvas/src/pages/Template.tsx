import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Sparkles, ArrowRight, Database, Network, Box, Share2, Search } from "lucide-react";

const templates = [
  { id: 1, name: "电商 ER 关系图", category: "ER", icon: Database, color: "bg-blue-50 text-blue-500", desc: "包含用户、订单、支付核心模块的标准化 ER 模型。" },
  { id: 2, name: "SaaS 用户流转图", category: "Flowchart", icon: Network, color: "bg-green-50 text-green-500", desc: "典型的 B2B SaaS 注册、引导与转化路径。" },
  { id: 3, name: "产品路线图", category: "Mindmap", icon: Box, color: "bg-purple-50 text-purple-500", desc: "季度规划、里程碑与关键交付物可视化。" },
  { id: 4, name: "云基础设施架构图", category: "Architecture", icon: Share2, color: "bg-orange-50 text-orange-500", desc: "AWS/Azure 混合云部署架构最佳实践。" },
  { id: 5, name: "身份验证序列图", category: "UML", icon: Network, color: "bg-pink-50 text-pink-500", desc: "OAuth 2.0 / OIDC 认证流程详解。" },
  { id: 6, name: "库存管理 ER 图", category: "ER", icon: Database, color: "bg-cyan-50 text-cyan-500", desc: "进销存系统的核心数据库设计。" },
];

export const TemplatesPage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="从成熟模板开始" 
        description="使用我们的专业模板库，加速您的工作流程。无需从零开始，直接复用行业最佳实践。"
      />

      <div className="container space-y-12">
        <Tabs defaultValue="all" className="w-full space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-center">
                <TabsTrigger value="all" className="px-4 py-2 text-sm md:text-base">全部</TabsTrigger>
                <TabsTrigger value="ER" className="px-4 py-2 text-sm md:text-base">ER 图</TabsTrigger>
                <TabsTrigger value="Flowchart" className="px-4 py-2 text-sm md:text-base">流程图</TabsTrigger>
                <TabsTrigger value="Mindmap" className="px-4 py-2 text-sm md:text-base">思维导图</TabsTrigger>
                <TabsTrigger value="Architecture" className="px-4 py-2 text-sm md:text-base">架构图</TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    className="w-full pl-9 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="搜索模板..." 
                />
            </div>
          </div>

          <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {templates.map((template, i) => (
              <ScrollAnimation key={template.id} direction="up" delay={i * 0.05}>
                <TemplateCard template={template} />
              </ScrollAnimation>
            ))}
          </TabsContent>
          
          {["ER", "Flowchart", "Mindmap", "Architecture"].map((cat) => (
            <TabsContent key={cat} value={cat} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {templates.filter(t => t.category === cat).map((template, i) => (
                <ScrollAnimation key={template.id} direction="up" delay={i * 0.05}>
                    <TemplateCard template={template} />
                </ScrollAnimation>
              ))}
            </TabsContent>
          ))}
        </Tabs>
        
        <ScrollAnimation direction="up">
            <section className="relative overflow-hidden bg-primary/5 border border-primary/10 p-8 md:p-12 rounded-3xl text-center space-y-6 mt-16">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Sparkles className="w-64 h-64 text-primary rotate-12" />
                </div>
                
                <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold">没看到您需要的？</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        告诉 AI 您的需求，例如 "设计一个包含支付网关的微服务架构图"，为您生成专属定制模板。
                    </p>
                    <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                        <Sparkles className="w-5 h-5 mr-2" />
                        AI 生成定制模板
                    </Button>
                </div>
            </section>
        </ScrollAnimation>
      </div>
    </div>
  );
};

const TemplateCard = ({ template }: { template: any }) => (
  <SpotlightCard className="h-full bg-card border-muted hover:border-primary/40 transition-all duration-300 group" spotlightColor="rgba(59, 130, 246, 0.1)">
    <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden flex items-center justify-center p-8 group-hover:bg-muted/50 transition-colors">
      {/* Abstract Representation of Diagram */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${template.color} group-hover:scale-110 transition-transform duration-300`}>
         <template.icon className="w-8 h-8" />
      </div>
      
      <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm text-foreground pointer-events-none">
        {template.category}
      </Badge>
    </div>
    
    <CardHeader className="p-6">
      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{template.name}</CardTitle>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{template.desc}</p>
    </CardHeader>
    
    <CardFooter className="p-6 pt-0 mt-auto">
      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
        使用此模板 <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
      </Button>
    </CardFooter>
  </SpotlightCard>
);

export default TemplatesPage;
