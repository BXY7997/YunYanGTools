import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Square, Diamond, MousePointer2 } from "lucide-react";

// Types for our shapes
type ShapeType = "rect" | "diamond" | "circle";

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  color: string;
  label: string;
}

export const HeroAnimation = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<ShapeType | "select">("select");
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);

  // Animation sequence configuration
  useEffect(() => {
    const sequence = async () => {
      // Helper to move cursor
      const moveCursor = async (x: number, y: number, duration = 1000) => {
        setCursorPos({ x, y });
        await new Promise((r) => setTimeout(r, duration));
      };

      // Helper to click
      const click = async () => {
        setIsClicking(true);
        await new Promise((r) => setTimeout(r, 150));
        setIsClicking(false);
        await new Promise((r) => setTimeout(r, 150));
      };

      // 1. Select Rectangle Tool
      await moveCursor(20, 100); // Toolbar position (approx)
      await click();
      setSelectedTool("rect");

      // 2. Draw Start Node
      await moveCursor(150, 80); // Canvas position
      await click();
      setShapes((prev) => [
        ...prev,
        { id: "1", type: "rect", x: 150, y: 80, color: "bg-blue-100 border-blue-500", label: "Start" },
      ]);
      setSelectedTool("select");

      // 3. Select Diamond Tool
      await moveCursor(20, 160); // Toolbar position
      await click();
      setSelectedTool("diamond");

      // 4. Draw Decision Node
      await moveCursor(150, 200);
      await click();
      setShapes((prev) => [
        ...prev,
        { id: "2", type: "diamond", x: 150, y: 200, color: "bg-orange-100 border-orange-500", label: "Check?" },
      ]);
      setSelectedTool("select");

      // 5. Connect them (simulated)
      await moveCursor(150, 140); // Between nodes
      // Ideally show a line appearing here, simplified for this v1
      
      // 6. Select Decision Node
      await moveCursor(150, 200);
      await click();
      
      // 7. Change Color via Property Panel (simulated interaction)
      await moveCursor(360, 100); // Property panel area
      await click();
      setShapes((prev) =>
        prev.map((s) => (s.id === "2" ? { ...s, color: "bg-green-100 border-green-500" } : s))
      );

      // Loop or Reset? Let's just hold for now or reset after a long delay
      await new Promise((r) => setTimeout(r, 3000));
      setShapes([]); // Clear to loop
    };

    const interval = setInterval(() => {
        setShapes([]); // Reset
        sequence();
    }, 12000); // Full cycle

    sequence(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-background border border-border rounded-xl shadow-2xl overflow-hidden select-none">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Left Toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-2 bg-card border border-border rounded-lg shadow-sm z-10">
        <ToolIcon icon={MousePointer2} active={selectedTool === "select"} />
        <ToolIcon icon={Square} active={selectedTool === "rect"} />
        <ToolIcon icon={Diamond} active={selectedTool === "diamond"} />
      </div>

      {/* Right Properties Panel */}
      <div className="absolute right-4 top-4 bottom-4 w-48 bg-card border border-border rounded-lg shadow-sm z-10 p-4 flex flex-col gap-4">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-full bg-muted/50 rounded" />
        <div className="h-8 w-full bg-muted/50 rounded" />
        <div className="mt-auto h-20 w-full bg-muted/20 rounded border border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground">
          Properties
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-full">
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute flex items-center justify-center border-2 text-xs font-medium shadow-sm ${shape.color} ${
              shape.type === "diamond" ? "w-24 h-24 rotate-45" : "w-32 h-16 rounded-md"
            }`}
            style={{
              left: shape.x,
              top: shape.y,
              transform: "translate(-50%, -50%)", // Center anchor
            }}
          >
            <span className={shape.type === "diamond" ? "-rotate-45" : ""}>{shape.label}</span>
          </motion.div>
        ))}

        {/* Connecting Line (Hardcoded for demo) */}
        {shapes.length >= 2 && (
          <svg className="absolute inset-0 pointer-events-none z-0">
            <motion.path
              d="M 150 120 L 150 160" // From bottom of rect to top of diamond
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        )}
      </div>

      {/* Cursor */}
      <motion.div
        className="absolute z-50 pointer-events-none"
        animate={{
          x: cursorPos.x,
          y: cursorPos.y,
          scale: isClicking ? 0.9 : 1,
        }}
        transition={{
            x: { type: "tween", ease: "easeInOut", duration: 1 }, // Smooth movement
            y: { type: "tween", ease: "easeInOut", duration: 1 },
            scale: { duration: 0.1 }
        }}
      >
        <MousePointer2
          className={`w-6 h-6 text-primary fill-primary ${isClicking ? "scale-90" : ""}`}
        />
      </motion.div>
    </div>
  );
};

const ToolIcon = ({ icon: Icon, active }: { icon: any; active: boolean }) => (
  <div
    className={`p-2 rounded-md transition-colors ${
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
    }`}
  >
    <Icon className="w-5 h-5" />
  </div>
);
