"use client";

import { useEffect } from "react";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          出了一点小问题
        </h2>
        <p className="text-muted-foreground">
          别担心，这只是暂时的。我们的系统监控已记录下此错误。
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          返回首页
        </Button>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          尝试恢复
        </Button>
      </div>
    </div>
  );
}
