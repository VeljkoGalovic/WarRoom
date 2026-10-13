"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
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
    sectorId: "alpha",
  },
];

export const FAKE_MILESTONES: MilestoneData[] = [];

const INITIAL_LOG_ENTRIES: LogEntry[] = [
  { time: "06:42:13", event: "SYSTEM ONLINE", detail: "Tactical display initialized", category: "system" },
  { time: "06:42:15", event: "NODE SYNC", detail: "Tactical Physical sector reporting nominal", category: "success" },
  { time: "06:42:18", event: "PIPELINE ACTIVE", detail: "Deploy War pipeline engaged", category: "info" },
  { time: "06:42:22", event: "WARNING", detail: "Codeforces sector signal degraded", category: "warning" },
];

// ============================================================================
// ZUSTAND STORE - Single source of truth for canvas state
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
// LIGHTING SETUP
// ============================================================================

function SceneLighting() {
  return (
    <>
      {/* Minimal ambient - keep deep space dark */}
      <ambientLight intensity={0.15} color="#0a1520" />

      {/* Subtle hemisphere for depth - very low */}
      <hemisphereLight
        args={["#0a1828", "#030610"]}
        intensity={0.4}
      />

      {/* Main directional - cool cyan, very subtle */}
      <directionalLight
        position={[100, 200, 150]}
        intensity={0.6}
        color="#4dd8e8"
        castShadow={false}
      />

      {/* Warm accent - heavily toned down */}
      <directionalLight
        position={[-150, 100, -100]}
        intensity={0.3}
        color="#ff8847"
        castShadow={false}
      />

      {/* Green accent - subtle */}
      <directionalLight
        position={[50, 150, 200]}
        intensity={0.25}
        color="#2ecc71"
        castShadow={false}
      />

      {/* Red accent - subtle */}
      <directionalLight
        position={[-80, 80, 250]}
        intensity={0.2}
        color="#ff4d5e"
        castShadow={false}
      />

      {/* NO point lights at nodes - they create the harsh glow */}
      {/* Nodes provide their own emissive glow */}

      {/* Very subtle rim from below */}
      <directionalLight
        position={[0, -100, 0]}
        intensity={0.1}
        color="#4dd8e8"
        castShadow={false}
      />
    </>
  );
}

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

export function WarMap3DCanvas() {
  // Tactical node cluster centroid (calculated from TACTICAL_NODES positions)
  const TARGET_CENTER = [-10, 0, -10];

  return (
    <Canvas
      camera={{ position: [72, 200, 440], fov: 60, near: 0.5, far: 1000 }}
      style={{ width: "100%", height: "100%", position: "fixed", top: 0, left: 0 }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2; // Reduced exposure for deeper blacks
        gl.shadowMap.enabled = false; // Disable shadows for performance
      }}
    >
      {/* Scene Lighting */}
      <SceneLighting />

      {/* Orbit Controls - smooth camera navigation calibrated to scene scale */}
      <OrbitControls
        makeDefault={true}
        enableDamping={true}
        dampingFactor={0.04}
        enableRotate={true}
        target={TARGET_CENTER}
        minDistance={10}
        maxDistance={500}
        zoomSpeed={0.8}
        rotateSpeed={0.6}
        panSpeed={0.8}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enablePan={true}
        minPolarAngle={0}
      />

      {/* Post-processing stack */}
      <Suspense fallback={null}>
        <EffectComposer multisampling={8}>
          {/* Subtle bloom - only brightest highlights */}
          <Bloom
            luminanceThreshold={0.75}
            intensity={0.6}
            radius={0.6}
            mipmapBlur={true}
          />

          {/* Subtle chromatic aberration for sci-fi feel */}
          <ChromaticAberration offset={[0.0005, 0.0003]} />

          {/* Very subtle film grain */}
          <Noise
            opacity={0.015}
            premultiply={true}
          />

          {/* Gentle vignette to focus center */}
          <Vignette
            eskil={false}
            offset={0.4}
            darkness={0.3}
          />

          {/* Main scene content */}
          <WarMap3DCanvasInner />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}