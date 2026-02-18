import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-primary/20 opacity-75"></div>
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </div>
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          正在加载云衍引擎...
        </p>
      </div>
    </div>
  );
}
