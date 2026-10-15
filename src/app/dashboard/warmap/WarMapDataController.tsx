"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";
import { WarMapNode } from "./WarMap3DCanvas";

interface WarMapApiGoal {
  id: string;
  name: string;
  state: WarMapNode["state"];
  progress: number;
  threatLevel: string;
  status: string;
  position: [number, number, number];
  agentId: string | null;
  milestoneCount: number;
  completedMilestones: number;
}

interface WarMapApiAgent {
  id: string;
  name: string;
  role: string;
  rank: string;
  avatarIcon: string;
  isActive: boolean;
  position: [number, number, number];
}

interface WarMapApiConnection {
  from: string;
  to: string;
  type: "goal-goal" | "agent-goal";
}

interface WarMapApiResponse {
  goals: WarMapApiGoal[];
  agents: WarMapApiAgent[];
  connections: WarMapApiConnection[];
  stats: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    criticalGoals: number;
    totalAgents: number;
    activeAgents: number;
    averageProgress: number;
    lastUpdated: string;
  };
}

interface ActivityLogApiResponse {
  logs: Array<{
    id: string;
    timestamp: string;
    category: string;
    message: string;
    metadata: unknown;
  }>;
}

const SECTOR_MAP: Record<string, string> = {
  "TACTICAL PHYSICAL": "alpha",
  "DEPLOY WAR": "beta",
  "REACH CODEFORCES": "gamma",
  "MASTER SYSTEMS": "delta",
  "INTERNATIONAL MATH": "epsilon",
  "SECURE COMMS": "zeta",
  "ESTABLISH FOOTHOLD": "eta",
};

function mapSector(name: string): string {
  const upper = name.toUpperCase();
  for (const [key, sector] of Object.entries(SECTOR_MAP)) {
    if (upper.includes(key.toUpperCase())) return sector;
  }
  return "unknown";
}

function transformApiToNodes(apiGoals: WarMapApiGoal[], apiAgents: WarMapApiAgent[], apiConnections: WarMapApiConnection[]): WarMapNode[] {
  const allNodes: WarMapNode[] = [];

  // Transform goals
  for (const goal of apiGoals) {
    const connections = apiConnections
      .filter(c => c.from === goal.id || c.to === goal.id)
      .map(c => c.from === goal.id ? c.to : c.from);

    allNodes.push({
      id: goal.id,
      name: goal.name,
      state: goal.state,
      position: goal.position,
      progress: goal.progress,
      connections,
      sectorId: mapSector(goal.name),
    });
  }

  // Transform agents as satellite nodes (optional - could be rendered differently)
  for (const agent of apiAgents) {
    allNodes.push({
      id: `agent-${agent.id}`,
      name: agent.name,
      state: "command",
      position: agent.position,
      progress: 100,
      connections: apiConnections
        .filter(c => c.from === agent.id || c.to === agent.id)
        .map(c => c.from === agent.id ? c.to : c.from),
      sectorId: "command",
    });
  }

  return allNodes;
}

export function WarMapDataController() {
  const setNodes = useWarMapStore((s) => s.setNodes);
  const addLogEntry = useWarMapStore((s) => s.addLogEntry);
  const setSelectedNode = useWarMapStore((s) => s.setSelectedNode);

  const [isInitialized, setIsInitialized] = React.useState(false);
  const [pollInterval, setPollInterval] = React.useState<NodeJS.Timeout | null>(null);

  // Poll warmap data
  const fetchWarMapData = React.useCallback(async () => {
    try {
      const response = await fetch("/api/warmap");
      if (!response.ok) throw new Error("Failed to fetch warmap");
      const data: WarMapApiResponse = await response.json();
      const nodes = transformApiToNodes(data.goals, data.agents, data.connections);
      setNodes(nodes);
    } catch (error) {
      console.error("WarMapDataController: Failed to fetch warmap:", error);
    }
  }, [setNodes]);

  // Poll activity logs
  const fetchActivityLogs = React.useCallback(async () => {
    try {
      const response = await fetch("/api/activity-logs");
      if (!response.ok) throw new Error("Failed to fetch activity logs");
      const data: ActivityLogApiResponse = await response.json();

      // Convert activity logs to log entries
      for (const log of data.logs) {
        const time = new Date(log.timestamp).toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        addLogEntry({
          time,
          event: log.category.toUpperCase(),
          detail: log.message,
          category: log.category.toLowerCase(),
        });
      }
    } catch (error) {
      console.error("WarMapDataController: Failed to fetch activity logs:", error);
    }
  }, [addLogEntry]);

  // Initialize on mount
  React.useEffect(() => {
    if (isInitialized) return;

    const initialize = async () => {
      await Promise.all([fetchWarMapData(), fetchActivityLogs()]);
      setIsInitialized(true);
    };

    initialize();

    // Set up polling interval (30 seconds)
    const interval = setInterval(() => {
      fetchWarMapData();
      fetchActivityLogs();
    }, 30000);

    setPollInterval(interval);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [fetchWarMapData, fetchActivityLogs]);

  // Select store values at component level (not inside useEffect)
  const nodes = useWarMapStore((s) => s.nodes);
  const selectedNodeId = useWarMapStore((s) => s.selectedNodeId);

  // Auto-select first node if none selected
  React.useEffect(() => {
    if (nodes.length > 0 && !selectedNodeId) {
      // Find first non-command node or fallback to first
      const firstNode = nodes.find(n => n.state !== "command") || nodes[0];
      if (firstNode) {
        setSelectedNode(firstNode.id);
      }
    }
  }, [nodes, selectedNodeId, setSelectedNode]);

  return null; // This component renders nothing, only manages data
}