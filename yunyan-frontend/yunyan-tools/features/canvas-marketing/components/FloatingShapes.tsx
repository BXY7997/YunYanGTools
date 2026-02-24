import { Cloud, Database, Globe, Laptop, Lock, Server, Smartphone, Users } from "lucide-react";

const outerNodes = [
  { icon: Cloud, className: "-top-2 left-8 text-cyan-500" },
  { icon: Users, className: "top-6 right-0 text-blue-600" },
  { icon: Globe, className: "bottom-8 right-2 text-sky-600" },
  { icon: Lock, className: "-bottom-1 left-12 text-indigo-600" },
];

const innerNodes = [
  { icon: Server, className: "top-8 left-1/2 -translate-x-1/2 text-blue-500" },
  { icon: Smartphone, className: "left-7 top-1/2 -translate-y-1/2 text-sky-500" },
  { icon: Laptop, className: "right-7 top-1/2 -translate-y-1/2 text-indigo-500" },
];

export const FloatingShapes = () => {
  return (
    <div className="relative mx-auto h-[360px] w-[360px]">
      <div className="absolute inset-10 rounded-full border border-dashed border-primary/25" />
      <div className="absolute inset-0 rounded-full border border-primary/15" />

      <div className="absolute inset-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 border-primary/35 bg-primary/10 shadow-lg">
        <Database className="h-10 w-10 text-primary" />
      </div>

      {innerNodes.map((item) => (
        <div
          key={item.className}
          className={`absolute flex h-12 w-12 items-center justify-center rounded-xl border bg-background/85 shadow-sm ${item.className}`}
        >
          <item.icon className="h-6 w-6" />
        </div>
      ))}

      {outerNodes.map((item) => (
        <div
          key={item.className}
          className={`absolute flex h-12 w-12 items-center justify-center rounded-xl border bg-background/85 shadow-sm ${item.className}`}
        >
          <item.icon className="h-6 w-6" />
        </div>
      ))}
    </div>
  );
};

