/**
 * Hero3D — Theme-aware hero section
 * - Shared light/dark token map injected as CSS variables
 * - draw.io chrome / canvas / nodes / copy all follow navbar theme toggle
 * - All SVG animation bugs fixed (no motion.circle r, no CSS x/y on SVG)
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
  useReducedMotion,
} from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useTheme } from "next-themes";

function resolveIcon(...names: string[]) {
  const icons = LucideIcons as Record<string, unknown>;
  for (const name of names) {
    const icon = icons[name];
    if (typeof icon === "function") {
      return icon as React.ComponentType<Record<string, unknown>>;
    }
  }
  return icons.Circle as React.ComponentType<Record<string, unknown>>;
}

const ArrowRight = resolveIcon("ArrowRight");
const Sparkles = resolveIcon("Sparkles", "Star");
const MousePointer2 = resolveIcon("MousePointer2", "MousePointer");
const Square = resolveIcon("Square");
const Circle = resolveIcon("Circle");
const Minus = resolveIcon("Minus");
const ZoomIn = resolveIcon("ZoomIn");
const ZoomOut = resolveIcon("ZoomOut");
const Maximize2 = resolveIcon("Maximize2", "Maximize");
const RotateCcw = resolveIcon("RotateCcw");
const Share2 = resolveIcon("Share2", "Share");
const Download = resolveIcon("Download");
const ChevronDown = resolveIcon("ChevronDown");
const Search = resolveIcon("Search");
const Plus = resolveIcon("Plus");
const Sliders = resolveIcon("Sliders", "SlidersHorizontal", "Settings2");

/* ─────────────────────────────────────────────
   DIAGRAM DATA  (760 × 430 virtual canvas)
───────────────────────────────────────────── */
const VW = 760;
const VH = 430;

interface DiagramNode {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isDB?: boolean;
}

interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

interface DiagramPoint {
  x: number;
  y: number;
}

const NODES: DiagramNode[] = [
  { id: "client",  label: "Client App",    sub: "React / Next.js", x: 280, y: 18,  w: 200, h: 52 },
  { id: "gateway", label: "API Gateway",   sub: "Kong / nginx",    x: 280, y: 122, w: 200, h: 52 },
  { id: "order",   label: "Order Service", sub: "Node.js",         x: 58,  y: 234, w: 158, h: 50 },
  { id: "payment", label: "Payment",       sub: "Go",              x: 301, y: 234, w: 158, h: 50 },
  { id: "user",    label: "User Service",  sub: "Python",          x: 544, y: 234, w: 158, h: 50 },
  { id: "db",      label: "PostgreSQL",    sub: "Primary DB",      x: 58,  y: 350, w: 158, h: 50, isDB: true },
  { id: "cache",   label: "Redis Cache",   sub: "In-memory",       x: 544, y: 350, w: 158, h: 50, isDB: true },
];

const EDGES: DiagramEdge[] = [
  { id: "e1", from: "client",  to: "gateway", label: "HTTPS" },
  { id: "e2", from: "gateway", to: "order",   label: "" },
  { id: "e3", from: "gateway", to: "payment", label: "" },
  { id: "e4", from: "gateway", to: "user",    label: "" },
  { id: "e5", from: "order",   to: "db",      label: "SQL" },
  { id: "e6", from: "payment", to: "db",      label: "" },
  { id: "e7", from: "user",    to: "cache",   label: "GET/SET" },
];

const HERO3D_THEME_VARS: Record<"light" | "dark", Record<string, string>> = {
  light: {
    "--hero3d-section-bg": "#ffffff",
    "--hero3d-grid-dot": "#e2e8f0",
    "--hero3d-grid-opacity": "0.6",
    "--hero3d-blob-blue": "radial-gradient(circle, rgba(219,234,254,0.7) 0%, transparent 70%)",
    "--hero3d-blob-purple": "radial-gradient(circle, rgba(224,231,255,0.6) 0%, transparent 70%)",
    "--hero3d-blob-pink": "radial-gradient(circle, rgba(219,234,254,0.52) 0%, transparent 70%)",
    "--hero3d-badge-bg": "rgba(239,246,255,1)",
    "--hero3d-badge-border": "rgba(191,219,254,1)",
    "--hero3d-badge-text": "#2563eb",
    "--hero3d-badge-dot": "#3b82f6",
    "--hero3d-title-color": "#0f172a",
    "--hero3d-title-gradient": "linear-gradient(120deg,#2563eb 0%,#0ea5e9 100%)",
    "--hero3d-subtitle": "#64748b",
    "--hero3d-primary-btn-bg": "linear-gradient(135deg,#2563eb,#0ea5e9)",
    "--hero3d-primary-btn-shadow": "0 4px 20px rgba(37,99,235,0.32), inset 0 1px 0 rgba(255,255,255,0.15)",
    "--hero3d-secondary-btn-bg": "#ffffff",
    "--hero3d-secondary-btn-text": "#374151",
    "--hero3d-secondary-btn-border": "#e5e7eb",
    "--hero3d-secondary-btn-shadow": "0 1px 4px rgba(0,0,0,0.06)",
    "--hero3d-bottom-fade": "linear-gradient(to top, #ffffff, transparent)",
    "--hero3d-card-floor": "rgba(0,0,0,0.12)",
    "--hero3d-card-border": "#e5e7eb",
    "--hero3d-card-shadow": "0 24px 64px -12px rgba(0,0,0,0.12), 0 8px 24px -4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
    "--hero3d-chrome-bg": "#f1f3f4",
    "--hero3d-chrome-border": "#dadce0",
    "--hero3d-chrome-title": "#374151",
    "--hero3d-chrome-menu": "#4b5563",
    "--hero3d-hover-bg": "rgba(0,0,0,0.05)",
    "--hero3d-status-dot": "#fbbf24",
    "--hero3d-status-text": "#9ca3af",
    "--hero3d-action-border": "#dadce0",
    "--hero3d-action-bg": "#ffffff",
    "--hero3d-action-text": "#6b7280",
    "--hero3d-action-hover": "#1f2937",
    "--hero3d-export-border": "#bfdbfe",
    "--hero3d-export-bg": "#eff6ff",
    "--hero3d-export-text": "#2563eb",
    "--hero3d-toolbox-bg": "#ffffff",
    "--hero3d-tool-active-bg": "#1d4ed8",
    "--hero3d-tool-active-text": "#ffffff",
    "--hero3d-tool-idle-text": "#6b7280",
    "--hero3d-toolbar-icon": "#6b7280",
    "--hero3d-toolbar-icon-hover": "#1f2937",
    "--hero3d-search-bg": "#ffffff",
    "--hero3d-search-border": "#dadce0",
    "--hero3d-search-text": "#9ca3af",
    "--hero3d-canvas-bg": "#ffffff",
    "--hero3d-status-live": "#16a34a",
    "--hero3d-sidebar-bg": "#f9fafb",
    "--hero3d-sidebar-border": "#e5e7eb",
    "--hero3d-sidebar-title": "#9ca3af",
    "--hero3d-sidebar-title-hover": "#4b5563",
    "--hero3d-shape-bg": "#ffffff",
    "--hero3d-shape-border": "#e5e7eb",
    "--hero3d-shape-hover-border": "#60a5fa",
    "--hero3d-shape-label": "#9ca3af",
    "--hero3d-shape-label-hover": "#4b5563",
    "--hero3d-shape-icon-border": "#9ca3af",
    "--hero3d-right-tab-active": "#2563eb",
    "--hero3d-right-tab-inactive": "#9ca3af",
    "--hero3d-panel-divider": "#e5e7eb",
    "--hero3d-conn-item-hover": "#f3f4f6",
    "--hero3d-conn-active": "#2563eb",
    "--hero3d-conn-inactive": "#d1d5db",
    "--hero3d-prop-key": "#6b7280",
    "--hero3d-prop-value": "#374151",
    "--hero3d-prop-chip-bg": "#ffffff",
    "--hero3d-prop-chip-border": "#e5e7eb",
    "--hero3d-ai-suggest-border": "#e5e7eb",
    "--hero3d-ai-suggest-text": "#6b7280",
    "--hero3d-ai-suggest-hover-bg": "#f3f4f6",
    "--hero3d-ai-suggest-hover-text": "#1f2937",
    "--hero3d-ai-plus": "#3b82f6",
    "--hero3d-edge": "#adb5bd",
    "--hero3d-edge-dot": "#9ca3af",
    "--hero3d-edge-label-bg": "#ffffff",
    "--hero3d-edge-label-border": "#dee2e6",
    "--hero3d-edge-label-text": "#6b7280",
    "--hero3d-node-shadow": "rgba(0,0,0,0.05)",
    "--hero3d-node-bg": "#ffffff",
    "--hero3d-node-border": "#d1d5db",
    "--hero3d-node-db-band": "#f3f4f6",
    "--hero3d-node-db-border": "#e5e7eb",
    "--hero3d-node-title": "#111827",
    "--hero3d-node-sub": "#9ca3af",
    "--hero3d-cursor-fill": "#374151",
    "--hero3d-cursor-stroke": "#ffffff",
    "--hero3d-cursor-chip-bg": "#111827",
    "--hero3d-cursor-chip-text": "#ffffff",
    "--hero3d-diagram-dot": "#e5e7eb",
    "--hero3d-diagram-bg": "#ffffff",
  },
  dark: {
    "--hero3d-section-bg": "#020617",
    "--hero3d-grid-dot": "#1e293b",
    "--hero3d-grid-opacity": "0.55",
    "--hero3d-blob-blue": "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)",
    "--hero3d-blob-purple": "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)",
    "--hero3d-blob-pink": "radial-gradient(circle, rgba(14,165,233,0.22) 0%, transparent 70%)",
    "--hero3d-badge-bg": "rgba(30,41,59,0.9)",
    "--hero3d-badge-border": "rgba(59,130,246,0.35)",
    "--hero3d-badge-text": "#93c5fd",
    "--hero3d-badge-dot": "#60a5fa",
    "--hero3d-title-color": "#f8fafc",
    "--hero3d-title-gradient": "linear-gradient(120deg,#60a5fa 0%,#22d3ee 100%)",
    "--hero3d-subtitle": "#94a3b8",
    "--hero3d-primary-btn-bg": "linear-gradient(135deg,#2563eb,#0891b2)",
    "--hero3d-primary-btn-shadow": "0 8px 28px rgba(37,99,235,0.42), inset 0 1px 0 rgba(255,255,255,0.22)",
    "--hero3d-secondary-btn-bg": "#0f172a",
    "--hero3d-secondary-btn-text": "#cbd5e1",
    "--hero3d-secondary-btn-border": "#334155",
    "--hero3d-secondary-btn-shadow": "0 1px 6px rgba(2,6,23,0.6)",
    "--hero3d-bottom-fade": "linear-gradient(to top, #020617, transparent)",
    "--hero3d-card-floor": "rgba(2,6,23,0.55)",
    "--hero3d-card-border": "#334155",
    "--hero3d-card-shadow": "0 28px 72px -16px rgba(2,6,23,0.72), 0 10px 30px -8px rgba(2,6,23,0.55), 0 0 0 1px rgba(148,163,184,0.16)",
    "--hero3d-chrome-bg": "#0f172a",
    "--hero3d-chrome-border": "#1e293b",
    "--hero3d-chrome-title": "#e2e8f0",
    "--hero3d-chrome-menu": "#94a3b8",
    "--hero3d-hover-bg": "rgba(148,163,184,0.16)",
    "--hero3d-status-dot": "#f59e0b",
    "--hero3d-status-text": "#64748b",
    "--hero3d-action-border": "#334155",
    "--hero3d-action-bg": "#111827",
    "--hero3d-action-text": "#cbd5e1",
    "--hero3d-action-hover": "#f8fafc",
    "--hero3d-export-border": "#1d4ed8",
    "--hero3d-export-bg": "rgba(30,58,138,0.35)",
    "--hero3d-export-text": "#93c5fd",
    "--hero3d-toolbox-bg": "#111827",
    "--hero3d-tool-active-bg": "#2563eb",
    "--hero3d-tool-active-text": "#ffffff",
    "--hero3d-tool-idle-text": "#94a3b8",
    "--hero3d-toolbar-icon": "#94a3b8",
    "--hero3d-toolbar-icon-hover": "#e2e8f0",
    "--hero3d-search-bg": "#111827",
    "--hero3d-search-border": "#334155",
    "--hero3d-search-text": "#64748b",
    "--hero3d-canvas-bg": "#0b1220",
    "--hero3d-status-live": "#4ade80",
    "--hero3d-sidebar-bg": "#111827",
    "--hero3d-sidebar-border": "#1f2937",
    "--hero3d-sidebar-title": "#64748b",
    "--hero3d-sidebar-title-hover": "#cbd5e1",
    "--hero3d-shape-bg": "#0f172a",
    "--hero3d-shape-border": "#334155",
    "--hero3d-shape-hover-border": "#60a5fa",
    "--hero3d-shape-label": "#64748b",
    "--hero3d-shape-label-hover": "#cbd5e1",
    "--hero3d-shape-icon-border": "#64748b",
    "--hero3d-right-tab-active": "#60a5fa",
    "--hero3d-right-tab-inactive": "#64748b",
    "--hero3d-panel-divider": "#1f2937",
    "--hero3d-conn-item-hover": "#1f2937",
    "--hero3d-conn-active": "#60a5fa",
    "--hero3d-conn-inactive": "#334155",
    "--hero3d-prop-key": "#94a3b8",
    "--hero3d-prop-value": "#e2e8f0",
    "--hero3d-prop-chip-bg": "#0f172a",
    "--hero3d-prop-chip-border": "#334155",
    "--hero3d-ai-suggest-border": "#334155",
    "--hero3d-ai-suggest-text": "#94a3b8",
    "--hero3d-ai-suggest-hover-bg": "#1e293b",
    "--hero3d-ai-suggest-hover-text": "#f8fafc",
    "--hero3d-ai-plus": "#60a5fa",
    "--hero3d-edge": "#475569",
    "--hero3d-edge-dot": "#60a5fa",
    "--hero3d-edge-label-bg": "#0f172a",
    "--hero3d-edge-label-border": "#334155",
    "--hero3d-edge-label-text": "#cbd5e1",
    "--hero3d-node-shadow": "rgba(2,6,23,0.45)",
    "--hero3d-node-bg": "#111827",
    "--hero3d-node-border": "#334155",
    "--hero3d-node-db-band": "#1e293b",
    "--hero3d-node-db-border": "#334155",
    "--hero3d-node-title": "#f8fafc",
    "--hero3d-node-sub": "#93c5fd",
    "--hero3d-cursor-fill": "#e2e8f0",
    "--hero3d-cursor-stroke": "#0f172a",
    "--hero3d-cursor-chip-bg": "#1e293b",
    "--hero3d-cursor-chip-text": "#f8fafc",
    "--hero3d-diagram-dot": "#1f2937",
    "--hero3d-diagram-bg": "#0b1220",
  },
};

const HERO_TRUST_METRICS = [
  { value: "50,000+", label: "活跃团队" },
  { value: "98.3%", label: "协作满意度" },
  { value: "35%", label: "方案交付提速" },
] as const;

const getNodeById = (id: string): DiagramNode => {
  const node = NODES.find((candidate) => candidate.id === id);
  if (!node) {
    throw new Error(`Unknown diagram node: ${id}`);
  }
  return node;
};

const nodeCx = (n: DiagramNode): number => n.x + n.w / 2;
const nodeCy = (n: DiagramNode): number => n.y + n.h / 2;

function buildEdgePath(from: DiagramNode, to: DiagramNode): string {
  const sx = nodeCx(from), sy = from.y + from.h;
  const ex = nodeCx(to),   ey = to.y;
  const ctrl = Math.min(Math.abs(ey - sy) * 0.5, 68);
  return `M ${sx} ${sy} C ${sx} ${sy + ctrl}, ${ex} ${ey - ctrl}, ${ex} ${ey}`;
}

function bezierMid(from: DiagramNode, to: DiagramNode): DiagramPoint {
  const sx = nodeCx(from), sy = from.y + from.h;
  const ex = nodeCx(to),   ey = to.y;
  const ctrl = Math.min(Math.abs(ey - sy) * 0.5, 68);
  return {
    x: (sx + 3 * sx + 3 * ex + ex) / 8,
    y: (sy + 3 * (sy + ctrl) + 3 * (ey - ctrl) + ey) / 8,
  };
}

/* ─────────────────────────────────────────────
   ANIMATED EDGE
───────────────────────────────────────────── */
interface AnimatedEdgeProps {
  edge: DiagramEdge;
  fromNode: DiagramNode;
  toNode: DiagramNode;
  drawDelay: number;
  seq: number;
}

const AnimatedEdge = ({ edge, fromNode, toNode, drawDelay, seq }: AnimatedEdgeProps) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [dotVisible,   setDotVisible]   = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const DRAW_DUR = 0.55;

  useEffect(() => {
    setDotVisible(false);
    setLabelVisible(false);
    const el = pathRef.current;
    if (!el) return;

    el.style.transition = "none";
    const len = el.getTotalLength();
    el.style.strokeDasharray  = String(len);
    el.style.strokeDashoffset = String(len);
    el.style.opacity = "0";
    void el.getBoundingClientRect();

    const tDraw = setTimeout(() => {
      el.style.transition = [
        `opacity 0.01s linear ${drawDelay}s`,
        `stroke-dashoffset ${DRAW_DUR}s cubic-bezier(0.4,0,0.2,1) ${drawDelay}s`,
      ].join(", ");
      el.style.opacity = "1";
      el.style.strokeDashoffset = "0";
    }, 20);

    const tDot   = setTimeout(() => setDotVisible(true),   (drawDelay + DRAW_DUR) * 1000 + 40);
    const tLabel = setTimeout(() => setLabelVisible(true), (drawDelay + DRAW_DUR) * 1000 + 80);

    return () => { clearTimeout(tDraw); clearTimeout(tDot); clearTimeout(tLabel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  const d   = buildEdgePath(fromNode, toNode);
  const mid = bezierMid(fromNode, toNode);

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="var(--hero3d-edge)"
        strokeWidth="1.2"
        strokeLinecap="round"
        style={{ willChange: "stroke-dashoffset" }}
      />
      {/* Arrow tip — plain circle, NO motion.circle r animate */}
      {dotVisible && (
        <circle
          cx={nodeCx(toNode)} cy={toNode.y}
          r="3" fill="var(--hero3d-edge-dot)"
          style={{ animation: "fdot .2s ease-out both" }}
        />
      )}
      {/* Label */}
      {edge.label && labelVisible && (
        <g style={{ animation: "fdot .2s ease-out both" }}>
          <rect
            x={mid.x - 20} y={mid.y - 7}
            width={40} height={13} rx={3}
            fill="var(--hero3d-edge-label-bg)" stroke="var(--hero3d-edge-label-border)" strokeWidth="0.8"
          />
          <text
            x={mid.x} y={mid.y + 3}
            textAnchor="middle"
            fontSize="7.5" fill="var(--hero3d-edge-label-text)"
            fontFamily="'JetBrains Mono',monospace" fontWeight="600"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
};

/* ─────────────────────────────────────────────
   ANIMATED NODE  (white, monochrome)
───────────────────────────────────────────── */
interface AnimatedNodeProps {
  node: DiagramNode;
  appearDelay: number;
}

const AnimatedNode = ({ node, appearDelay }: AnimatedNodeProps) => {
  const cx = nodeCx(node), cy = nodeCy(node);
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: appearDelay }}
      style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "fill-box" }}
    >
      {/* Subtle shadow */}
      <rect
        x={node.x + 1} y={node.y + 2}
        width={node.w} height={node.h}
        rx={4} fill="var(--hero3d-node-shadow)"
      />
      {/* Body */}
      <rect
        x={node.x} y={node.y}
        width={node.w} height={node.h}
        rx={4} fill="var(--hero3d-node-bg)"
        stroke="var(--hero3d-node-border)" strokeWidth="1"
      />
      {/* DB header band */}
      {node.isDB && (
        <>
          <rect x={node.x} y={node.y} width={node.w} height={14} rx={4} fill="var(--hero3d-node-db-band)" />
          <rect x={node.x} y={node.y + 10} width={node.w} height={4} fill="var(--hero3d-node-db-band)" />
          <line
            x1={node.x} y1={node.y + 14}
            x2={node.x + node.w} y2={node.y + 14}
            stroke="var(--hero3d-node-db-border)" strokeWidth="0.8"
          />
        </>
      )}
      {/* Label */}
      <text
        x={cx} y={cy - 5}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="600"
        fill="var(--hero3d-node-title)"
        fontFamily="'Inter','Segoe UI',system-ui,sans-serif"
        letterSpacing="-0.2"
      >
        {node.label}
      </text>
      {/* Sub-label */}
      <text
        x={cx} y={cy + 10}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontWeight="400"
        fill="var(--hero3d-node-sub)"
        fontFamily="'JetBrains Mono',monospace"
      >
        {node.sub}
      </text>
    </motion.g>
  );
};

/* ─────────────────────────────────────────────
   CURSOR  (SVG-safe: setAttribute transform)
───────────────────────────────────────────── */
interface CursorAnimProps {
  seq: number;
}

const CursorAnim = ({ seq }: CursorAnimProps) => {
  const groupRef   = useRef<SVGGElement | null>(null);
  const opGroupRef = useRef<SVGGElement | null>(null);
  const cx = useMotionValue(nodeCx(NODES[0]));
  const cy = useMotionValue(nodeCy(NODES[0]));
  const op = useMotionValue(0);

  const waypoints = useMemo<DiagramPoint[]>(() => {
    const ids = ["client","gateway","order","db","payment","user","cache"];
    return ids.map((id): DiagramPoint => {
      const node = getNodeById(id);
      return { x: nodeCx(node), y: nodeCy(node) };
    });
  }, []);

  useEffect(() => {
    const syncXY = () => {
      if (groupRef.current)
        groupRef.current.setAttribute("transform", `translate(${cx.get()},${cy.get()})`);
    };
    const syncOp = () => {
      if (opGroupRef.current)
        opGroupRef.current.setAttribute("opacity", String(op.get()));
    };
    const u1 = cx.on("change", syncXY);
    const u2 = cy.on("change", syncXY);
    const u3 = op.on("change", syncOp);
    return () => { u1(); u2(); u3(); };
  }, [cx, cy, op]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      cx.set(waypoints[0].x); cy.set(waypoints[0].y); op.set(0);
      if (groupRef.current)
        groupRef.current.setAttribute("transform", `translate(${waypoints[0].x},${waypoints[0].y})`);

      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      if (!alive) return;
      await animate(op, 1, { duration: 0.3 });

      for (let i = 1; i < waypoints.length; i++) {
        if (!alive) return;
        await Promise.all([
          animate(cx, waypoints[i].x, { duration: 0.85, ease: [0.4, 0, 0.2, 1] }),
          animate(cy, waypoints[i].y, { duration: 0.85, ease: [0.4, 0, 0.2, 1] }),
        ]);
        if (!alive) return;
        await new Promise<void>((resolve) => setTimeout(resolve, 400));
      }
      await animate(op, 0, { duration: 0.35 });
    };
    run();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  return (
    <g ref={opGroupRef} opacity="0">
      <g ref={groupRef} transform={`translate(${waypoints[0].x},${waypoints[0].y})`}>
        <g transform="translate(-5,-5)">
          <polygon
            points="0,0 0,13 3.8,9.5 6.5,15.5 8.8,14.6 6,8.8 11,8.8"
            fill="var(--hero3d-cursor-fill)" stroke="var(--hero3d-cursor-stroke)" strokeWidth="0.8" strokeLinejoin="round"
          />
        </g>
        <g transform="translate(6,6)">
          <rect x="0" y="0" width="50" height="14" rx="3.5" fill="var(--hero3d-cursor-chip-bg)" />
          <text
            x="25" y="9.8" textAnchor="middle"
            fontSize="7.5" fill="var(--hero3d-cursor-chip-text)" fontWeight="700"
            fontFamily="'JetBrains Mono',monospace"
          >
            AI Builder
          </text>
        </g>
      </g>
    </g>
  );
};

/* ─────────────────────────────────────────────
   DIAGRAM SVG
───────────────────────────────────────────── */
interface DiagramSVGProps {
  seq: number;
}

const DiagramSVG = ({ seq }: DiagramSVGProps) => (
  <svg
    viewBox={`0 0 ${VW} ${VH}`}
    preserveAspectRatio="xMidYMid meet"
    style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
  >
    <defs>
      <pattern id="dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="0.5" cy="0.5" r="0.65" fill="var(--hero3d-diagram-dot)" />
      </pattern>
      <style>{`@keyframes fdot{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}`}</style>
    </defs>
    <rect width={VW} height={VH} fill="var(--hero3d-diagram-bg)" />
    <rect width={VW} height={VH} fill="url(#dotgrid)" />

    {EDGES.map((edge, i) => {
      const from = NODES.find((n) => n.id === edge.from);
      const to   = NODES.find((n) => n.id === edge.to);
      if (!from || !to) return null;
      return (
        <AnimatedEdge
          key={`${edge.id}-${seq}`}
          edge={edge} fromNode={from} toNode={to}
          drawDelay={0.05 + i * 0.1} seq={seq}
        />
      );
    })}

    {NODES.map((node, i) => (
      <AnimatedNode
        key={`${node.id}-${seq}`}
        node={node} appearDelay={0.04 + i * 0.08}
      />
    ))}

    <CursorAnim seq={seq} />
  </svg>
);

/* ─────────────────────────────────────────────
   LEFT SIDEBAR
───────────────────────────────────────────── */
interface ShapeThumbProps {
  children: React.ReactNode;
  label: string;
}

const ShapeThumb = ({ children, label }: ShapeThumbProps) => (
  <div className="flex flex-col items-center gap-0.5 cursor-grab group/s">
    <div
      className="w-full aspect-square flex items-center justify-center rounded border border-[var(--hero3d-shape-border)] bg-[var(--hero3d-shape-bg)] transition-all duration-100 group-hover/s:border-[var(--hero3d-shape-hover-border)]"
    >
      {children}
    </div>
    <span className="text-[6px] text-[var(--hero3d-shape-label)] text-center group-hover/s:text-[var(--hero3d-shape-label-hover)] truncate w-full transition-colors">
      {label}
    </span>
  </div>
);

const SHAPE_GROUPS = [
  {
    title: "General",
    items: [
      { label: "Process",  el: <div className="w-5 h-3 border border-[var(--hero3d-shape-icon-border)]" /> },
      { label: "Decision", el: <div className="w-4 h-4 border border-[var(--hero3d-shape-icon-border)] rotate-45 scale-[0.65]" /> },
      { label: "Terminal", el: <div className="w-5 h-2.5 rounded-full border border-[var(--hero3d-shape-icon-border)]" /> },
      { label: "Data",     el: <div className="w-5 h-3 border border-[var(--hero3d-shape-icon-border)]" style={{ transform: "skewX(-14deg)" }} /> },
      { label: "Cloud",    el: <div className="w-5 h-3 rounded-2xl border border-[var(--hero3d-shape-icon-border)] opacity-80" /> },
      { label: "Note",     el: <div className="w-4 h-4 border border-[var(--hero3d-shape-icon-border)]" style={{ clipPath: "polygon(0 0,72% 0,100% 28%,100% 100%,0 100%)" }} /> },
    ],
  },
  {
    title: "UML",
    items: [
      { label: "Class",     el: <div className="w-full h-full m-1 border border-[var(--hero3d-shape-icon-border)] flex flex-col"><div className="flex-1 border-b border-[var(--hero3d-shape-icon-border)]" /></div> },
      { label: "Interface", el: <div className="w-4 h-4 rounded-full border border-[var(--hero3d-shape-icon-border)]" /> },
      { label: "Package",   el: <div className="w-full h-[88%] mt-auto border border-[var(--hero3d-shape-icon-border)] relative"><div className="absolute -top-[5px] left-0 w-2.5 h-1.5 border border-b-0 border-[var(--hero3d-shape-icon-border)]" /></div> },
    ],
  },
  {
    title: "Network",
    items: [
      { label: "Server",   el: <div className="flex flex-col gap-0.5"><div className="w-5 h-1.5 rounded border border-[var(--hero3d-shape-icon-border)]" /><div className="w-5 h-1.5 rounded border border-[var(--hero3d-shape-icon-border)]" /></div> },
      { label: "Database", el: <div className="flex flex-col items-center"><div className="w-5 h-1.5 rounded-full border border-[var(--hero3d-shape-icon-border)]" /><div className="w-5 h-3 border-l border-r border-b border-[var(--hero3d-shape-icon-border)]" /></div> },
      { label: "Cloud",    el: <div className="w-6 h-3.5 rounded-full border border-[var(--hero3d-shape-icon-border)]" /> },
    ],
  },
];

const LeftSidebar = () => (
  <div className="shrink-0 flex flex-col" style={{ width: 138, background: "var(--hero3d-sidebar-bg)", borderRight: "1px solid var(--hero3d-sidebar-border)" }}>
    <div className="px-2.5 py-1.5 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid var(--hero3d-sidebar-border)" }}>
      <span className="text-[7.5px] font-bold text-[var(--hero3d-sidebar-title)] uppercase tracking-widest">Shapes</span>
      <Plus size={8} className="text-[var(--hero3d-sidebar-title)] hover:text-[var(--hero3d-sidebar-title-hover)] cursor-pointer transition-colors" />
    </div>
    <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-2.5" style={{ scrollbarWidth: "none" }}>
      {SHAPE_GROUPS.map((g) => (
        <div key={g.title}>
          <button className="flex items-center gap-1 text-[7px] font-bold text-[var(--hero3d-sidebar-title)] uppercase tracking-widest mb-1.5 hover:text-[var(--hero3d-sidebar-title-hover)] transition-colors w-full">
            <ChevronDown size={7} />{g.title}
          </button>
          <div className="grid grid-cols-3 gap-1">
            {g.items.map((item) => (
              <ShapeThumb key={item.label} label={item.label}>{item.el}</ShapeThumb>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   RIGHT SIDEBAR
───────────────────────────────────────────── */
const RightSidebar = () => {
  const [tab, setTab] = useState(0);
  const TABS    = ["Style", "Text", "Arrange"];
  const FILLS   = ["white","#f9fafb","#f3f4f6","#e5e7eb","#d1d5db","#9ca3af","#6b7280","#374151","#1f2937","#111827","#eff6ff","#faf5ff"];
  const STROKES = ["#e5e7eb","#d1d5db","#9ca3af","#6b7280","#374151","#111827"];
  const CONNS   = ["Curved","Straight","Elbow","Isometric"];
  const PROPS   = [{ l: "Opacity", v: "100%" },{ l: "Stroke", v: "1px" },{ l: "Radius", v: "4px" }];

  return (
    <div className="shrink-0 flex flex-col" style={{ width: 168, background: "var(--hero3d-sidebar-bg)", borderLeft: "1px solid var(--hero3d-sidebar-border)" }}>
      <div className="flex shrink-0" style={{ borderBottom: "1px solid var(--hero3d-sidebar-border)" }}>
        {TABS.map((t, i) => (
          <button
            key={t} onClick={() => setTab(i)}
            className="flex-1 py-1.5 text-[8.5px] font-bold transition-colors"
            style={{
              color: tab === i ? "var(--hero3d-right-tab-active)" : "var(--hero3d-right-tab-inactive)",
              borderBottom: tab === i ? "2px solid var(--hero3d-right-tab-active)" : "2px solid transparent",
              background: "transparent", marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto flex-1 px-2.5 py-2 space-y-3" style={{ scrollbarWidth: "none" }}>
        <div>
          <div className="text-[7px] text-[var(--hero3d-sidebar-title)] uppercase tracking-widest mb-1.5 font-bold">Fill</div>
          <div className="grid grid-cols-6 gap-0.5">
            {FILLS.map((c) => (
              <div key={c} className="aspect-square rounded-sm cursor-pointer hover:scale-110 transition-transform"
                style={{ background: c, border: "1px solid var(--hero3d-panel-divider)" }} />
            ))}
          </div>
        </div>
        <div style={{ height: 1, background: "var(--hero3d-panel-divider)" }} />
        <div>
          <div className="text-[7px] text-[var(--hero3d-sidebar-title)] uppercase tracking-widest mb-1.5 font-bold">Stroke</div>
          <div className="grid grid-cols-6 gap-0.5">
            {STROKES.map((c) => (
              <div key={c} className="aspect-square rounded-sm cursor-pointer hover:scale-110 transition-transform"
                style={{ border: `2px solid ${c}`, background: "transparent" }} />
            ))}
          </div>
        </div>
        <div style={{ height: 1, background: "var(--hero3d-panel-divider)" }} />
        <div>
          <div className="text-[7px] text-[var(--hero3d-sidebar-title)] uppercase tracking-widest mb-1.5 font-bold">Connection</div>
          {CONNS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-[var(--hero3d-conn-item-hover)] transition-colors mb-0.5">
              <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: i === 0 ? "var(--hero3d-conn-active)" : "var(--hero3d-conn-inactive)" }} />
              <span className="text-[8.5px] text-[var(--hero3d-prop-key)]">{s}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "var(--hero3d-panel-divider)" }} />
        <div>
          <div className="text-[7px] text-[var(--hero3d-sidebar-title)] uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
            <Sliders size={7} /> Properties
          </div>
          {PROPS.map((p) => (
            <div key={p.l} className="flex items-center justify-between mb-1.5">
              <span className="text-[8.5px] text-[var(--hero3d-prop-key)]">{p.l}</span>
              <div
                className="text-[8.5px] text-[var(--hero3d-prop-value)] px-1.5 py-0.5 rounded"
                style={{ background: "var(--hero3d-prop-chip-bg)", border: "1px solid var(--hero3d-prop-chip-border)" }}
              >
                {p.v}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "var(--hero3d-panel-divider)" }} />
        <div>
          <div className="text-[7px] text-[var(--hero3d-sidebar-title)] uppercase tracking-widest mb-1.5 font-bold">✦ AI Suggestions</div>
          {["Add Load Balancer","Group Services","Add Message Queue"].map((s) => (
            <button key={s}
              className="w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded text-[7.5px] text-[var(--hero3d-ai-suggest-text)] mb-1 hover:bg-[var(--hero3d-ai-suggest-hover-bg)] hover:text-[var(--hero3d-ai-suggest-hover-text)] transition-colors"
              style={{ border: "1px solid var(--hero3d-ai-suggest-border)" }}
            >
              <Plus size={7} className="text-[var(--hero3d-ai-plus)] shrink-0" />{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   DRAW.IO CHROME
───────────────────────────────────────────── */
interface DrawIOChromeProps {
  seq: number;
  reducedMotion: boolean;
}

const DrawIOChrome = ({ seq, reducedMotion }: DrawIOChromeProps) => {
  const [tool, setTool] = useState("pointer");
  const [zoom, setZoom] = useState(100);
  const TOOLS = [
    { id: "pointer", Icon: MousePointer2, title: "Select (V)" },
    { id: "rect",    Icon: Square,        title: "Rectangle (R)" },
    { id: "circle",  Icon: Circle,        title: "Ellipse (E)" },
    { id: "line",    Icon: Minus,         title: "Connection (X)" },
  ];
  const MENUS = ["File","Edit","View","Arrange","Extras","Help"];

  return (
    <div className="w-full h-full flex flex-col select-none"
      style={{ background: "var(--hero3d-chrome-bg)", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>

      {/* Menu bar */}
      <div className="flex items-center justify-between px-3 shrink-0"
        style={{ height: 26, background: "var(--hero3d-chrome-bg)", borderBottom: "1px solid var(--hero3d-chrome-border)" }}>
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 mr-3 pr-3" style={{ borderRight: "1px solid var(--hero3d-chrome-border)" }}>
            <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
              <span style={{ fontSize: 7, color: "white", fontWeight: 900, lineHeight: 1 }}>Yun</span>
            </div>
            <span className="text-[9.5px] font-black text-[var(--hero3d-chrome-title)] tracking-wide">Canvas</span>
          </div>
          {MENUS.map((m) => (
            <button key={m} className="px-1.5 py-0.5 text-[9px] text-[var(--hero3d-chrome-menu)] hover:bg-[var(--hero3d-hover-bg)] rounded transition-colors">{m}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--hero3d-status-dot)" }} />
            <span className="text-[8px] text-[var(--hero3d-status-text)]">Unsaved</span>
          </div>
          <button
            className="px-2 py-0.5 text-[8px] text-[var(--hero3d-action-text)] hover:text-[var(--hero3d-action-hover)] flex items-center gap-1 rounded transition-colors"
            style={{ border: "1px solid var(--hero3d-action-border)", background: "var(--hero3d-action-bg)" }}
          >
            <Share2 size={7} /> Share
          </button>
          <button
            className="px-2 py-0.5 text-[8px] text-[var(--hero3d-export-text)] flex items-center gap-1 rounded transition-colors"
            style={{ border: "1px solid var(--hero3d-export-border)", background: "var(--hero3d-export-bg)" }}
          >
            <Download size={7} /> Export
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 shrink-0"
        style={{ height: 30, background: "var(--hero3d-chrome-bg)", borderBottom: "1px solid var(--hero3d-chrome-border)" }}>
        <div className="flex items-center gap-0.5 px-0.5 py-0.5 rounded mr-1"
          style={{ background: "var(--hero3d-toolbox-bg)", border: "1px solid var(--hero3d-chrome-border)" }}>
          {TOOLS.map(({ id, Icon: I, title }) => (
            <button key={id} title={title} onClick={() => setTool(id)}
              className="w-6 h-6 flex items-center justify-center rounded transition-all duration-100"
              style={{
                background: tool === id ? "var(--hero3d-tool-active-bg)" : "transparent",
                color: tool === id ? "var(--hero3d-tool-active-text)" : "var(--hero3d-tool-idle-text)",
              }}
            >
              <I size={11} />
            </button>
          ))}
        </div>
        <div className="w-px h-3.5 mx-0.5" style={{ background: "var(--hero3d-chrome-border)" }} />
        <button onClick={() => setZoom((z) => Math.max(25, z - 25))}
          className="w-6 h-6 flex items-center justify-center text-[var(--hero3d-toolbar-icon)] hover:text-[var(--hero3d-toolbar-icon-hover)] hover:bg-[var(--hero3d-hover-bg)] rounded transition-colors">
          <ZoomOut size={10} />
        </button>
        <span className="text-[8.5px] font-bold text-[var(--hero3d-toolbar-icon)] w-8 text-center" style={{ fontVariantNumeric: "tabular-nums" }}>
          {zoom}%
        </span>
        <button onClick={() => setZoom((z) => Math.min(400, z + 25))}
          className="w-6 h-6 flex items-center justify-center text-[var(--hero3d-toolbar-icon)] hover:text-[var(--hero3d-toolbar-icon-hover)] hover:bg-[var(--hero3d-hover-bg)] rounded transition-colors">
          <ZoomIn size={10} />
        </button>
        <button className="w-6 h-6 flex items-center justify-center text-[var(--hero3d-toolbar-icon)] hover:text-[var(--hero3d-toolbar-icon-hover)] hover:bg-[var(--hero3d-hover-bg)] rounded transition-colors"><Maximize2 size={10} /></button>
        <button className="w-6 h-6 flex items-center justify-center text-[var(--hero3d-toolbar-icon)] hover:text-[var(--hero3d-toolbar-icon-hover)] hover:bg-[var(--hero3d-hover-bg)] rounded transition-colors"><RotateCcw size={10} /></button>
        <div className="w-px h-3.5 mx-0.5" style={{ background: "var(--hero3d-chrome-border)" }} />
        <motion.button
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold text-white"
          style={{ background: "linear-gradient(90deg,#2563eb,#0ea5e9)" }}
          animate={
            reducedMotion
              ? undefined
              : {
                  boxShadow: [
                    "0 0 0px rgba(14,165,233,0)",
                    "0 0 10px rgba(14,165,233,0.45)",
                    "0 0 0px rgba(14,165,233,0)",
                  ],
                }
          }
          transition={
            reducedMotion ? undefined : { duration: 2.8, repeat: Infinity }
          }
        >
          <Sparkles size={8} /> AI Generate
        </motion.button>
        <div className="flex-1" />
        <div
          className="flex items-center gap-1.5 px-2 h-5 rounded text-[8px] text-[var(--hero3d-search-text)]"
          style={{ background: "var(--hero3d-search-bg)", border: "1px solid var(--hero3d-search-border)", minWidth: 96 }}
        >
          <Search size={8} /><span>Search shapes…</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 relative flex flex-col overflow-hidden" style={{ background: "var(--hero3d-canvas-bg)" }}>
          <div className="flex-1 overflow-hidden">
            <DiagramSVG seq={seq} />
          </div>
          <div className="flex items-center justify-between px-3 shrink-0"
            style={{ height: 17, background: "var(--hero3d-chrome-bg)", borderTop: "1px solid var(--hero3d-chrome-border)" }}>
            <span className="text-[7px] text-[var(--hero3d-status-text)] font-mono">7 nodes · 7 connections · system-architecture.drawio</span>
            <div className="flex items-center gap-3">
              <span className="text-[7px] text-[var(--hero3d-status-text)] font-mono">x: 0  y: 0</span>
              <motion.span
                className="text-[7px] font-bold font-mono text-[var(--hero3d-status-live)]"
                animate={reducedMotion ? undefined : { opacity: [1, 0.35, 1] }}
                transition={
                  reducedMotion ? undefined : { duration: 2.2, repeat: Infinity }
                }
              >● Live Collab</motion.span>
            </div>
          </div>
        </div>
        <RightSidebar />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   3-D CARD
───────────────────────────────────────────── */
interface Card3DProps {
  reducedMotion: boolean;
}

const Card3D = ({ reducedMotion }: Card3DProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setSeq((s) => s + 1), 13000);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const { currentTarget, clientX, clientY } = event;
    const r = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - r.left - r.width / 2);
    mouseY.set(clientY - r.top - r.height / 2);
  }, [mouseX, mouseY, reducedMotion]);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), { stiffness: 100, damping: 28 });
  const rotateY = useSpring(useTransform(mouseX, [-600, 600], [-3, 3]), { stiffness: 100, damping: 28 });

  return (
    <motion.div
      style={
        reducedMotion
          ? { transformStyle: "preserve-3d" }
          : { rotateX, rotateY, transformStyle: "preserve-3d" }
      }
      onMouseMove={reducedMotion ? undefined : handleMouseMove}
      onMouseLeave={
        reducedMotion
          ? undefined
          : () => {
              mouseX.set(0);
              mouseY.set(0);
            }
      }
      className="relative w-full"
    >
      {/* Subtle bottom shadow */}
      <div className="absolute -bottom-6 inset-x-8 h-8 pointer-events-none rounded-full"
        style={{ background: "var(--hero3d-card-floor)", filter: "blur(20px)" }} />

      <div className="relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          border: "1px solid var(--hero3d-card-border)",
          boxShadow: "var(--hero3d-card-shadow)",
        }}
      >
        <DrawIOChrome seq={seq} reducedMotion={reducedMotion} />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   HERO — full white / light theme
───────────────────────────────────────────── */
export const Hero3D = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  const scale   = useTransform(scrollYProgress, [0, 0.5], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);
  const yShift  = useTransform(scrollYProgress, [0, 0.5], [0, -30]);
  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);
  const themeVars = HERO3D_THEME_VARS[isDark ? "dark" : "light"];
  const sectionMotionStyle = prefersReducedMotion
    ? { ...(themeVars as React.CSSProperties), background: "var(--hero3d-section-bg)" }
    : {
        ...(themeVars as React.CSSProperties),
        scale,
        opacity,
        y: yShift,
        background: "var(--hero3d-section-bg)",
      };

  return (
    <motion.section
      ref={sectionRef}
      style={sectionMotionStyle}
      className="relative min-h-[90vh] flex flex-col items-center justify-start pt-16 lg:pt-20 overflow-hidden"
    >
      {/* ── Background: clean white with barely-visible grid + soft blobs ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Very subtle dot grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, var(--hero3d-grid-dot) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: "var(--hero3d-grid-opacity)",
          }}
        />
        {/* Soft blue blob top-left */}
        <motion.div className="absolute rounded-full"
          style={{
            top: -160, left: "-5%",
            width: 500, height: 500,
            background: "var(--hero3d-blob-blue)",
            filter: "blur(60px)",
          }}
          animate={
            prefersReducedMotion ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 14, repeat: Infinity, ease: "easeInOut" }
          }
        />
        {/* Soft purple blob top-right */}
        <motion.div className="absolute rounded-full"
          style={{
            top: -120, right: "-5%",
            width: 420, height: 420,
            background: "var(--hero3d-blob-purple)",
            filter: "blur(60px)",
          }}
          animate={
            prefersReducedMotion ? undefined : { x: [0, -24, 0], y: [0, 20, 0] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }
        />
        {/* Faint pink blob bottom-center */}
        <motion.div className="absolute rounded-full"
          style={{
            bottom: 40, left: "35%",
            width: 320, height: 320,
            background: "var(--hero3d-blob-pink)",
            filter: "blur(60px)",
          }}
          animate={
            prefersReducedMotion ? undefined : { x: [0, 18, 0], y: [0, -14, 0] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 13, repeat: Infinity, ease: "easeInOut", delay: 4 }
          }
        />
      </div>

      {/* ── Hero copy ── */}
      <div className="relative z-10 text-center px-4 md:px-6 w-full max-w-5xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6"
          style={{
            background: "var(--hero3d-badge-bg)",
            border: "1px solid var(--hero3d-badge-border)",
            color: "var(--hero3d-badge-text)",
          }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--hero3d-badge-dot)" }}
            animate={prefersReducedMotion ? undefined : { opacity: [1, 0.3, 1] }}
            transition={
              prefersReducedMotion ? undefined : { duration: 1.8, repeat: Infinity }
            }
          />
          <span className="text-[10px] font-semibold tracking-[0.06em]">
            企业级协作引擎，服务 50,000+ 团队
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-black tracking-tight mb-5"
          style={{
            fontSize: "clamp(2.5rem, 5.8vw, 4rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.04em",
            fontFamily: "'Sora','Outfit',sans-serif",
            color: "var(--hero3d-title-color)",
          }}
        >
          企业级
          <span style={{
            background: "var(--hero3d-title-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            padding: "0 0.15em",
          }}>
            AI 图表
          </span>
          <br />
          决策协作平台
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="text-base md:text-lg mb-9 max-w-lg mx-auto leading-relaxed"
          style={{ color: "var(--hero3d-subtitle)" }}
        >
          用自然语言生成架构图、流程图与 ER 图，团队可在同一画布实时协作并直接沉淀为可执行方案。
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-14"
        >
          <button
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl font-bold text-sm active:scale-95 transition-transform text-white"
            style={{
              background: "var(--hero3d-primary-btn-bg)",
              boxShadow: "var(--hero3d-primary-btn-shadow)",
              fontFamily: "'Sora',sans-serif",
            }}
          >
            免费开始使用 <ArrowRight size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            style={{
              background: "var(--hero3d-secondary-btn-bg)",
              color: "var(--hero3d-secondary-btn-text)",
              border: "1px solid var(--hero3d-secondary-btn-border)",
              boxShadow: "var(--hero3d-secondary-btn-shadow)",
              fontFamily: "'Sora',sans-serif",
            }}
          >
            预约企业演示
          </button>
        </motion.div>

        {/* Trust metrics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {HERO_TRUST_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border px-4 py-3 text-center backdrop-blur-sm"
              style={{
                borderColor: "var(--hero3d-secondary-btn-border)",
                background: "color-mix(in srgb, var(--hero3d-secondary-btn-bg) 88%, transparent)",
              }}
            >
              <div className="text-base font-extrabold tracking-tight" style={{ color: "var(--hero3d-title-color)" }}>
                {metric.value}
              </div>
              <div className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--hero3d-subtitle)" }}>
                {metric.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── 3-D Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl px-4 pb-20"
        style={{ perspective: "1400px" }}
      >
        <Card3D reducedMotion={prefersReducedMotion} />
      </motion.div>

      {/* Bottom fade — fades to white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
        style={{ background: "var(--hero3d-bottom-fade)" }}
      />
    </motion.section>
  );
};

export default Hero3D;
