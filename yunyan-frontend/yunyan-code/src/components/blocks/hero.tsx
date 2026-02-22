"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import { ArrowRight, Terminal, Zap, Code2, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Hero = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx yunyan-cli init my-app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden selection:bg-primary/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] opacity-50 mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[80px] opacity-30 mix-blend-screen" />
      </div>

      <div className="container relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left: Typography */}
          <Reveal direction="left" distance={40} delay={0.1} className="flex-1">
            <div className="text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold mb-6 tracking-wider uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                Engine v2.0 Live
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6 leading-[1.1]">
                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
                  定义即实现
                </span>
                <span className="block text-primary">
                  代码生成新范式
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-medium">
                像写配置一样写软件。云衍通过智能 DSL 将您的业务逻辑
                直接编译为工业级源码。
                <br className="hidden md:block" />
                零技术债，全栈类型安全，开箱即部署。
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
                <Button asChild size="lg" className="h-11 px-8 rounded-full text-sm font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                  <Link href="/generators">
                    开始构建
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-8 rounded-full text-sm font-bold border-2 hover:bg-muted/50 transition-all">
                  <Link href="/docs">
                    阅读文档
                  </Link>
                </Button>
              </div>

              {/* CLI Command */}
              <div className="flex items-center gap-3 p-1 pl-4 rounded-full border bg-muted/30 backdrop-blur-sm max-w-sm mx-auto lg:mx-0 mb-10 border-border/40">
                <code className="text-[11px] font-mono text-muted-foreground truncate">npx yunyan-cli init my-app</code>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="size-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-[11px] font-bold text-muted-foreground/60 tracking-wider uppercase">
                <div className="flex items-center gap-2">
                  <Terminal className="size-3.5 text-blue-500/70" />
                  <span>CLI 驱动</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="size-3.5 text-yellow-500/70" />
                  <span>TS 强类型</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-3.5 text-green-500/70" />
                  <span>零运行时</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Code Theatre */}
          <Reveal direction="right" distance={40} delay={0.2} className="flex-1 w-full max-w-xl lg:max-w-none perspective-1000">
            <div className="relative transform transition-transform duration-700 ease-out hover:rotate-y-1 hover:rotate-x-1">
              
              {/* Glow Behind */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-2xl blur opacity-10" />
              
              {/* Main Window */}
              <div className="relative bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5 h-[320px] flex flex-col">
                
                {/* Window Controls */}
                <div className="flex items-center px-4 py-3 bg-[#252526] border-b border-white/5 shrink-0">
                  <div className="flex gap-2 mr-4">
                    <div className="size-3 rounded-full bg-[#FF5F56]" />
                    <div className="size-3 rounded-full bg-[#FFBD2E]" />
                    <div className="size-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="text-xs text-white/40 font-mono">yunyan.config.ts</div>
                </div>

                {/* Editor Content */}
                <div className="p-6 font-mono text-[14px] leading-relaxed text-white/90 overflow-hidden flex-1 relative">
                  <TypewriterEffect />
                </div>

                {/* Status Bar */}
                <div className="bg-[#007acc] px-3 py-1 text-[10px] text-white flex justify-between shrink-0">
                  <div className="flex gap-4">
                    <span>TypeScript React</span>
                    <span>UTF-8</span>
                  </div>
                  <span>Ln 6, Col 12</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const codeLines = [
  { text: 'import { defineApp } from "@yunyan/sdk";', indent: 0 },
  { text: '', indent: 0 },
  { text: 'export default defineApp({', indent: 0 },
  { text: 'name: "Next-Gen-SaaS",', indent: 1 },
  { text: 'stack: ["Next.js", "Supabase"],', indent: 1 },
  { text: 'features: ["Auth", "Payments"],', indent: 1 },
  { text: 'deploy: "Vercel"', indent: 1 },
  { text: '});', indent: 0 },
];

function TypewriterEffect() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isTyping) {
      const timeout = setTimeout(() => {
        setLineIndex(0);
        setCharIndex(0);
        setIsTyping(true);
        setShowSuccess(false);
      }, 5000); // Wait 5s before restarting
      return () => clearTimeout(timeout);
    }

    if (lineIndex >= codeLines.length) {
      setIsTyping(false);
      setTimeout(() => setShowSuccess(true), 500);
      return;
    }

    const currentLine = codeLines[lineIndex].text;
    if (charIndex >= currentLine.length) {
      const timeout = setTimeout(() => {
        setLineIndex((prev) => prev + 1);
        setCharIndex(0);
      }, 300); // Delay between lines
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, 30 + Math.random() * 30); // Typing speed

    return () => clearTimeout(timeout);
  }, [lineIndex, charIndex, isTyping]);

  return (
    <div className="relative h-full font-mono">
      {codeLines.map((line, idx) => (
        <div key={idx} className="flex min-h-[1.5em]">
          <span className="w-6 text-right text-white/20 select-none mr-4 shrink-0">{idx + 1}</span>
          <div className="flex">
            {/* Indentation */}
            <span style={{ width: `${line.indent * 1.5}rem` }} />
            
            {/* Syntax Highlighting Logic */}
            {idx < lineIndex ? (
              <HighlightedLine text={line.text} />
            ) : idx === lineIndex ? (
              <>
                <HighlightedLine text={line.text.slice(0, charIndex)} />
                <span className="w-2 h-5 bg-primary animate-pulse ml-0.5 inline-block align-middle" />
              </>
            ) : null}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 right-4 bg-green-500/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="bg-white/20 p-1 rounded-full">
              <Check className="size-4 stroke-[3]" />
            </div>
            <div>
              <div className="text-xs font-bold">Build Successful</div>
              <div className="text-[10px] opacity-80">Generated in 45ms</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Syntax Highlighter Component
function HighlightedLine({ text }: { text: string }) {
  if (!text) return null;
  
  // Basic tokenizing for demo purposes
  const parts = text.split(/(".*?"|[(){},:;[\]])/g).filter(Boolean);
  
  return (
    <span>
      {parts.map((part, i) => {
        let color = "text-[#d4d4d4]"; // default
        if (part.startsWith('"')) color = "text-[#ce9178]"; // string
        else if (part.match(/import|from|export|default|const/)) color = "text-[#c586c0]"; // keyword
        else if (part.match(/[{}[\](),:;]/)) color = "text-[#ffd700]"; // punctuation
        else if (part.match(/defineApp/)) color = "text-[#dcdcaa]"; // function
        else if (part.match(/name|stack|features|deploy/)) color = "text-[#9cdcfe]"; // property

        return <span key={i} className={cn(color)}>{part}</span>;
      })}
    </span>
  );
}
