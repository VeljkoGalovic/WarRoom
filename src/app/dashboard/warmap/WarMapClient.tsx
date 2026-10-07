"use client";

import * as React from "react";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/hud/TacticalCard";
import { StatusBadge } from "@/components/hud/StatusBadge";
import { TacticalButton } from "@/components/hud/TacticalButton";
import {
  Target,
  Flag,
  CheckCircle,
  Circle,
  Zap,
  Shield,
  Cpu,
  Radio,
  Sparkles,
  Map,
  Layers,
  Minus,
  Plus,
  MousePointer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Home,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { GoalStatus, ThreatLevel } from "@prisma/client";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  strategy: string | null;
  status: GoalStatus;
  threatLevel: ThreatLevel;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  agentId: string | null;
  milestones: Milestone[];
  agent?: Agent | null;
}

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  date: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  goalId: string;
}

interface Agent {
  id: string;
  name: string;
  rank: string;
  role: string;
  systemPrompt: string;
  modelEndpoint: string;
  avatarIcon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface WarMapNode {
  id: string;
  goal: Goal;
  x: number;
  y: number;
  connections: string[];
}

const threatLevelColors: Record<ThreatLevel, { node: string; border: string; glow: string }> = {
  CRITICAL: { node: "bg-destructive/20", border: "border-destructive", glow: "shadow-[0_0_15px_rgba(239,68,68,0.5)]" },
  HIGH: { node: "bg-primary/20", border: "border-primary", glow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]" },
  MEDIUM: { node: "bg-secondary/20", border: "border-secondary", glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]" },
  LOW: { node: "bg-foreground-muted/20", border: "border-foreground-muted", glow: "" },
};

const statusColors: Record<GoalStatus, { fill: string; pulse: boolean }> = {
  ACTIVE: { fill: "bg-secondary/30", pulse: true },
  COMPLETED: { fill: "bg-secondary", pulse: false },
  ARCHIVED: { fill: "bg-foreground-muted/30", pulse: false },
};

const rankIcons: Record<string, React.ReactNode> = {
  GENERAL: <Zap className="h-3 w-3" />,
  CAPTAIN: <Shield className="h-3 w-3" />,
  SPECIALIST: <Cpu className="h-3 w-3" />,
  LIEUTENANT: <Radio className="h-3 w-3" />,
  SERGEANT: <Sparkles className="h-3 w-3" />,
};

function WarMapNodeComponent({
  node,
  isSelected,
  onClick,
  zoom,
  panX,
  panY,
}: {
  node: WarMapNode;
  isSelected: boolean;
  onClick: () => void;
  zoom: number;
  panX: number;
  panY: number;
}) {
  const progress = node.goal.milestones.length > 0
    ? Math.round((node.goal.milestones.filter(m => m.isCompleted).length / node.goal.milestones.length) * 100)
    : 0;

  const colors = threatLevelColors[node.goal.threatLevel];
  const status = statusColors[node.goal.status];

  const screenX = (node.x * zoom) + panX;
  const screenY = (node.y * zoom) + panY;

  const nodeSize = Math.max(60, 120 * zoom);

  return (
    <div
      className={cn(
        "absolute transition-all duration-200 cursor-pointer select-none",
        "flex flex-col items-center gap-1",
      )}
      style={{
        left: screenX - nodeSize / 2,
        top: screenY - nodeSize / 2,
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
      }}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2",
          "transition-all duration-300",
          colors.node, colors.border, colors.glow,
          status.fill,
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          isSelected && "scale-110",
        )}
        style={{
          width: nodeSize / zoom,
          height: nodeSize / zoom,
          minWidth: nodeSize / zoom,
          minHeight: nodeSize / zoom,
        }}
      >
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-xs font-mono">
          {node.goal.agent && rankIcons[node.goal.agent.rank]}
        </div>

        <div className="flex items-center justify-center p-2">
          <span className="text-tactical text-xs text-center whitespace-nowrap px-2">
            {node.goal.title.split(" ").slice(0, 2).join(" ")}
          </span>
        </div>

        <div className={cn(
          "w-full h-1.5 mt-1 rounded-full overflow-hidden bg-background",
          status.pulse && "animate-pulse-slow"
        )}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              node.goal.status === "COMPLETED" ? "bg-secondary" : "bg-primary"
            )}
            style={{ width: progress + "%" }}
          />
        </div>

        {isSelected && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-tactical text-xs text-primary-glow bg-background/90 px-1.5 py-0.5 rounded border border-primary/30">
            {progress}% COMPLETE
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-card border border-card-border rounded-lg p-3 text-timestamp text-sm z-10 animate-slide-down">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-tactical text-primary">{node.goal.title}</span>
            {node.goal.agent && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 rounded text-primary text-[0.55rem]">
                {rankIcons[node.goal.agent.rank]}
                {node.goal.agent.rank}
              </span>
            )}
          </div>
          <div className="space-y-1 text-foreground-muted">
            <div className="flex justify-between">
              <span>MILESTONES:</span>
              <span>{node.goal.milestones.filter(m => m.isCompleted).length}/{node.goal.milestones.length}</span>
            </div>
            <div className="flex justify-between">
              <span>THREAT:</span>
              <span className="text-primary">{node.goal.threatLevel}</span>
            </div>
            <div className="flex justify-between">
              <span>STATUS:</span>
              <span className="text-secondary capitalize">{node.goal.status.toLowerCase()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WarMapConnections({ nodes, selectedNodeId, zoom, panX, panY }: {
  nodes: WarMapNode[];
  selectedNodeId: string | null;
  zoom: number;
  panX: number;
  panY: number;
}) {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
      {nodes.flatMap(node =>
        node.connections
          .filter(targetId => node.id < targetId)
          .map(targetId => {
            const target = nodes.find(n => n.id === targetId);
            if (!target) return null;

            const x1 = (node.x * zoom) + panX;
            const y1 = (node.y * zoom) + panY;
            const x2 = (target.x * zoom) + panX;
            const y2 = (target.y * zoom) + panY;

            const isSelected = selectedNodeId === node.id || selectedNodeId === targetId;

            return (
              <line
                key={`${node.id}-${target.id}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isSelected ? "var(--primary)" : "var(--hud-border)"}
                strokeWidth={isSelected ? 2 / zoom : 1 / zoom}
                strokeDasharray="8 4"
                className="transition-colors"
                style={{ filter: isSelected ? "drop-shadow(0 0 4px var(--primary))" : "none" }}
              />
            );
          })
      )}
    </svg>
  );
}

function WarMapControls({
  zoom,
  setZoom,
  panX,
  setPanX,
  panY,
  setPanY,
  onReset,
  onFit,
}: {
  zoom: number;
  setZoom: (z: number) => void;
  panX: number;
  setPanX: (x: number) => void;
  panY: number;
  setPanY: (y: number) => void;
  onReset: () => void;
  onFit: () => void;
}) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
      <TacticalCard variant="default" className="p-2 space-y-1">
        <TacticalButton
          variant="ghost"
          size="icon"
          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </TacticalButton>
        <TacticalButton
          variant="ghost"
          size="icon"
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </TacticalButton>
        <div className="px-2 text-center text-tactical text-xs text-primary">
          {Math.round(zoom * 100)}%
        </div>
        <TacticalButton
          variant="ghost"
          size="icon"
          onClick={onReset}
          aria-label="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </TacticalButton>
        <TacticalButton
          variant="ghost"
          size="icon"
          onClick={onFit}
          aria-label="Fit to view"
        >
          <Home className="h-4 w-4" />
        </TacticalButton>
      </TacticalCard>

      <TacticalCard variant="default" className="p-2">
        <div className="flex items-center gap-2 text-tactical text-xs">
          <MousePointer className="h-3 w-3 text-foreground-muted" />
          <span>DRAG TO PAN • SCROLL TO ZOOM</span>
        </div>
      </TacticalCard>
    </div>
  );
}

function Legend() {
  return (
    <div className="absolute top-4 right-4 z-10">
      <TacticalCard variant="default" className="p-3 w-56">
        <div className="text-tactical text-primary mb-3 flex items-center gap-2">
          <Map className="h-4 w-4" />
          TACTICAL LEGEND
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-destructive bg-destructive/20" />
            <span className="text-foreground-muted">CRITICAL THREAT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-primary bg-primary/20" />
            <span className="text-foreground-muted">HIGH THREAT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-secondary bg-secondary/20" />
            <span className="text-foreground-muted">MEDIUM THREAT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-foreground-muted bg-foreground-muted/20" />
            <span className="text-foreground-muted">LOW THREAT</span>
          </div>
          <div className="border-t border-card-border pt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary/30 border border-secondary animate-pulse-slow" />
              <span className="text-foreground-muted">ACTIVE CAMPAIGN</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary border border-secondary" />
              <span className="text-foreground-muted">CONQUERED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-foreground-muted/30 border border-foreground-muted" />
              <span className="text-foreground-muted">ARCHIVED</span>
            </div>
          </div>
        </div>
      </TacticalCard>
    </div>
  );
}

export function WarMapClient() {
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [panX, setPanX] = React.useState(400);
  const [panY, setPanY] = React.useState(300);
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  // Generate node positions in a tactical grid layout
  const nodes: WarMapNode[] = React.useMemo(() => {
    const activeGoals = goals.filter(g => g.status === "ACTIVE");
    const completedGoals = goals.filter(g => g.status === "COMPLETED");
    const archivedGoals = goals.filter(g => g.status === "ARCHIVED");

    const allGoals = [...activeGoals, ...completedGoals, ...archivedGoals];

    return allGoals.map((goal, index) => {
      // Create a grid-like layout with some organic variation
      const col = index % 4;
      const row = Math.floor(index / 4);
      const baseX = 150 + col * 220;
      const baseY = 150 + row * 200;

      // Add some organic variation
      const variationX = (Math.sin(goal.id.charCodeAt(0) * 0.1) * 40);
      const variationY = (Math.cos(goal.id.charCodeAt(0) * 0.1) * 30);

      // Create connections to nearby nodes (simulating campaign relationships)
      const connections = allGoals
        .filter((_, i) => i !== index)
        .slice(0, 2)
        .map(g => g.id);

      return {
        id: goal.id,
        goal,
        x: baseX + variationX,
        y: baseY + variationY,
        connections,
      };
    });
  }, [goals]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(2, zoom * zoomFactor));

    // Zoom towards mouse position
    setPanX(mouseX - (mouseX - panX) * (newZoom / zoom));
    setPanY(mouseY - (mouseY - panY) * (newZoom / zoom));
    setZoom(newZoom);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.target === mapRef.current || (e.target as HTMLElement).classList.contains("war-map-canvas")) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      e.preventDefault();
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning) {
      setPanX(e.clientX - panStart.x);
      setPanY(e.clientY - panStart.y);
    }
  }

  function handleMouseUp() {
    setIsPanning(false);
  }

  function handleNodeClick(nodeId: string) {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
  }

  function handleReset() {
    setZoom(1);
    setPanX(400);
    setPanY(300);
    setSelectedNode(null);
  }

  function handleFit() {
    if (nodes.length === 0) return;

    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));

    const width = maxX - minX + 200;
    const height = maxY - minY + 200;

    const containerWidth = mapRef.current?.clientWidth || 800;
    const containerHeight = mapRef.current?.clientHeight || 600;

    const newZoom = Math.min(0.25, Math.min(containerWidth / width, containerHeight / height, 1.5));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPanX(containerWidth / 2 - centerX * newZoom);
    setPanY(containerHeight / 2 - centerY * newZoom);
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <TacticalCard variant="default" withReticle className="w-full max-w-4xl h-full">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Map className="h-16 w-16 mx-auto text-foreground-muted mb-4 animate-pulse" />
              <p className="text-tactical text-primary mb-2">LOADING WAR MAP...</p>
              <p className="text-foreground-muted">Initializing tactical visualization</p>
            </div>
          </div>
        </TacticalCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <TacticalCard variant="default" withReticle>
          <div className="text-center py-12">
            <p className="text-destructive-glow text-tactical mb-2">[ERROR]</p>
            <p className="text-foreground-muted">{error}</p>
          </div>
        </TacticalCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-tactical-xl text-primary">WAR MAP</h1>
          <p className="text-timestamp text-foreground-muted mt-1">CAMPAIGN VISUALIZER • TACTICAL OVERVIEW</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-tactical badge-tactical-active">
            {goals.filter(g => g.status === "ACTIVE").length} ACTIVE FRONTS
          </span>
          <span className="badge-tactical badge-tactical-complete">
            {goals.filter(g => g.status === "COMPLETED").length} CONQUERED
          </span>
        </div>
      </div>

      {/* War Map Canvas */}
      <div className="relative h-[calc(100%-100px)] rounded-lg border border-card-border overflow-hidden bg-background">
        <div
          ref={mapRef}
          className="war-map-canvas absolute inset-0"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={e => e.preventDefault()}
        >
          {/* Grid Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(var(--hud-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--hud-border) 1px, transparent 1px)
            `,
            backgroundSize: `${100 * zoom}px ${100 * zoom}px`,
            transform: `translate(${panX % (100 * zoom)}px, ${panY % (100 * zoom)}px)`,
            opacity: 0.3,
          }} />

          {/* Connections */}
          <WarMapConnections
            nodes={nodes}
            selectedNodeId={selectedNode}
            zoom={zoom}
            panX={panX}
            panY={panY}
          />

          {/* Nodes */}
          {nodes.map(node => (
            <WarMapNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onClick={() => handleNodeClick(node.id)}
              zoom={zoom}
              panX={panX}
              panY={panY}
            />
          ))}
        </div>

        {/* Controls */}
        <WarMapControls
          zoom={zoom}
          setZoom={setZoom}
          panX={panX}
          setPanX={setPanX}
          panY={panY}
          setPanY={setPanY}
          onReset={handleReset}
          onFit={handleFit}
        />

        {/* Legend */}
        <Legend />
      </div>
    </div>
  );
}