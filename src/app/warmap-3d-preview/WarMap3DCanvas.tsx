"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Instances, Instance } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { Suspense } from "react";

// ============================================================================
// CONSTANTS - Design spec palette
// ============================================================================

const COLORS = {
  void: 0x050810,
  holoCyan: 0x4dd8e8,
  progressAmber: 0xffb347,
  conquestGreen: 0x3fe0a0,
  threatRed: 0xff4d5e,
};

// ============================================================================
// FAKE DATA (reused from 2D preview)
// ============================================================================

type NodeState = "neutral" | "active" | "conquered" | "at-risk" | "command";

interface WarMapNode {
  id: string;
  name: string;
  state: NodeState;
  position: [number, number, number];
  progress: number;
  connections: string[];
  sectorId: string;
}

interface MilestoneData {
  id: string;
  title: string;
  completed: boolean;
  nodeId: string;
}

const FAKE_NODES: WarMapNode[] = [
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
    position: [-120, -60, -80],
    progress: 100,
    connections: ["command", "goal-2"],
    sectorId: "alpha",
  },
  {
    id: "goal-2",
    name: "DEPLOY WAR",
    state: "active",
    position: [80, -100, -120],
    progress: 67,
    connections: ["command", "goal-1", "goal-3"],
    sectorId: "alpha",
  },
  {
    id: "goal-3",
    name: "REACH CODEFORCES",
    state: "at-risk",
    position: [140, 30, 40],
    progress: 23,
    connections: ["command", "goal-2", "goal-4"],
    sectorId: "beta",
  },
  {
    id: "goal-4",
    name: "MASTER SYSTEMS",
    state: "neutral",
    position: [35, 120, 120],
    progress: 45,
    connections: ["command", "goal-3", "goal-5"],
    sectorId: "beta",
  },
  {
    id: "goal-5",
    name: "INTERNATIONAL MATH",
    state: "neutral",
    position: [-95, 85, 90],
    progress: 12,
    connections: ["command", "goal-4", "goal-6"],
    sectorId: "gamma",
  },
  {
    id: "goal-6",
    name: "SECURE COMMS",
    state: "neutral",
    position: [-130, 10, 10],
    progress: 0,
    connections: ["command", "goal-5", "goal-7"],
    sectorId: "gamma",
  },
  {
    id: "goal-7",
    name: "ESTABLISH FOOTHOLD",
    state: "neutral",
    position: [-50, -50, -60],
    progress: 0,
    connections: ["command", "goal-6"],
    sectorId: "alpha",
  },
];

const SECTORS = [
  { id: "core", name: "CORE SECTOR", position: [0, 0, 0], radius: 40, color: COLORS.holoCyan },
  { id: "alpha", name: "SECTOR ALPHA", position: [-60, -40, -60], radius: 85, color: COLORS.holoCyan },
  { id: "beta", name: "SECTOR BETA", position: [90, 10, 50], radius: 85, color: COLORS.progressAmber },
  { id: "gamma", name: "SECTOR GAMMA", position: [-80, 40, 60], radius: 85, color: COLORS.conquestGreen },
];

const MILESTONES: MilestoneData[] = [
  { id: "m1", title: "INITIAL RECON", completed: true, nodeId: "goal-1" },
  { id: "m2", title: "ASSET DEPLOYMENT", completed: true, nodeId: "goal-1" },
  { id: "m3", title: "PERIMETER ESTABLISHED", completed: true, nodeId: "goal-1" },
  { id: "m4", title: "INTEL GATHERING", completed: false, nodeId: "goal-2" },
  { id: "m5", title: "TARGET NEUTRALIZATION", completed: false, nodeId: "goal-2" },
  { id: "m6", title: "SECTOR SECURED", completed: false, nodeId: "goal-2" },
];

const FOG_POSITIONS = [
  { position: [200, -50, -50], radius: 60, name: "UNKNOWN SECTOR 7" },
  { position: [-200, -120, -120], radius: 60, name: "UNKNOWN SECTOR 3" },
  { position: [80, -180, -180], radius: 50, name: "UNKNOWN SECTOR 9" },
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

interface WarMapState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  cameraTarget: THREE.Vector3;
  isAnimating: boolean;
  setSelectedNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setCameraTarget: (target: THREE.Vector3, animate?: boolean) => void;
}

const useWarMapStore = create<WarMapState>((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,
  cameraTarget: new THREE.Vector3(0, 0, 0),
  isAnimating: false,
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setCameraTarget: (target, animate = true) => set({ cameraTarget: target, isAnimating: animate }),
}));

// ============================================================================
// GEOMETRY & MATERIAL FACTORIES (memoized)
// ============================================================================

const commandCoreGeometry = new THREE.IcosahedronGeometry(18, 1);
const goalGeometry = new THREE.CylinderGeometry(14, 14, 6, 6);
const milestoneGeometry = new THREE.SphereGeometry(2.5, 8, 8);
const ringGeometry = new THREE.RingGeometry(16, 17.5, 64);
const sectorGeometry = new THREE.SphereGeometry(1, 16, 16);
const fogGeometry = new THREE.SphereGeometry(1, 12, 12);

function getNodeMaterial(state: NodeState) {
  const color = state === "command" ? COLORS.holoCyan :
                state === "conquered" ? COLORS.conquestGreen :
                state === "active" ? COLORS.progressAmber :
                state === "at-risk" ? COLORS.threatRed : COLORS.holoCyan;

  const emissiveIntensity = state === "command" ? 1.2 : state === "active" ? 0.8 : 0.5;

  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: state === "command" ? 0.4 : 0.25,
    wireframe: false,
  });
}

function getNodeWireframeMaterial(state: NodeState) {
  const color = state === "command" ? COLORS.holoCyan :
                state === "conquered" ? COLORS.conquestGreen :
                state === "active" ? COLORS.progressAmber :
                state === "at-risk" ? COLORS.threatRed : COLORS.holoCyan;
  return new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.6 });
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Command Core - glowing icosahedron with pulse
function CommandCore() {
  const { isAnimating } = useWarMapStore(useShallow((s) => ({ isAnimating: s.isAnimating })));
  const meshRef = React.useRef<THREE.Mesh>(null);
  const timeRef = React.useRef(0);

  const outerShellMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  }), []);

  const innerCoreMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    transparent: true,
    opacity: 0.5,
  }), []);

  const pulseSphereMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    transparent: true,
    opacity: 0.8,
  }), []);

  const ringMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      const scale = 1 + Math.sin(timeRef.current * 1.5) * 0.08;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Outer glow shell */}
      <mesh
        geometry={commandCoreGeometry}
        material={outerShellMaterial}
        scale={1.8}
      />
      {/* Inner core */}
      <mesh
        ref={meshRef}
        geometry={commandCoreGeometry}
        material={innerCoreMaterial}
      />
      {/* Central pulse sphere */}
      <mesh
        geometry={React.useMemo(() => new THREE.SphereGeometry(8, 16, 16), [])}
        material={pulseSphereMaterial}
      />
      {/* Rotating rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          geometry={React.useMemo(() => new THREE.RingGeometry(22, 24, 64), [])}
          material={ringMaterial}
          rotation={[i === 0 ? Math.PI / 2 : 0, i === 1 ? Math.PI / 2 : 0, 0]}
        />
      ))}
    </group>
  );
}

// Sector Shell - wireframe sphere with subtle glow
function SectorShell({ sector }: { sector: typeof SECTORS[0] }) {
  const timeRef = React.useRef(0);

  const wireframeMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: sector.color,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  }), [sector.color]);

  const innerGlowMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: sector.color,
    transparent: true,
    opacity: 0.04,
  }), [sector.color]);

  const labelRingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: sector.color,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  }), [sector.color]);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <group position={sector.position as [number, number, number]}>
      {/* Wireframe sphere */}
      <mesh
        geometry={sectorGeometry}
        material={wireframeMaterial}
        scale={sector.radius}
      />
      {/* Subtle inner glow */}
      <mesh
        geometry={sectorGeometry}
        material={innerGlowMaterial}
        scale={sector.radius * 0.98}
      />
      {/* Sector label ring */}
      <mesh
        geometry={React.useMemo(() => new THREE.RingGeometry(sector.radius * 1.02, sector.radius * 1.08, 64), [sector.radius])}
        material={labelRingMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

// Goal Node - hexagonal prism with progress ring
const GoalNode = React.memo(function GoalNode({ node }: { node: WarMapNode }) {
  const { selectedNodeId, hoveredNodeId, setHoveredNode, setSelectedNode } = useWarMapStore(
    useShallow((s) => ({
      selectedNodeId: s.selectedNodeId,
      hoveredNodeId: s.hoveredNodeId,
      setHoveredNode: s.setHoveredNode,
      setSelectedNode: s.setSelectedNode,
    }))
  );

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const meshRef = React.useRef<THREE.Mesh>(null);
  const ringRef = React.useRef<THREE.Mesh>(null);
  const timeRef = React.useRef(0);
  const baseScale = isSelected ? 1.15 : isHovered ? 1.08 : 1;

  const material = React.useMemo(() => getNodeMaterial(node.state), [node.state]);
  const wireMaterial = React.useMemo(() => getNodeWireframeMaterial(node.state), [node.state]);

  const color = node.state === "command" ? COLORS.holoCyan :
                node.state === "conquered" ? COLORS.conquestGreen :
                node.state === "active" ? COLORS.progressAmber :
                node.state === "at-risk" ? COLORS.threatRed : COLORS.holoCyan;

  const progressRingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  }), [color]);

  const selectionRingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  }), []);

  // Fixed: Hook moved to top level, outside conditional blocks
  const selectionRingGeometry = React.useMemo(() => new THREE.RingGeometry(18, 20, 64), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      if (node.state === "active" || node.state === "at-risk") {
        meshRef.current.rotation.y += delta * 0.3;
      }
      if (node.state === "at-risk") {
        const pulse = 1 + Math.sin(timeRef.current * 4) * 0.06;
        meshRef.current.scale.setScalar(pulse * baseScale);
      } else {
        meshRef.current.scale.setScalar(baseScale);
      }
    }
    if (ringRef.current && node.progress > 0) {
      ringRef.current.rotation.z -= delta * 0.5;
    }
  });

  return (
    <group position={node.position as [number, number, number]} onPointerOver={() => setHoveredNode(node.id)} onPointerOut={() => setHoveredNode(null)} onClick={() => setSelectedNode(node.id)}>
      <mesh
        ref={meshRef}
        geometry={goalGeometry}
        material={material}
        castShadow={false}
        receiveShadow={false}
      />
      <mesh
        geometry={goalGeometry}
        material={wireMaterial}
        scale={1.02}
      />
      {node.progress > 0 && (
        <mesh
          ref={ringRef}
          geometry={ringGeometry}
          material={progressRingMaterial}
          position={[0, 4, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}
      {isSelected && (
        <mesh
          geometry={selectionRingGeometry}
          material={selectionRingMaterial}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}
      <Text
        position={[0, 22, 0]}
        fontSize={3.5}
        color="#4DD8E8"
        anchorX="center"
        anchorY="middle"
      >
        {node.name}
      </Text>
    </group>
  );
}, (prev, next) => prev.node.id === next.node.id && prev.node.state === next.node.state && prev.node.progress === next.node.progress);

// Milestone - orbiting sphere
function Milestone({ milestone, nodePosition }: { milestone: MilestoneData; nodePosition: [number, number, number] }) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const timeRef = React.useRef(0);
  const angleRef = React.useRef(Math.random() * Math.PI * 2);
  const radius = 22;
  const speed = 0.4 + Math.random() * 0.3;

  const material = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: milestone.completed ? COLORS.conquestGreen : COLORS.holoCyan,
    transparent: true,
    opacity: milestone.completed ? 0.9 : 0.5,
  }), [milestone.completed]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    angleRef.current += delta * speed;
    if (meshRef.current) {
      meshRef.current.position.set(
        nodePosition[0] + Math.cos(angleRef.current) * radius,
        nodePosition[1] + Math.sin(timeRef.current * 1.5) * 3 + Math.sin(angleRef.current) * radius * 0.3,
        nodePosition[2] + Math.sin(angleRef.current) * radius
      );
      // Pulse for completed
      if (milestone.completed) {
        const pulse = 1 + Math.sin(timeRef.current * 3) * 0.2;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={milestoneGeometry}
      material={material}
    />
  );
}

// Milestone ring for a node
function MilestoneRing({ node }: { node: WarMapNode }) {
  const nodeMilestones = MILESTONES.filter((m) => m.nodeId === node.id);
  if (nodeMilestones.length === 0) return null;

  return (
    <group position={node.position}>
      {nodeMilestones.map((m, i) => (
        <Milestone key={m.id} milestone={m} nodePosition={node.position} />
      ))}
    </group>
  );
}

// Hyperlane - curved tube with animated flow
function Hyperlane({ from, to, color, isActive }: { from: [number, number, number]; to: [number, number, number]; color: number; isActive: boolean }) {
  const timeRef = React.useRef(0);

  const outerMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: isActive ? 0.3 : 0.15,
  }), [color, isActive]);

  const innerMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: isActive ? 0.6 : 0.3,
  }), [color, isActive]);

  const lineMaterial = React.useMemo(() => new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: isActive ? 0.8 : 0,
    linewidth: 3,
  }), [color, isActive]);

  // Fixed: Curve and tube geometry memoized stably based purely on coordinates
  const { tubeGeometry, lineObject } = React.useMemo(() => {
    const midX = (from[0] + to[0]) / 2;
    const midY = (from[1] + to[1]) / 2 + 40;
    const midZ = (from[2] + to[2]) / 2;

    const distToOrigin = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
    const adjustedMidY = distToOrigin < 50 ? midY + 30 : midY;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3(midX, adjustedMidY, midZ),
      new THREE.Vector3(...to),
    ]);

    const tubeGeom = new THREE.TubeGeometry(curve, 64, 1.2, 8, false);
    const points = curve.getPoints(64);
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const lineObj = new THREE.Line(lineGeom, lineMaterial);

    return { tubeGeometry: tubeGeom, lineObject: lineObj };
  }, [from, to, lineMaterial]);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <group>
      {/* Outer glow tube */}
      <mesh
        geometry={tubeGeometry}
        material={outerMaterial}
        scale={1.5}
      />
      {/* Inner flow tube */}
      <mesh
        geometry={tubeGeometry}
        material={innerMaterial}
      />
      {/* Animated flow particles */}
      <primitive object={lineObject} />
    </group>
  );
}

// Fog Volume - volumetric unexplored region
function FogVolume({ fog }: { fog: typeof FOG_POSITIONS[0] }) {
  const timeRef = React.useRef(0);
  const meshRef = React.useRef<THREE.Mesh>(null);

  const wireframeMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.void,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide,
  }), []);

  const innerMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.void,
    transparent: true,
    opacity: 0.6,
    side: THREE.BackSide,
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
      meshRef.current.rotation.x += delta * 0.01;
      const pulse = 1 + Math.sin(timeRef.current * 0.5) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={fog.position as [number, number, number]}>
      <mesh
        ref={meshRef}
        geometry={fogGeometry}
        material={wireframeMaterial}
        scale={fog.radius}
      />
      <mesh
        geometry={fogGeometry}
        material={innerMaterial}
        scale={fog.radius * 0.95}
      />
      {/* Unknown marker - Using WebGL Text instead of Html */}
      <Text
        position={[0, fog.radius + 10, 0]}
        fontSize={3.2}
        color="#4DD8E8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        {fog.name}
      </Text>
      <Text
        position={[0, fog.radius + 20, 0]}
        fontSize={5}
        color="#4DD8E8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.3}
      >
        ?
      </Text>
    </group>
  );
}


// Floor Grid - fading atmospheric grid
function FloorGrid() {
  const gridHelperRef = React.useRef<THREE.GridHelper | null>(null);
  const timeRef = React.useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (gridHelperRef.current) {
      gridHelperRef.current.material.opacity = 0.15 + Math.sin(timeRef.current * 0.3) * 0.05;
    }
  });

  return (
    <gridHelper
      ref={gridHelperRef}
      args={[400, 40, COLORS.holoCyan, COLORS.holoCyan]}
      position={[0, -80, 0] as [number, number, number]}
    />
  );
}

// Camera Controller - handles smooth transitions
function CameraController() {
  const { camera, camera: { position: camPos } } = useThree();
  const { cameraTarget, isAnimating, selectedNodeId } = useWarMapStore(
    useShallow((s) => ({ cameraTarget: s.cameraTarget, isAnimating: s.isAnimating, selectedNodeId: s.selectedNodeId }))
  );
  const targetRef = React.useRef(new THREE.Vector3());
  const lerpFactor = 0.02;

  useFrame(() => {
    if (isAnimating && selectedNodeId) {
      targetRef.current.lerp(cameraTarget, lerpFactor);
      camera.lookAt(targetRef.current);

      // Check if close enough to stop animating
      if (targetRef.current.distanceTo(cameraTarget) < 0.5) {
        useWarMapStore.setState({ isAnimating: false });
      }
    } else if (!selectedNodeId) {
      // Return to default view
      targetRef.current.lerp(new THREE.Vector3(0, 0, 0), lerpFactor);
      camera.lookAt(targetRef.current);
    }
  });

  return null;
}

// Detail Panel - slides in from right
export function DetailPanel() {
  const { selectedNodeId, setSelectedNode } = useWarMapStore(
    useShallow((s) => ({
      selectedNodeId: s.selectedNodeId,
      setSelectedNode: s.setSelectedNode,
    }))
  );
  const node = FAKE_NODES.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const color = node.state === "command" ? "#4DD8E8" :
                node.state === "conquered" ? "#3FE0A0" :
                node.state === "active" ? "#FFB347" :
                node.state === "at-risk" ? "#FF4D5E" : "#4DD8E8";

  const progress = node.progress || 0;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "360px",
        background: "rgba(5, 8, 16, 0.98)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.3)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        animation: "slideIn 0.4s ease-out forwards",
        boxShadow: "-20px 0 40px rgba(0, 0, 0, 0.5), inset 1px 0 0 #4DD8E8",
        zIndex: 100,
        pointerEvents: "auto",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={() => setSelectedNode(null)}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "24px",
          height: "24px",
          background: "transparent",
          border: "1px solid rgba(77, 216, 232, 0.3)",
          color: "#4DD8E8",
          fontFamily: "var(--wm-font-mono)",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>

      {/* Header */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(77, 216, 232, 0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div style={{
              fontFamily: "var(--wm-font-display)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#4DD8E8",
              opacity: 0.5,
              marginBottom: "4px",
            }}>
              OBJECTIVE
            </div>
            <div style={{
              fontFamily: "var(--wm-font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color,
              textShadow: `0 0 8px ${color}`,
            }}>
              {node.name}
            </div>
          </div>
          <div style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color,
            padding: "4px 10px",
            border: `1px solid ${color}`,
            background: `${color}20`,
            clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)",
          }}>
            {node.state.toUpperCase().replace("-", " ")}
          </div>
        </div>

        {/* Progress Ring */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="#4DD8E8" strokeWidth="3" strokeOpacity={0.15} />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 0.5s ease" }}
            />
            <text x="32" y="36" textAnchor="middle" fill="#4DD8E8" fontFamily="var(--wm-font-display)" fontSize="14" fontWeight={700} style={{ transform: "rotate(90deg)", transformOrigin: "32px 32px" }}>
              {progress}%
            </text>
          </svg>
          <div>
            <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.55rem", color: "#4DD8E8", opacity: 0.5, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              COMPLETION
            </div>
            <div style={{ fontFamily: "var(--wm-font-mono)", fontSize: "0.75rem", color: "#4DD8E8" }}>
              {node.state === "conquered" ? "MISSION COMPLETE" : node.state === "at-risk" ? "CRITICAL — INTERVENTION REQUIRED" : "IN PROGRESS"}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <div style={{
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#4DD8E8",
          opacity: 0.5,
          marginBottom: "12px",
          borderBottom: "1px solid rgba(77, 216, 232, 0.1)",
          paddingBottom: "8px",
        }}>
          MILESTONES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {MILESTONES.filter(m => m.nodeId === node.id).map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                background: m.completed ? "rgba(63, 224, 160, 0.1)" : "transparent",
                border: `1px solid ${m.completed ? "#3FE0A0" : "rgba(77, 216, 232, 0.2)"}`,
                clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)",
              }}
            >
              <div style={{
                width: "10px", height: "10px",
                border: `1px solid ${m.completed ? "#3FE0A0" : "rgba(77, 216, 232, 0.3)"}`,
                background: m.completed ? "#3FE0A0" : "transparent",
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }} />
              <div style={{
                fontFamily: "var(--wm-font-mono)", fontSize: "0.7rem",
                color: m.completed ? "#3FE0A0" : "#4DD8E8",
                opacity: m.completed ? 1 : 0.7,
                textTransform: "uppercase", letterSpacing: "0.05em", flex: 1,
              }}>
                {m.title}
              </div>
              {m.completed && <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.55rem", fontWeight: 700, color: "#3FE0A0", letterSpacing: "0.1em" }}>SECURED</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Top Bar (Now a standard fixed HTML element outside the canvas)
export function TopBar() {
  const [time, setTime] = React.useState("");
  const activeCount = FAKE_NODES.filter((n) => n.state === "active").length;
  const conqueredCount = FAKE_NODES.filter((n) => n.state === "conquered").length;

  React.useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
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
        color: "#4DD8E8",
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      <div style={{
        fontFamily: "var(--wm-font-display)",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#4DD8E8",
        textShadow: "0 0 8px #4DD8E8",
      }}>
        CAMPAIGN VISUALIZER — 3D TACTICAL DISPLAY
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ opacity: 0.6 }}>TIME</span>
          <span style={{ fontFamily: "var(--wm-font-mono)", fontWeight: 600, letterSpacing: "0.1em" }}>{time}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid rgba(77, 216, 232, 0.2)", paddingLeft: "16px" }}>
          <span style={{ opacity: 0.6 }}>ACTIVE FRONTS</span>
          <span style={{ fontFamily: "var(--wm-font-display)", fontWeight: 700, color: "#FFB347", textShadow: "0 0 8px #FFB347" }}>{activeCount}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid rgba(77, 216, 232, 0.2)", paddingLeft: "16px" }}>
          <span style={{ opacity: 0.6 }}>CONQUERED</span>
          <span style={{ fontFamily: "var(--wm-font-display)", fontWeight: 700, color: "#3FE0A0", textShadow: "0 0 8px #3FE0A0" }}>{conqueredCount}</span>
        </div>
      </div>
    </div>
  );
}

// Bottom Bar - Tactical Readout (Also outside the canvas)
export function BottomBar() {
  const [logIndex, setLogIndex] = React.useState(0);
  const FAKE_LOG_ENTRIES = [
    { time: "14:22", event: "MILESTONE SECURED", detail: "TACTICAL PHYSICAL — 5K TIME" },
    { time: "14:18", event: "HYPERLANE ESTABLISHED", detail: "GOAL-2 → GOAL-3 LINK ACTIVE" },
    { time: "14:15", event: "CONTACT LOST", detail: "REACH CODEFORCES — SIGNAL DEGRADED" },
    { time: "14:10", event: "SECTOR SCAN COMPLETE", detail: "FOG SECTOR 7 — UNKNOWN SIGNATURES" },
    { time: "14:05", event: "RESOURCE ALLOCATED", detail: "DEPLOY WAR — +15% MOMENTUM" },
    { time: "13:58", event: "THREAT DETECTED", detail: "SECTOR 3 — HOSTILE ACTIVITY" },
    { time: "13:52", event: "LINK ESTABLISHED", detail: "COMMAND ↔ SECURE COMMS" },
    { time: "13:47", event: "INTEL UPDATE", detail: "MASTER SYSTEMS — TARGET ACQUIRED" },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => setLogIndex((prev) => (prev + 1) % FAKE_LOG_ENTRIES.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const visibleLogs = FAKE_LOG_ENTRIES.slice(logIndex, logIndex + 6);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40px",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.95)",
        borderTop: "1px solid rgba(77, 216, 232, 0.2)",
        backdropFilter: "blur(8px)",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.6rem",
        color: "#4DD8E8",
        overflow: "hidden",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {visibleLogs.map((log, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", opacity: 1 - i * 0.12, whiteSpace: "nowrap" }}>
            <span style={{ opacity: 0.5 }}>{log.time}</span>
            <span style={{ color: "#FFB347", fontWeight: 600 }}>{log.event}</span>
            <span style={{ opacity: 0.7 }}>{log.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

function WarMap3DCanvasInner() {
  const { selectedNodeId } = useWarMapStore(useShallow((s) => ({ selectedNodeId: s.selectedNodeId })));
  const nodeMap = React.useMemo(() => new Map(FAKE_NODES.map((n) => [n.id, n])), []);

  return (
    <>
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
      </EffectComposer>

      {/* Background - Void */}
      <color attach="background" args={[COLORS.void]} />

      {/* Floor Grid */}
      <FloorGrid />

      {/* Command Core */}
      <CommandCore />

      {/* Sector Shells */}
      {SECTORS.filter(s => s.id !== "core").map((sector) => (
        <SectorShell key={sector.id} sector={sector} />
      ))}

      {/* Fog Volumes */}
      {FOG_POSITIONS.map((fog, i) => (
        <FogVolume key={i} fog={fog} />
      ))}

      {/* Hyperlanes - Command Core to Sector Hubs */}
      {SECTORS.filter(s => s.id !== "core").map((sector) => (
        <Hyperlane
          key={`core-${sector.id}`}
          from={[0, 0, 0] as [number, number, number]}
          to={sector.position as [number, number, number]}
          color={sector.color}
          isActive={true}
        />
      ))}

      {/* Hyperlanes - Sector Hubs to Goal Nodes & Node-to-Node */}
      {FAKE_NODES.filter(n => n.id !== "command").map((node) => {
        const nodeConnections = node.connections.filter(c => nodeMap.get(c)?.sectorId === node.sectorId || nodeMap.get(c)?.id === "command");
        return nodeConnections.map((connId) => {
          if (node.id > connId) return null; // Avoid duplicates
          const target = nodeMap.get(connId);
          if (!target) return null;
          const fromState = node.state;
          const toState = target.state;
          const isActive = fromState === "active" || toState === "active";
          const isConquered = fromState === "conquered" && toState === "conquered";
          let color = COLORS.holoCyan;
          if (isActive) color = COLORS.progressAmber;
          if (isConquered) color = COLORS.conquestGreen;
          if (fromState === "at-risk" || toState === "at-risk") color = COLORS.threatRed;
          return (
            <Hyperlane
              key={`${node.id}-${connId}`}
              from={node.position as [number, number, number]}
              to={target.position as [number, number, number]}
              color={color}
              isActive={isActive}
            />
          );
        });
      })}

      {/* Goal Nodes */}
      {FAKE_NODES.filter(n => n.id !== "command").map((node) => (
        <GoalNode key={node.id} node={node} />
      ))}

      {/* Milestone Rings */}
      {FAKE_NODES.filter(n => n.id !== "command" && MILESTONES.some(m => m.nodeId === n.id)).map((node) => (
        <MilestoneRing key={node.id} node={node} />
      ))}

      {/* Camera Controller */}
      <CameraController />
    </>
  );
}

// ============================================================================
// EXPORT
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
        <WarMap3DCanvasInner />
      </Suspense>
    </Canvas>
  );
}