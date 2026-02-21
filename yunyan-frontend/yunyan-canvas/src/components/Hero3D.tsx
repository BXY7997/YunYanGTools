import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight, Sparkles, MousePointer2, Square, Circle } from "lucide-react";
import { Button } from "./ui/button";

export const Hero3D = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [0, 15]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  return (
    <motion.section 
        ref={ref} 
        style={{ scale, opacity, rotateX }}
        className="relative min-h-[90vh] flex flex-col items-center justify-start pt-20 lg:pt-24 overflow-hidden perspective-1000"
    >
      {/* Background Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative z-10 text-center px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-secondary/50 backdrop-blur-sm mb-4"
        >
          <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">全新 AI 绘图引擎 v2.0 已发布</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-4 py-2 leading-tight md:leading-snug"
        >
          构建
          <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent px-2 pb-1 inline-block">
            下一代
          </span>
          <br className="hidden md:block" />
          可视化协作平台
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-muted-foreground max-w-[600px] mx-auto mb-8"
        >
          融合 AI 智能与工程化思维，从草图到系统架构，只需几秒钟。
          <br className="hidden md:block" />
          让团队协作像思维本身一样流畅。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
        >
          <Button size="lg" className="h-10 px-6 text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
            免费开始使用 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="h-10 px-6 text-sm font-semibold backdrop-blur-sm bg-background/50 hover:bg-accent/50">
            查看演示视频
          </Button>
        </motion.div>
      </div>

      <div className="w-full max-w-5xl px-4 perspective-[1200px] pb-10">
         <Card3D />
      </div>
    </motion.section>
  );
};

const Card3D = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [cycle, setCycle] = useState(0);

    // Infinite animation cycle trigger
    useEffect(() => {
        const interval = setInterval(() => {
            setCycle(c => c + 1);
        }, 8000); // Increased cycle duration for smoother feel
        return () => clearInterval(interval);
    }, []);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left - width / 2);
        mouseY.set(clientY - top - height / 2);
    }

    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [1, -1]), { stiffness: 100, damping: 30 }); // Reduced rotation range
    const rotateY = useSpring(useTransform(mouseX, [-600, 600], [-1, 1]), { stiffness: 100, damping: 30 });

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                mouseX.set(0);
                mouseY.set(0);
            }}
            className="relative w-full aspect-[16/10] bg-[#f8f9fa] dark:bg-[#1e1e1e] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden group"
        >
            {/* Header & Toolbars (Draw.io Style) */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-[#f1f3f4] dark:bg-[#2a2a2a] border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-4 z-20">
                 {/* Menu Bar Simulation */}
                 <div className="flex gap-4 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Arrange</span>
                    <span>Extras</span>
                    <span>Help</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">Unsaved changes</span>
                 </div>
            </div>
            
            {/* Toolbar */}
            <div className="absolute top-10 left-0 right-0 h-10 bg-[#f1f3f4] dark:bg-[#2a2a2a] border-b border-zinc-200 dark:border-zinc-700 flex items-center px-2 gap-2 z-20">
                <div className="flex gap-1">
                    <div className="w-6 h-6 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center"><MousePointer2 className="w-3 h-3 text-zinc-600" /></div>
                    <div className="w-6 h-6 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center"><Square className="w-3 h-3 text-zinc-600" /></div>
                    <div className="w-6 h-6 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center"><Circle className="w-3 h-3 text-zinc-600" /></div>
                </div>
            </div>

            {/* Left Sidebar (Shapes) */}
            <div className="absolute top-20 left-0 bottom-0 w-40 bg-[#fbfbfb] dark:bg-[#202020] border-r border-zinc-200 dark:border-zinc-700 flex flex-col p-2 gap-2 z-10 overflow-hidden">
                 <div className="text-[10px] font-bold text-zinc-500 uppercase px-1">General</div>
                 <div className="grid grid-cols-4 gap-2 px-1">
                     <div className="aspect-square border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2a2a2a] rounded-sm" />
                     <div className="aspect-square border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2a2a2a] rounded-full" />
                     <div className="aspect-square border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2a2a2a] rotate-45" />
                     <div className="aspect-square border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2a2a2a] rounded-lg" />
                 </div>
                 <div className="text-[10px] font-bold text-zinc-500 uppercase px-1 mt-2">UML</div>
                 <div className="grid grid-cols-2 gap-2 px-1 opacity-50">
                     <div className="h-6 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2a2a2a]" />
                     <div className="h-6 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2a2a2a]" />
                 </div>
            </div>

            {/* Right Sidebar (Format) */}
            <div className="absolute top-20 right-0 bottom-0 w-52 bg-[#fbfbfb] dark:bg-[#202020] border-l border-zinc-200 dark:border-zinc-700 z-10 p-3 hidden md:block">
                 <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-2">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 border-b-2 border-blue-500 pb-2 -mb-2.5">Style</span>
                    <span className="text-[11px] text-zinc-500">Text</span>
                    <span className="text-[11px] text-zinc-500">Arrange</span>
                 </div>
                 <div className="grid grid-cols-4 gap-1 mb-4">
                     <div className="h-6 bg-white border border-zinc-300 rounded shadow-sm" />
                     <div className="h-6 bg-blue-100 border border-blue-300 rounded shadow-sm" />
                     <div className="h-6 bg-green-100 border border-green-300 rounded shadow-sm" />
                     <div className="h-6 bg-orange-100 border border-orange-300 rounded shadow-sm" />
                 </div>
            </div>

            {/* Animation Canvas */}
            <div className="absolute top-20 left-40 right-0 md:right-52 bottom-0 bg-white dark:bg-[#1e1e1e] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.3]"
                    style={{ backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                />

                <div className="absolute inset-0">
                    <svg className="w-full h-full pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                         <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                            </marker>
                         </defs>
                         
                         {/* Connection 1 */}
                         <motion.path 
                            key={`path1-${cycle}`}
                            d="M 400 300 L 400 220 L 200 220 L 200 150" 
                            fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0, opacity: 0 }} 
                            animate={{ pathLength: 1, opacity: 1 }} 
                            transition={{ duration: 0.8, delay: 0.5, ease: "linear" }}
                         />
                         {/* Connection 2 */}
                         <motion.path 
                            key={`path2-${cycle}`}
                            d="M 400 300 L 400 220 L 600 220 L 600 150" 
                            fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0, opacity: 0 }} 
                            animate={{ pathLength: 1, opacity: 1 }} 
                            transition={{ duration: 0.8, delay: 1.5, ease: "linear" }}
                         />
                         {/* Connection 3 */}
                         <motion.path 
                             key={`path3-${cycle}`}
                            d="M 400 300 L 400 450" 
                            fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0, opacity: 0 }} 
                            animate={{ pathLength: 1, opacity: 1 }} 
                            transition={{ duration: 0.8, delay: 2.5, ease: "linear" }}
                         />
                    </svg>

                    {/* Central Node (400, 300) -> 50%, 50% */}
                    <motion.div 
                        key={`node1-${cycle}`}
                        className="absolute bg-white dark:bg-[#2a2a2a] border border-blue-500 shadow-md p-0 w-40 h-16 z-10 flex items-center justify-center"
                        style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
                        initial={{ scale: 0, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    >
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Order Service</span>
                        {/* Port points */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100" />
                    </motion.div>

                    {/* Top Left Node (200, 150) -> 25%, 25% */}
                    <motion.div 
                        key={`node2-${cycle}`}
                        className="absolute bg-orange-50 dark:bg-orange-900/20 border border-orange-400 shadow-sm p-0 w-32 h-12 z-10 flex items-center justify-center rounded"
                        style={{ top: "25%", left: "25%", x: "-50%", y: "-50%" }}
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 1.2 }}
                    >
                         <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">User API</span>
                    </motion.div>

                    {/* Top Right Node (600, 150) -> 75%, 25% */}
                    <motion.div 
                        key={`node3-${cycle}`}
                        className="absolute bg-green-50 dark:bg-green-900/20 border border-green-400 shadow-sm p-0 w-32 h-12 z-10 flex items-center justify-center rounded"
                        style={{ top: "25%", left: "75%", x: "-50%", y: "-50%" }}
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 2.2 }}
                    >
                         <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Payment</span>
                    </motion.div>

                    {/* Bottom Node (400, 450) -> 50%, 75% */}
                    <motion.div 
                        key={`node4-${cycle}`}
                        className="absolute bg-white dark:bg-[#2a2a2a] border border-zinc-400 shadow-sm p-0 w-32 h-24 z-10 flex flex-col items-center justify-center rounded-none"
                        style={{ top: "75%", left: "50%", x: "-50%", y: "-50%" }}
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ delay: 3.2 }}
                    >
                         <div className="w-full h-4 border-b border-zinc-400 bg-zinc-100 dark:bg-zinc-800 mb-2" />
                         <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">PostgreSQL</span>
                    </motion.div>

                    {/* Cursor */}
                    <motion.div
                        key={`cursor-${cycle}`}
                        className="absolute pointer-events-none z-50"
                        initial={{ top: "50%", left: "50%", opacity: 0 }}
                        animate={{ 
                            top: ["50%", "25%", "25%", "75%", "50%"],
                            left: ["50%", "25%", "75%", "50%", "50%"],
                            opacity: [0, 1, 1, 1, 0]
                        }}
                        transition={{ duration: 7, ease: "easeInOut" }}
                    >
                         <MousePointer2 className="w-4 h-4 text-black dark:text-white fill-black dark:fill-white" />
                         <div className="ml-3 mt-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                            AI Builder
                         </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
        </motion.div>
    )
}
