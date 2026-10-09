"use client";

import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
// FIX: Imported useCursor from @react-three/drei
import { Text, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { useWarMapStore } from "./WarMap3DCanvas";

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
// FAKE DATA
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

const SECTOR_HUBS = [
  { id: "alpha", name: "SECTOR ALPHA", position: [-100, 0, -100] as [number, number, number], color: COLORS.holoCyan },
  { id: "beta", name: "SECTOR BETA", position: [100, 0, 50] as [number, number, number], color: COLORS.progressAmber },
  { id: "gamma", name: "SECTOR GAMMA", position: [-90, 0, 90] as [number, number, number], color: COLORS.conquestGreen },
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
  { position: [200, 0, -50] as [number, number, number], radius: 60, name: "UNKNOWN SECTOR 7" },
  { position: [-200, 0, -120] as [number, number, number], radius: 60, name: "UNKNOWN SECTOR 3" },
  { position: [80, 0, -180] as [number, number, number], radius: 50, name: "UNKNOWN SECTOR 9" },
];

// ============================================================================
// SHARED GEOMETRIES (created once at module level)
// ============================================================================

const sectorRingGeometry = new THREE.RingGeometry(35, 40, 64);
const sectorInnerRingGeometry = new THREE.RingGeometry(25, 30, 64);
const sectorCenterGeometry = new THREE.CircleGeometry(8, 32);

// ============================================================================
// COMPONENTS
// ============================================================================

// Floor Grid - clean holographic grid at y=0
function FloorGrid() {
  const gridRef = React.useRef<THREE.GridHelper | null>(null);
  const timeRef = React.useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.1 + Math.sin(timeRef.current * 0.4) * 0.03;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[500, 50, COLORS.holoCyan, COLORS.holoCyan]}
      position={[0, -0.5, 0] as [number, number, number]}
    />
  );
}

// Command Core - striking geometric nexus at center
function CommandCore() {
  const timeRef = React.useRef(0);
  const groupRef = React.useRef<THREE.Group | null>(null);

  const outerRingGeometry = React.useMemo(() => new THREE.RingGeometry(12, 14, 64), []);
  const middleRingGeometry = React.useMemo(() => new THREE.RingGeometry(8, 9, 64), []);
  const innerRingGeometry = React.useMemo(() => new THREE.RingGeometry(4, 5, 64), []);
  const coreGeometry = React.useMemo(() => new THREE.OctahedronGeometry(3, 0), []);

  const outerMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  }), []);

  const middleMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.conquestGreen,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  }), []);

  const innerMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.progressAmber,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  }), []);

  const coreMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    wireframe: true,
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x = Math.sin(timeRef.current * 0.3) * 0.1;
      groupRef.current.rotation.z = Math.cos(timeRef.current * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0] as [number, number, number]}>
      {/* Outer rotating rings */}
      <mesh geometry={outerRingGeometry} material={outerMaterial} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={middleRingGeometry} material={middleMaterial} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={innerRingGeometry} material={innerMaterial} rotation={[-Math.PI / 2, 0, 0]} />
      {/* Core geometric shape */}
      <mesh geometry={coreGeometry} material={coreMaterial} position={[0, 0, 0] as [number, number, number]} />
      {/* Pulsing center glow */}
      <mesh
        geometry={React.useMemo(() => new THREE.CircleGeometry(2.5, 32), [])}
        material={React.useMemo(() => new THREE.MeshBasicMaterial({
          color: COLORS.holoCyan,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        }), [])}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.1, 0] as [number, number, number]}
        scale={1 + Math.sin(timeRef.current * 2) * 0.15}
      />
      {/* Label */}
      <Text
        position={[0, 18, 0] as [number, number, number]}
        fontSize={3}
        color="#4DD8E8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.9}
      >
        COMMAND NEXUS
      </Text>
    </group>
  );
}

// Sector Hub - flat glowing ring on floor with pulsing beacon
function SectorHub({ sector }: { sector: typeof SECTOR_HUBS[0] }) {
  const timeRef = React.useRef(0);

  const nodesInSector = FAKE_NODES.filter(n => n.sectorId === sector.id && n.id !== "command");
  const hasActive = nodesInSector.some(n => n.state === "active");
  const hasAtRisk = nodesInSector.some(n => n.state === "at-risk");
  const allConquered = nodesInSector.length > 0 && nodesInSector.every(n => n.state === "conquered");

  const ringColor = allConquered ? COLORS.conquestGreen : hasAtRisk ? COLORS.threatRed : hasActive ? COLORS.progressAmber : sector.color;

  const outerRingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: ringColor,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  }), [ringColor]);

  const innerRingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: ringColor,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  }), [ringColor]);

  const beaconMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: ringColor,
    transparent: true,
    opacity: 0.9,
  }), [ringColor]);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <group position={sector.position}>
      {/* Outer sector ring */}
      <mesh
        geometry={sectorRingGeometry}
        material={outerRingMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={1 + Math.sin(timeRef.current * 1.5) * 0.05}
      />
      {/* Inner sector ring */}
      <mesh
        geometry={sectorInnerRingGeometry}
        material={innerRingMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={1 + Math.sin(timeRef.current * 1.5 + 1) * 0.03}
      />
      {/* Center beacon */}
      <mesh
        geometry={sectorCenterGeometry}
        material={beaconMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.5, 0] as [number, number, number]}
        scale={1 + Math.sin(timeRef.current * 3) * 0.2}
      />
      {/* Sector label */}
      <Text
        position={[0, -15, 0] as [number, number, number]}
        fontSize={2.5}
        color={`#${ringColor.toString(16).padStart(6, '0')}`}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
      >
        {sector.name}
      </Text>
    </group>
  );
}

// Fog Volume - unknown sectors
function FogVolume({ fog }: { fog: typeof FOG_POSITIONS[0] }) {
  const timeRef = React.useRef(0);
  const meshRef = React.useRef<THREE.Mesh | null>(null);

  const fogGeometry = React.useMemo(() => new THREE.IcosahedronGeometry(1, 4), []);

  const wireframeMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide,
  }), []);

  const innerMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.holoCyan,
    transparent: true,
    opacity: 0.08,
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
    <group position={fog.position}>
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
      <Text
        position={[0, fog.radius + 10, 0] as [number, number, number]}
        fontSize={3.2}
        color="#4DD8E8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        {fog.name}
      </Text>
      <Text
        position={[0, fog.radius + 20, 0] as [number, number, number]}
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

// Hyperlane - low-profile straight or gently curved lines at ground level
function Hyperlane({ from, to, color, isActive }: { from: [number, number, number]; to: [number, number, number]; color: number; isActive: boolean }) {
  const timeRef = React.useRef(0);

  const lineMaterial = React.useMemo(() => new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: isActive ? 0.7 : 0.3,
  }), [color, isActive]);

  const flowMaterial = React.useMemo(() => new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: isActive ? 0.9 : 0,
  }), [isActive]);

  const { lineGeometry, flowGeometry } = React.useMemo(() => {
    const midX = (from[0] + to[0]) / 2;
    const midY = 2;
    const midZ = (from[2] + to[2]) / 2;

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(midX, midY, midZ),
      new THREE.Vector3(...to)
    );

    const points = curve.getPoints(64);
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);

    const flowPoints = curve.getPoints(8);
    const flowGeom = new THREE.BufferGeometry().setFromPoints(flowPoints);

    return { lineGeometry: lineGeom, flowGeometry: flowGeom };
  }, [from, to]);

  // FIX: Wrapped THREE.Line in <primitive> to avoid SVG <line> type collisions in TypeScript
  const lineObj = React.useMemo(() => new THREE.Line(lineGeometry, lineMaterial), [lineGeometry, lineMaterial]);
  const flowObj = React.useMemo(() => new THREE.Line(flowGeometry, flowMaterial), [flowGeometry, flowMaterial]);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <group>
      <primitive object={lineObj} />
      {isActive && (
        <primitive
          object={flowObj}
          position={[0, 0.1, 0] as [number, number, number]}
        />
      )}
    </group>
  );
}

// Goal Node - clean floating geometric marker
const GoalNode = React.memo(function GoalNode({ node }: { node: WarMapNode }) {
  const selectedNodeId = useWarMapStore((s) => s.selectedNodeId);
  const hoveredNodeId = useWarMapStore((s) => s.hoveredNodeId);
  const setHoveredNode = useWarMapStore((s) => s.setHoveredNode);
  const setSelectedNode = useWarMapStore((s) => s.setSelectedNode);

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const isInteractive = isSelected || isHovered;

  // FIX: Use useCursor hook from drei instead of invalid style prop on <group>
  useCursor(isInteractive);

  const stateColors: Record<NodeState, number> = {
    command: COLORS.holoCyan,
    conquered: COLORS.conquestGreen,
    active: COLORS.progressAmber,
    "at-risk": COLORS.threatRed,
    neutral: 0x6b7280,
  };

  const baseColor = stateColors[node.state] || COLORS.holoCyan;

  const nodeGeometry = React.useMemo(() => new THREE.OctahedronGeometry(4, 0), []);
  const ringGeometry = React.useMemo(() => new THREE.RingGeometry(6, 7.5, 32), []);

  const nodeMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: 0.9,
    wireframe: true,
  }), [baseColor]);

  const ringMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: isInteractive ? 0.6 : 0.3,
    side: THREE.DoubleSide,
  }), [baseColor, isInteractive]);

  const progressRingGeometry = React.useMemo(() => new THREE.RingGeometry(7.5, 8.5, 64), []);

  const progressMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  }), [baseColor]);

  const timeRef = React.useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  const handlePointerOver = () => setHoveredNode(node.id);
  const handlePointerOut = () => setHoveredNode(null);
  const handleClick = () => setSelectedNode(node.id);

  return (
    <group
      position={node.position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <mesh
        geometry={nodeGeometry}
        material={nodeMaterial}
        position={[0, 6, 0] as [number, number, number]}
        rotation={[timeRef.current * 0.3, timeRef.current * 0.2, 0] as [number, number, number]}
        scale={isInteractive ? 1.3 : 1}
      />
      <mesh
        geometry={ringGeometry}
        material={ringMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.5, 0] as [number, number, number]}
        scale={isInteractive ? 1.2 : 1}
      />
      {node.progress > 0 && (
        <mesh
          geometry={progressRingGeometry}
          material={progressMaterial}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.6, 0] as [number, number, number]}
          scale={[1, 1, node.progress / 100] as [number, number, number]}
        />
      )}
      <Text
        position={[0, 14, 0] as [number, number, number]}
        fontSize={2.8}
        color="#4DD8E8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={isInteractive ? 1 : 0.7}
      >
        {node.name}
      </Text>
    </group>
  );
});

// Camera Controller - smooth auto-rotate
function CameraController() {
  const { camera } = useThree();
  const timeRef = React.useRef(0);
  const targetRef = React.useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    timeRef.current += delta;
    const radius = 400;
    const height = 180;
    const angle = timeRef.current * 0.08;

    camera.position.x = Math.cos(angle) * radius;
    camera.position.z = Math.sin(angle) * radius;
    camera.position.y = height + Math.sin(timeRef.current * 0.15) * 20;

    targetRef.current.lerp(new THREE.Vector3(0, 0, 0), delta * 2);
    camera.lookAt(targetRef.current);
  });

  return null;
}

// ============================================================================
// MAIN INNER COMPONENT
// ============================================================================

export function WarMap3DCanvasInner() {
  const selectedNodeId = useWarMapStore((s) => s.selectedNodeId);
  const nodeMap = React.useMemo(() => new Map(FAKE_NODES.map((n) => [n.id, n])), []);

  return (
    <>
      <color attach="background" args={[COLORS.void]} />

      <FloorGrid />

      <CommandCore />

      {SECTOR_HUBS.map((sector) => (
        <SectorHub key={sector.id} sector={sector} />
      ))}

      {FOG_POSITIONS.map((fog, i) => (
        <FogVolume key={i} fog={fog} />
      ))}

      {SECTOR_HUBS.map((sector) => (
        <Hyperlane
          key={`core-${sector.id}`}
          from={[0, 0, 0] as [number, number, number]}
          to={[sector.position[0], 0, sector.position[2]] as [number, number, number]}
          color={sector.color}
          isActive={true}
        />
      ))}

      {FAKE_NODES.filter(n => n.id !== "command").map((node) => {
        const nodeConnections = node.connections.filter(c =>
          nodeMap.get(c)?.sectorId === node.sectorId || nodeMap.get(c)?.id === "command"
        );
        return nodeConnections.map((connId) => {
          if (node.id > connId) return null;
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
              from={[node.position[0], 0, node.position[2]] as [number, number, number]}
              to={[target.position[0], 0, target.position[2]] as [number, number, number]}
              color={color}
              isActive={isActive}
            />
          );
        });
      })}

      {FAKE_NODES.filter(n => n.id !== "command").map((node) => (
        <GoalNode key={node.id} node={node} />
      ))}

      <CameraController />
    </>
  );
}