"use client";

import * as React from "react";

// ============================================================================
// ROUTE-SCOPED CSS VARIABLES - Design spec palette
// ============================================================================

const WARMAP_STYLES = {
  // Palette (five colors - hard limit)
  "--wm-void": "#050810",
  "--wm-holo-cyan": "#4DD8E8",
  "--wm-progress-amber": "#FFB347",
  "--wm-conquest-green": "#3FE0A0",
  "--wm-threat-red": "#FF4D5E",

  // Derived shades via opacity
  "--wm-holo-cyan-dim": "rgba(77, 216, 232, 0.3)",
  "--wm-holo-cyan-subtle": "rgba(77, 216, 232, 0.1)",
  "--wm-progress-amber-dim": "rgba(255, 179, 71, 0.3)",
  "--wm-progress-amber-subtle": "rgba(255, 179, 71, 0.1)",
  "--wm-conquest-green-dim": "rgba(63, 224, 160, 0.3)",
  "--wm-conquest-green-subtle": "rgba(63, 224, 160, 0.1)",
  "--wm-threat-red-dim": "rgba(255, 77, 94, 0.3)",
  "--wm-threat-red-subtle": "rgba(255, 77, 94, 0.1)",

  // Fonts
  "--wm-font-display": "'Rajdhani', 'Orbitron', 'Chakra Petch', 'Share Tech Mono', monospace",
  "--wm-font-mono": "'JetBrains Mono', 'IBM Plex Mono', 'Geist Mono', monospace",
} as const;

// ============================================================================
// TYPES
// ============================================================================

type NodeState = "neutral" | "active" | "conquered" | "at-risk" | "command";

interface WarMapNode {
  id: string;
  name: string;
  state: NodeState;
  x: number;
  y: number;
  progress?: number;
  connections: string[];
}

interface FakeLogEntry {
  time: string;
  event: string;
  detail: string;
}

// ============================================================================
// FAKE DATA
// ============================================================================

const FAKE_NODES: WarMapNode[] = [
  {
    id: "command",
    name: "COMMAND CENTER",
    state: "command",
    x: 0,
    y: 0,
    connections: ["goal-1", "goal-2", "goal-3", "goal-4", "goal-5", "goal-6", "goal-7"],
  },
  {
    id: "goal-1",
    name: "TACTICAL PHYSICAL",
    state: "conquered",
    x: -280,
    y: -180,
    progress: 100,
    connections: ["command", "goal-2"],
  },
  {
    id: "goal-2",
    name: "DEPLOY WAR",
    state: "active",
    x: 180,
    y: -250,
    progress: 67,
    connections: ["command", "goal-1", "goal-3"],
  },
  {
    id: "goal-3",
    name: "REACH CODEFORCES",
    state: "at-risk",
    x: 320,
    y: 80,
    progress: 23,
    connections: ["command", "goal-2", "goal-4"],
  },
  {
    id: "goal-4",
    name: "MASTER SYSTEMS",
    state: "neutral",
    x: 80,
    y: 280,
    progress: 45,
    connections: ["command", "goal-3", "goal-5"],
  },
  {
    id: "goal-5",
    name: "INTERNATIONAL MATH",
    state: "neutral",
    x: -220,
    y: 200,
    progress: 12,
    connections: ["command", "goal-4", "goal-6"],
  },
  {
    id: "goal-6",
    name: "SECURE COMMS",
    state: "neutral",
    x: -300,
    y: 20,
    progress: 0,
    connections: ["command", "goal-5", "goal-7"],
  },
  {
    id: "goal-7",
    name: "ESTABLISH FOOTHOLD",
    state: "neutral",
    x: -120,
    y: -150,
    progress: 0,
    connections: ["command", "goal-6"],
  },
];

const FOG_POSITIONS = [
  { x: 400, y: -100 },
  { x: -400, y: -250 },
  { x: 150, y: -350 },
];

const FAKE_LOG_ENTRIES: FakeLogEntry[] = [
  { time: "14:22", event: "MILESTONE SECURED", detail: "TACTICAL PHYSICAL — 5K TIME" },
  { time: "14:18", event: "HYPERLANE ESTABLISHED", detail: "GOAL-2 → GOAL-3 LINK ACTIVE" },
  { time: "14:15", event: "CONTACT LOST", detail: "REACH CODEFORCES — SIGNAL DEGRADED" },
  { time: "14:10", event: "SECTOR SCAN COMPLETE", detail: "FOG SECTOR 7 — UNKNOWN SIGNATURES" },
  { time: "14:05", event: "RESOURCE ALLOCATED", detail: "DEPLOY WAR — +15% MOMENTUM" },
  { time: "13:58", event: "THREAT DETECTED", detail: "SECTOR 3 — HOSTILE ACTIVITY" },
  { time: "13:52", event: "LINK ESTABLISHED", detail: "COMMAND ↔ SECURE COMMS" },
  { time: "13:47", event: "INTEL UPDATE", detail: "MASTER SYSTEMS — TARGET ACQUIRED" },
];

const MILESTONES = [
  { title: "INITIAL RECON", completed: true },
  { title: "ASSET DEPLOYMENT", completed: true },
  { title: "PERIMETER ESTABLISHED", completed: true },
  { title: "INTEL GATHERING", completed: false },
  { title: "TARGET NEUTRALIZATION", completed: false },
  { title: "SECTOR SECURED", completed: false },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNodeColor(state: NodeState): string {
  switch (state) {
    case "command":
      return "var(--wm-holo-cyan)";
    case "conquered":
      return "var(--wm-conquest-green)";
    case "active":
      return "var(--wm-progress-amber)";
    case "at-risk":
      return "var(--wm-threat-red)";
    case "neutral":
    default:
      return "var(--wm-holo-cyan)";
  }
}

function getNodeGlow(state: NodeState): string {
  switch (state) {
    case "command":
      return "0 0 20px var(--wm-holo-cyan), 0 0 40px var(--wm-holo-cyan)";
    case "conquered":
      return "0 0 15px var(--wm-conquest-green), 0 0 30px var(--wm-conquest-green)";
    case "active":
      return "0 0 15px var(--wm-progress-amber), 0 0 30px var(--wm-progress-amber)";
    case "at-risk":
      return "0 0 15px var(--wm-threat-red), 0 0 30px var(--wm-threat-red)";
    case "neutral":
    default:
      return "0 0 10px var(--wm-holo-cyan)";
  }
}

function getNodeSize(state: NodeState): number {
  switch (state) {
    case "command":
      return 100;
    case "conquered":
    case "active":
    case "at-risk":
      return 72;
    case "neutral":
    default:
      return 64;
  }
}

function hexagonPoints(size: number): string {
  const points: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(size * Math.cos(angle), size * Math.sin(angle));
  }
  return points.join(" ");
}

function octagonPoints(size: number): string {
  const points: number[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    points.push(size * Math.cos(angle), size * Math.sin(angle));
  }
  return points.join(" ");
}

// SVG path for curved hyperlane (quadratic bezier)
function getHyperlanePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curveIntensity: number = 0.3
): string {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const perpendicularX = -dy / distance;
  const perpendicularY = dx / distance;
  const curveOffset = distance * curveIntensity;

  const ctrlX = midX + perpendicularX * curveOffset;
  const ctrlY = midY + perpendicularY * curveOffset;

  return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Background: Slowly rotating starfield/spiral galaxy
function GalaxyBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const timeRef = React.useRef(0);
  const animationRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate starfield
    const stars: Array<{ x: number; y: number; size: number; opacity: number; speed: number }> = [];
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.05 + 0.01,
      });
    }

    // Spiral arms
    const spiralArms = 3;
    const spiralPoints = 200;

    function animate() {
      timeRef.current += 0.001;

      // Resize
      if (!canvas) return;
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.12;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw spiral galaxy arms
      for (let arm = 0; arm < spiralArms; arm++) {
        ctx.beginPath();
        const armOffset = (Math.PI * 2 / spiralArms) * arm + timeRef.current * 0.05;

        for (let i = 0; i <= spiralPoints; i++) {
          const t = i / spiralPoints;
          const radius = t * Math.max(canvas.width, canvas.height) * 0.6;
          const angle = armOffset + t * 4 * Math.PI + timeRef.current * 0.02;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const opacity = (1 - t) * 0.15;

          ctx.strokeStyle = `rgba(77, 216, 232, ${opacity})`;
          ctx.lineWidth = 1.5 * (1 - t * 0.5);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
          }
        }
      }

      // Draw stars with slow drift
      stars.forEach((star) => {
        star.y += star.speed;
        star.x += Math.sin(timeRef.current * 0.5 + star.y * 0.01) * 0.02;

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        if (star.x > canvas.width) star.x = 0;
        if (star.x < 0) star.x = canvas.width;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 216, 232, ${star.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundColor: "var(--wm-void)",
      }}
      aria-hidden="true"
    />
  );
}

// Hexagon Node Component
function WarMapNode({
  node,
  isSelected,
  onClick,
  centerX,
  centerY,
  zoom,
}: {
  node: WarMapNode;
  isSelected: boolean;
  onClick: () => void;
  centerX: number;
  centerY: number;
  zoom: number;
}) {
  const size = getNodeSize(node.state);
  const color = getNodeColor(node.state);
  const glow = getNodeGlow(node.state);
  const points = node.state === "command" ? octagonPoints(size) : hexagonPoints(size);
  const screenX = centerX + node.x * zoom;
  const screenY = centerY + node.y * zoom;
  const animationDelay = React.useMemo(
    () => (node.id.charCodeAt(0) % 4) * 0.5,
    [node.id]
  );

  const showProgress = node.state === "active" || node.state === "conquered";
  const progress = node.progress || 0;

  return (
    <g
      transform={`translate(${screenX}, ${screenY}) scale(${1 / zoom})`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {/* Outer glow - always present */}
      <filter id={`glow-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Hexagon/Octagon base */}
      <polygon
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        style={{
          filter: `drop-shadow(${glow})`,
          opacity: node.state === "at-risk" ? 0.8 : 1,
        }}
        className={node.state === "at-risk" ? "at-risk-flicker" : ""}
      />

      {/* Inner fill for conquered/active */}
      {showProgress && (
        <polygon
          points={points}
          fill={color}
          fillOpacity={node.state === "conquered" ? 0.3 : 0.15}
          stroke="none"
        />
      )}

      {/* Progress ring for active/conquered */}
      {showProgress && (
        <>
          <circle
            r={size + 10}
            fill="none"
            stroke="var(--wm-holo-cyan)"
            strokeWidth={1}
            strokeOpacity={0.2}
          />
          <circle
            r={size + 10}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeOpacity={1}
            strokeDasharray={`${(progress / 100) * 2 * Math.PI * (size + 10)} ${2 * Math.PI * (size + 10)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
            className={node.state === "active" ? "progress-pulse" : ""}
          />
        </>
      )}

      {/* Selection ring */}
      {isSelected && (
        <polygon
          points={node.state === "command" ? octagonPoints(size + 14) : hexagonPoints(size + 14)}
          fill="none"
          stroke="var(--wm-holo-cyan)"
          strokeWidth={2}
          strokeDasharray="8 4"
          style={{
            animation: "dash-flow 2s linear infinite",
            filter: "drop-shadow(0 0 8px var(--wm-holo-cyan))",
          }}
        />
      )}

      {/* State tag */}
      {(node.state === "conquered" || node.state === "at-risk") && (
        <text
          x={0}
          y={size + 28}
          textAnchor="middle"
          fill={color}
          fontFamily="var(--wm-font-display)"
          fontSize={10}
          fontWeight={700}
          letterSpacing="0.1em"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        >
          {node.state === "conquered" ? "CONQUERED" : "CONTACT"}
        </text>
      )}

      {/* Node label */}
      <text
        x={0}
        y={-(size + 18)}
        textAnchor="middle"
        fill="var(--wm-holo-cyan)"
        fontFamily="var(--wm-font-display)"
        fontSize={node.state === "command" ? 11 : 9}
        fontWeight={700}
        letterSpacing="0.08em"
        style={{
          filter: "drop-shadow(0 0 4px var(--wm-holo-cyan))",
          textTransform: "uppercase",
        }}
      >
        {node.name}
      </text>
    </g>
  );
}

// Hyperlane connections
function Hyperlanes({
  nodes,
  selectedNodeId,
  centerX,
  centerY,
  zoom,
}: {
  nodes: WarMapNode[];
  selectedNodeId: string | null;
  centerX: number;
  centerY: number;
  zoom: number;
}) {
  const paths = React.useMemo(() => {
    const result: Array<{
      path: string;
      color: string;
      isSelected: boolean;
      progress: number;
    }> = [];

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        if (node.id < targetId) {
          const target = nodeMap.get(targetId);
          if (!target) return;

          const x1 = centerX + node.x * zoom;
          const y1 = centerY + node.y * zoom;
          const x2 = centerX + target.x * zoom;
          const y2 = centerY + target.y * zoom;

          const isSelected = selectedNodeId === node.id || selectedNodeId === targetId;
          const isActive = node.state === "active" || target.state === "active";
          const isConquered = node.state === "conquered" && target.state === "conquered";

          let color = "var(--wm-holo-cyan)";
          let progress = 0;

          if (isActive) color = "var(--wm-progress-amber)";
          if (isConquered) color = "var(--wm-conquest-green)";
          if (node.state === "at-risk" || target.state === "at-risk") color = "var(--wm-threat-red)";

          if (isConquered) progress = 100;
          else if (isActive) progress = 50;

          result.push({
            path: getHyperlanePath(x1, y1, x2, y2),
            color,
            isSelected,
            progress,
          });
        }
      });
    });

    return result;
  }, [nodes, selectedNodeId, centerX, centerY, zoom]);

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }}>
      <defs>
        {paths.map((p, i) => (
          <marker
            key={`arrow-${i}`}
            id={`arrow-${i}`}
            markerWidth={8}
            markerHeight={8}
            refX={6}
            refY={3}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 Z" fill={p.color} />
          </marker>
        ))}
      </defs>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.path}
          fill="none"
          stroke={p.color}
          strokeWidth={p.isSelected ? 3 / zoom : 1.5 / zoom}
          strokeOpacity={p.isSelected ? 1 : 0.6}
          strokeDasharray="12 8"
          //strokeDashoffset={p.dashOffset}
          style={{
            filter: p.isSelected ? `drop-shadow(0 0 6px ${p.color})` : "none",
            animation: p.isSelected || p.color === "var(--wm-progress-amber)" ? "dash-flow 3s linear infinite" : "none",
          }}
          markerEnd={`url(#arrow-${i})`}
        />
      ))}
    </svg>
  );
}

// Fog of War
function FogOfWar({
  centerX,
  centerY,
  zoom,
}: {
  centerX: number;
  centerY: number;
  zoom: number;
}) {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 2 }}>
      {FOG_POSITIONS.map((fog, i) => {
        const screenX = centerX + fog.x * zoom;
        const screenY = centerY + fog.y * zoom;
        const radius = 80 / zoom;

        return (
          <g key={i} transform={`translate(${screenX}, ${screenY})`}>
            {/* Fog circle */}
            <circle
              r={radius}
              fill="var(--wm-void)"
              fillOpacity={0.85}
              stroke="var(--wm-holo-cyan)"
              strokeWidth={1 / zoom}
              strokeOpacity={0.3}
              strokeDasharray="8 6"
              style={{ filter: "drop-shadow(0 0 8px var(--wm-holo-cyan))" }}
            />
            {/* Unknown marker */}
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fill="var(--wm-holo-cyan)"
              fontFamily="var(--wm-font-mono)"
              fontSize={14 / zoom}
              fontWeight={400}
              opacity={0.4}
              style={{ filter: "drop-shadow(0 0 4px var(--wm-holo-cyan))" }}
            >
              ?
            </text>
            <text
              x={0}
              y={radius + 18 / zoom}
              textAnchor="middle"
              fill="var(--wm-holo-cyan)"
              fontFamily="var(--wm-font-display)"
              fontSize={8 / zoom}
              fontWeight={600}
              letterSpacing="0.1em"
              opacity={0.3}
            >
              UNKNOWN SECTOR
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Legend Panel
function Legend() {
  const legendItems = [
    { color: "var(--wm-holo-cyan)", label: "NEUTRAL / COMMAND", description: "Standard objectives" },
    { color: "var(--wm-progress-amber)", label: "IN PROGRESS", description: "Active campaigns" },
    { color: "var(--wm-conquest-green)", label: "CONQUERED", description: "Secured objectives" },
    { color: "var(--wm-threat-red)", label: "AT RISK", description: "Contested / failing" },
    { color: "var(--wm-void)", label: "FOG OF WAR", description: "Unknown sectors", border: "var(--wm-holo-cyan)" },
  ];

  return (
    <div
      className="absolute bottom-4 left-4 z-10"
      style={{
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.65rem",
        color: "var(--wm-holo-cyan)",
        background: "rgba(5, 8, 16, 0.9)",
        border: "1px solid rgba(77, 216, 232, 0.3)",
        padding: "12px 16px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 20px rgba(77, 216, 232, 0.1), inset 0 0 1px rgba(77, 216, 232, 0.2)",
        clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "8px",
          color: "var(--wm-holo-cyan)",
          borderBottom: "1px solid rgba(77, 216, 232, 0.2)",
          paddingBottom: "6px",
        }}
      >
        TACTICAL LEGEND
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {legendItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                border: `1px solid ${item.border || item.color}`,
                background: item.color === "var(--wm-void)" ? "transparent" : item.color,
                opacity: item.color === "var(--wm-void)" ? 0 : 0.2,
                clipPath: item.color === "var(--wm-void)" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined,
                boxShadow: item.color !== "var(--wm-void)" ? `0 0 6px ${item.color}` : "none",
              }}
            />
            <div>
              <div style={{ fontWeight: 700, color: item.color }}>{item.label}</div>
              <div style={{ fontSize: "0.55rem", color: "var(--wm-holo-cyan)", opacity: 0.6 }}>{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top Bar
function TopBar({ activeCount, conqueredCount }: { activeCount: number; conqueredCount: number }) {
  const [time, setTime] = React.useState("--:--:--");

  React.useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.95)",
        borderBottom: "1px solid rgba(77, 216, 232, 0.2)",
        backdropFilter: "blur(8px)",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.65rem",
        color: "var(--wm-holo-cyan)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--wm-holo-cyan)",
          textShadow: "0 0 8px var(--wm-holo-cyan)",
        }}
      >
        CAMPAIGN VISUALIZER — TACTICAL OVERVIEW
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ opacity: 0.6 }}>TIME</span>
          <span style={{ fontFamily: "var(--wm-font-mono)", fontWeight: 600, letterSpacing: "0.1em" }}>{time}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid rgba(77, 216, 232, 0.2)", paddingLeft: "16px" }}>
          <span style={{ opacity: 0.6 }}>ACTIVE FRONTS</span>
          <span style={{ fontFamily: "var(--wm-font-display)", fontWeight: 700, color: "var(--wm-progress-amber)", textShadow: "0 0 8px var(--wm-progress-amber)" }}>{activeCount}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid rgba(77, 216, 232, 0.2)", paddingLeft: "16px" }}>
          <span style={{ opacity: 0.6 }}>CONQUERED</span>
          <span style={{ fontFamily: "var(--wm-font-display)", fontWeight: 700, color: "var(--wm-conquest-green)", textShadow: "0 0 8px var(--wm-conquest-green)" }}>{conqueredCount}</span>
        </div>
      </div>
    </div>
  );
}

// Bottom Bar - Tactical Readout
function BottomBar() {
  const [logIndex, setLogIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % FAKE_LOG_ENTRIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const visibleLogs = FAKE_LOG_ENTRIES.slice(logIndex, logIndex + 6);

  return (
    <div
      style={{
        height: "40px",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.95)",
        borderTop: "1px solid rgba(77, 216, 232, 0.2)",
        backdropFilter: "blur(8px)",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.6rem",
        color: "var(--wm-holo-cyan)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {visibleLogs.map((log, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "12px",
              opacity: 1 - i * 0.12,
              transition: "opacity 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ opacity: 0.5 }}>{log.time}</span>
            <span style={{ color: "var(--wm-progress-amber)", fontWeight: 600 }}>{log.event}</span>
            <span style={{ opacity: 0.7 }}>{log.detail}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          width: "2px",
          height: "60%",
          background: "linear-gradient(180deg, transparent, var(--wm-holo-cyan), transparent)",
          opacity: 0.3,
        }}
      />
    </div>
  );
}

// Detail Panel
function DetailPanel({
  node,
  onClose,
}: {
  node: WarMapNode | null;
  onClose: () => void;
}) {
  if (!node) return null;

  const color = getNodeColor(node.state);
  const progress = node.progress || 0;

  return (
    <div
      className="absolute right-0 top-0 bottom-0 z-20"
      style={{
        width: "360px",
        background: "rgba(5, 8, 16, 0.98)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.3)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        animation: "scanline-wipe 0.4s ease-out forwards",
        clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)",
        boxShadow: "-20px 0 40px rgba(0, 0, 0, 0.5), inset 1px 0 0 var(--wm-holo-cyan)",
      }}
    >
      {/* Corner brackets */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "20px",
          height: "20px",
          borderTop: "1px solid var(--wm-holo-cyan)",
          borderLeft: "1px solid var(--wm-holo-cyan)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "20px",
          height: "20px",
          borderTop: "1px solid var(--wm-holo-cyan)",
          borderRight: "1px solid var(--wm-holo-cyan)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "20px",
          height: "20px",
          borderBottom: "1px solid var(--wm-holo-cyan)",
          borderLeft: "1px solid var(--wm-holo-cyan)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "20px",
          height: "20px",
          borderBottom: "1px solid var(--wm-holo-cyan)",
          borderRight: "1px solid var(--wm-holo-cyan)",
          opacity: 0.5,
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "24px",
          height: "24px",
          background: "transparent",
          border: "1px solid rgba(77, 216, 232, 0.3)",
          color: "var(--wm-holo-cyan)",
          fontFamily: "var(--wm-font-mono)",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--wm-holo-cyan)";
          e.currentTarget.style.boxShadow = "0 0 8px var(--wm-holo-cyan)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.boxShadow = "none";
        }}
        aria-label="Close detail panel"
      >
        ×
      </button>

      {/* Header */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(77, 216, 232, 0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--wm-font-display)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--wm-holo-cyan)",
                opacity: 0.5,
                marginBottom: "4px",
              }}
            >
              OBJECTIVE
            </div>
            <div
              style={{
                fontFamily: "var(--wm-font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: color,
                textShadow: `0 0 8px ${color}`,
              }}
            >
              {node.name}
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--wm-font-display)",
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: color,
              padding: "4px 10px",
              border: `1px solid ${color}`,
              background: `${color}20`,
              clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)",
            }}
          >
            {node.state.toUpperCase().replace("-", " ")}
          </div>
        </div>

        {/* Progress Ring */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--wm-holo-cyan)"
              strokeWidth="3"
              strokeOpacity={0.15}
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={`${(progress / 100) * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${color})`,
                transition: "stroke-dasharray 0.5s ease",
              }}
              className={node.state === "active" ? "progress-pulse" : ""}
            />
            <text x="32" y="36" textAnchor="middle" fill="var(--wm-holo-cyan)" fontFamily="var(--wm-font-display)" fontSize="14" fontWeight={700}>
              {progress}%
            </text>
          </svg>
          <div>
            <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.55rem", color: "var(--wm-holo-cyan)", opacity: 0.5, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              COMPLETION
            </div>
            <div style={{ fontFamily: "var(--wm-font-mono)", fontSize: "0.75rem", color: "var(--wm-holo-cyan)" }}>
              {node.state === "conquered" ? "MISSION COMPLETE" : node.state === "at-risk" ? "CRITICAL — INTERVENTION REQUIRED" : "IN PROGRESS"}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <div
          style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--wm-holo-cyan)",
            opacity: 0.5,
            marginBottom: "12px",
            borderBottom: "1px solid rgba(77, 216, 232, 0.1)",
            paddingBottom: "8px",
          }}
        >
          MILESTONES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {MILESTONES.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                background: m.completed ? "rgba(63, 224, 160, 0.1)" : "transparent",
                border: `1px solid ${m.completed ? "var(--wm-conquest-green)" : "rgba(77, 216, 232, 0.2)"}`,
                clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  border: `1px solid ${m.completed ? "var(--wm-conquest-green)" : "rgba(77, 216, 232, 0.3)"}`,
                  background: m.completed ? "var(--wm-conquest-green)" : "transparent",
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              />
              <div
                style={{
                  fontFamily: "var(--wm-font-mono)",
                  fontSize: "0.7rem",
                  color: m.completed ? "var(--wm-conquest-green)" : "var(--wm-holo-cyan)",
                  opacity: m.completed ? 1 : 0.7,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  flex: 1,
                }}
              >
                {m.title}
              </div>
              {m.completed && (
                <div
                  style={{
                    fontFamily: "var(--wm-font-display)",
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    color: "var(--wm-conquest-green)",
                    letterSpacing: "0.1em",
                  }}
                >
                  SECURED
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Logs */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(77, 216, 232, 0.1)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--wm-font-display)",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--wm-holo-cyan)",
              opacity: 0.5,
              marginBottom: "12px",
            }}
          >
            RECENT ACTIVITY
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {FAKE_LOG_ENTRIES.slice(0, 4).map((log, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "var(--wm-font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--wm-holo-cyan)",
                  opacity: 0.7,
                  display: "flex",
                  gap: "8px",
                }}
              >
                <span style={{ opacity: 0.4 }}>{log.time}</span>
                <span style={{ color: "var(--wm-progress-amber)" }}>{log.event}</span>
                <span>{log.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Comms Placeholder */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "rgba(77, 216, 232, 0.1)",
            border: "1px solid rgba(77, 216, 232, 0.2)",
            clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--wm-font-display)",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--wm-holo-cyan)",
              opacity: 0.5,
              marginBottom: "8px",
            }}
          >
            AGENT COMMS
          </div>
          <div style={{ fontFamily: "var(--wm-font-mono)", fontSize: "0.65rem", color: "var(--wm-holo-cyan)", opacity: 0.6, lineHeight: 1.6 }}>
            [AWAITING AGENT LINK...]<br />
            <span style={{ opacity: 0.4 }}>Phase 4 integration pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WarMapPreviewClient() {
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const panStart = React.useRef({ x: 0, y: 0 });
  const mapRef = React.useRef<HTMLDivElement>(null);

  const activeCount = FAKE_NODES.filter((n) => n.state === "active").length;
  const conqueredCount = FAKE_NODES.filter((n) => n.state === "conquered").length;

  // Center of the map canvas
  const centerX = React.useMemo(() => {
    if (!mapRef.current) return 0;
    return mapRef.current.clientWidth / 2;
  }, [mapRef.current?.clientWidth]);

  const centerY = React.useMemo(() => {
    if (!mapRef.current) return 0;
    return mapRef.current.clientHeight / 2;
  }, [mapRef.current?.clientHeight]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left - pan.x;
    const mouseY = e.clientY - rect.top - pan.y;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.4, Math.min(2.5, zoom * zoomFactor));

    setPan({
      x: (e.clientX - rect.left) - mouseX * (newZoom / zoom),
      y: (e.clientY - rect.top) - mouseY * (newZoom / zoom),
    });
    setZoom(newZoom);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.target === mapRef.current || (e.target as HTMLElement).classList.contains("warmap-canvas")) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      e.preventDefault();
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }
  }

  function handleMouseUp() {
    setIsPanning(false);
  }

  function handleNodeClick(nodeId: string) {
    setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
  }

  function handleCanvasClick() {
    setSelectedNode(null);
  }

  function handleReset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  }

  const selectedNodeData = FAKE_NODES.find((n) => n.id === selectedNode) || null;

  return (
    <div
      style={{
        ...WARMAP_STYLES,
        minHeight: "100vh",
        width: "100%",
        background: "var(--wm-void)",
        color: "var(--wm-holo-cyan)",
        fontFamily: "var(--wm-font-mono)",
        overflow: "hidden",
      }}
    >
      {/* Global style injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes dash-flow {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes progress-pulse {
            0%, 100% { stroke-opacity: 1; filter: drop-shadow(0 0 8px var(--wm-progress-amber)); }
            50% { stroke-opacity: 0.6; filter: drop-shadow(0 0 4px var(--wm-progress-amber)); }
          }
          @keyframes at-risk-flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes scanline-wipe {
            from { clip-path: polygon(12px 0, 12px 0, 12px 100%, 0 100%, 0 12px); opacity: 0; }
            to { clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px); opacity: 1; }
          }
          .progress-pulse { animation: progress-pulse 3s ease-in-out infinite; }
          .at-risk-flicker { animation: at-risk-flicker 0.15s ease-in-out infinite alternate; }
        `,
      }} />

      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* Top Bar */}
      <TopBar activeCount={activeCount} conqueredCount={conqueredCount} />

      {/* Central Map Canvas */}
      <div
        ref={mapRef}
        className="warmap-canvas"
        style={{
          position: "absolute",
          top: "48px",
          bottom: "40px",
          left: 0,
          right: 0,
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(var(--wm-holo-cyan) 0.5px, transparent 0.5px),
              linear-gradient(90deg, var(--wm-holo-cyan) 0.5px, transparent 0.5px)
            `,
            backgroundSize: `${80 * zoom}px ${80 * zoom}px`,
            transform: `translate(${pan.x % (80 * zoom)}px, ${pan.y % (80 * zoom)}px)`,
            opacity: 0.04,
          }}
        />

        {/* Hyperlanes */}
        <Hyperlanes
          nodes={FAKE_NODES}
          selectedNodeId={selectedNode}
          centerX={centerX - pan.x}
          centerY={centerY - pan.y}
          zoom={zoom}
        />

        {/* Fog of War */}
        <FogOfWar
          centerX={centerX - pan.x}
          centerY={centerY - pan.y}
          zoom={zoom}
        />

        {/* Nodes */}
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 10 }}>
          {FAKE_NODES.map((node) => (
            <WarMapNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onClick={() => handleNodeClick(node.id)}
              centerX={centerX - pan.x}
              centerY={centerY - pan.y}
              zoom={zoom}
            />
          ))}
        </svg>

        {/* Legend */}
        <Legend />
      </div>

      {/* Right Detail Panel */}
      <DetailPanel node={selectedNodeData} onClose={() => setSelectedNode(null)} />

      {/* Bottom Bar */}
      <BottomBar />

      {/* Reset button */}
      <button
        onClick={handleReset}
        style={{
          position: "fixed",
          bottom: "60px",
          right: "24px",
          zIndex: 50,
          padding: "8px 14px",
          background: "rgba(5, 8, 16, 0.9)",
          border: "1px solid rgba(77, 216, 232, 0.3)",
          color: "var(--wm-holo-cyan)",
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)",
          transition: "all 0.15s ease",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--wm-holo-cyan)";
          e.currentTarget.style.boxShadow = "0 0 12px var(--wm-holo-cyan)";
          e.currentTarget.style.background = "var(--wm-holo-cyan-subtle)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.background = "rgba(5, 8, 16, 0.9)";
        }}
      >
        RESET VIEW
      </button>
    </div>
  );
}