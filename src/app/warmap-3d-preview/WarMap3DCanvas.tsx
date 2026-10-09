"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import the inner canvas to avoid SSR issues
const WarMap3DCanvasInner = dynamic(
  () => import("./WarMap3DCanvasInner").then((mod) => mod.WarMap3DCanvasInner),
  { ssr: false }
);

// ============================================================================
// CONSTANTS - Design spec palette
// ============================================================================

export const COLORS = {
  void: 0x050810,
  holoCyan: 0x4dd8e8,
  progressAmber: 0xffb347,
  conquestGreen: 0x3fe0a0,
  threatRed: 0xff4d5e,
};

// ============================================================================
// TYPES & FAKE DATA
// ============================================================================

export type NodeState = "neutral" | "active" | "conquered" | "at-risk" | "command";

export interface WarMapNode {
  id: string;
  name: string;
  state: NodeState;
  position: [number, number, number];
  progress: number;
  connections: string[];
  sectorId: string;
}

export interface MilestoneData {
  id: string;
  title: string;
  completed: boolean;
  nodeId: string;
}

export interface LogEntry {
  time: string;
  event: string;
  detail: string;
  category: string;
}

export const FAKE_NODES: WarMapNode[] = [
  {
    id: "command",
    name: "COMMAND CENTER",
    state: "command",
    position: [0, 0, 0],
    progress: 100,
    connections: [],
    sectorId: "core",
  },
  {
    id: "goal-1",
    name: "TACTICAL PHYSICAL",
    state: "conquered",
    position: [-120, 0, -80],
    progress: 100,
    connections: ["command", "goal-2"],
    sectorId: "alpha",
  },
  {
    id: "goal-2",
    name: "DEPLOY WAR",
    state: "active",
    position: [80, 0, -50],
    progress: 67,
    connections: ["command", "goal-1", "goal-3"],
    sectorId: "beta",
  },
  {
    id: "goal-3",
    name: "REACH CODEFORCES",
    state: "at-risk",
    position: [-100, 0, 100],
    progress: 23,
    connections: ["command", "goal-2", "goal-4"],
    sectorId: "gamma",
  },
  {
    id: "goal-4",
    name: "MASTER SYSTEMS",
    state: "neutral",
    progress: 45,
    position: [120, 0, 80],
    connections: ["command", "goal-3", "goal-5"],
    sectorId: "beta",
  },
  {
    id: "goal-5",
    name: "INTERNATIONAL MATH",
    state: "neutral",
    progress: 12,
    position: [-80, 0, -140],
    connections: ["command", "goal-6"],
    sectorId: "gamma",
  },
  {
    id: "goal-6",
    name: "SECURE COMMS",
    state: "neutral",
    progress: 0,
    position: [-130, 0, 10],
    connections: ["command", "goal-5", "goal-7"],
    sectorId: "gamma",
  },
  {
    id: "goal-7",
    name: "ESTABLISH FOOTHOLD",
    state: "neutral",
    progress: 0,
    position: [-50, 0, -60],
    connections: ["command", "goal-6"],
    sectorId: "alpha",
  },
];

export const SECTOR_HUBS = [
  { id: "alpha", name: "SECTOR ALPHA", position: [-100, 0, -100] as [number, number, number], color: COLORS.holoCyan },
  { id: "beta", name: "SECTOR BETA", position: [100, 0, 50] as [number, number, number], color: COLORS.progressAmber },
  { id: "gamma", name: "SECTOR GAMMA", position: [-90, 0, 90] as [number, number, number], color: COLORS.conquestGreen },
];

export const MILESTONES: MilestoneData[] = [
  { id: "m1", title: "INITIAL RECON", completed: true, nodeId: "goal-1" },
  { id: "m2", title: "ASSET DEPLOYMENT", completed: true, nodeId: "goal-1" },
  { id: "m3", title: "PERIMETER ESTABLISHED", completed: true, nodeId: "goal-1" },
  { id: "m4", title: "INTEL GATHERING", completed: false, nodeId: "goal-2" },
  { id: "m5", title: "TARGET NEUTRALIZATION", completed: false, nodeId: "goal-2" },
  { id: "m6", title: "SECTOR SECURED", completed: false, nodeId: "goal-2" },
];

export const FOG_POSITIONS = [
  { position: [200, 0, -50] as [number, number, number], radius: 60, name: "UNKNOWN SECTOR 7" },
  { position: [-200, 0, -120] as [number, number, number], radius: 60, name: "UNKNOWN SECTOR 3" },
  { position: [80, 0, -180] as [number, number, number], radius: 50, name: "UNKNOWN SECTOR 9" },
];

const INITIAL_LOG_ENTRIES: LogEntry[] = [
  { time: "14:22", event: "MILESTONE SECURED", detail: "TACTICAL PHYSICAL — 5K TIME", category: "Physical Training" },
  { time: "14:18", event: "HYPERLANE ESTABLISHED", detail: "GOAL-2 → GOAL-3 LINK ACTIVE", category: "System Engineering" },
  { time: "14:15", event: "CONTACT LOST", detail: "REACH CODEFORCES — SIGNAL DEGRADED", category: "Codeforces/Algorithmic" },
  { time: "14:10", event: "SECTOR SCAN COMPLETE", detail: "FOG SECTOR 7 — UNKNOWN SIGNATURES", category: "System Engineering" },
  { time: "14:05", event: "RESOURCE ALLOCATED", detail: "DEPLOY WAR — +15% MOMENTUM", category: "SaaS Architecture" },
  { time: "13:58", event: "THREAT DETECTED", detail: "SECTOR 3 — HOSTILE ACTIVITY", category: "System Engineering" },
  { time: "13:52", event: "LINK ESTABLISHED", detail: "COMMAND ↔ SECURE COMMS", category: "System Engineering" },
  { time: "13:47", event: "INTEL UPDATE", detail: "MASTER SYSTEMS — TARGET ACQUIRED", category: "Strategic Analysis" },
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

interface WarMapState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  cameraTarget: THREE.Vector3;
  isAnimating: boolean;
  logEntries: LogEntry[];
  setSelectedNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setCameraTarget: (target: THREE.Vector3, animate?: boolean) => void;
  addLogEntry: (entry: LogEntry) => void;
}

export const useWarMapStore = create<WarMapState>((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,
  cameraTarget: new THREE.Vector3(0, 0, 0),
  isAnimating: false,
  logEntries: INITIAL_LOG_ENTRIES,
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setCameraTarget: (target, animate = true) => set({ cameraTarget: target, isAnimating: animate }),
  addLogEntry: (entry) => set((state) => ({
    logEntries: [entry, ...state.logEntries].slice(0, 50)
  })),
}));

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

export function WarMap3DCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 200, 500], fov: 50 }}
      style={{ width: "100%", height: "100%", position: "fixed", top: 0, left: 0 }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
      }}
    >
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.3}
        enablePan={false}
        minDistance={100}
        maxDistance={800}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
      <Suspense fallback={null}>
        <EffectComposer multisampling={8}>
          <Bloom
            luminanceThreshold={0.8}
            intensity={0.5}
            kernelSize={1.5}
          />
          <Vignette
            eskil={false}
            offset={0.3}
            darkness={0.4}
          />
          <WarMap3DCanvasInner />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}