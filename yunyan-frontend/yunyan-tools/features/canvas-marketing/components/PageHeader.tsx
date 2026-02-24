import { cn } from "@canvas/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  children, 
  className,
}: PageHeaderProps) => {
  return (
    <section className={cn("relative container py-24 sm:py-32 text-center overflow-hidden", className)}>
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 blur-[100px] rounded-full mix-blend-multiply animate-blob" />
      </div>

      <div className="relative z-10 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {title}
        </h1>
        {description && (
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto leading-relaxed">
                {description}
            </p>
        )}
        {children}
      </div>
    </section>
  );
};
