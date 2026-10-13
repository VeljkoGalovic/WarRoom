"use client";

import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Grid } from "@react-three/drei";
import * as THREE from "three";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";

// ============================================================================
// CONSTANTS - Design spec palette
// ============================================================================

const COLORS = {
  void: 0x050810,
  holoCyan: 0x4dd8e8,
  progressAmber: 0xffb347,
  conquestGreen: 0x2ecc71,
  threatRed: 0xff4d5e,
};

// ============================================================================
// TACTICAL NODES - Three primary objectives matching proof of concept
// ============================================================================

type NodeState = "conquered" | "active" | "at-risk";

interface TacticalNodeData {
  id: string;
  name: string;
  state: NodeState;
  progress: number;
  position: [number, number, number];
  color: number;
  description: string;
}

const TACTICAL_NODES: TacticalNodeData[] = [
  {
    id: "tactical-physical",
    name: "TACTICAL PHYSICAL",
    state: "conquered",
    progress: 100,
    position: [-80, 0, -60],
    color: COLORS.conquestGreen,
    description: "Physical conditioning sector — All benchmarks exceeded. Strength, endurance, and mobility targets secured.",
  },
  {
    id: "deploy-war",
    name: "DEPLOY WAR",
    state: "active",
    progress: 67,
    position: [60, 0, -40],
    color: COLORS.progressAmber,
    description: "War Room deployment pipeline — CI/CD active. Vercel build passing. Edge functions propagating.",
  },
  {
    id: "reach-codeforces",
    name: "REACH CODEFORCES",
    state: "at-risk",
    progress: 23,
    position: [-10, 0, 70],
    color: COLORS.threatRed,
    description: "Codeforces rating push — Signal degraded. Contest performance inconsistent. Intervention required.",
  },
];

// ============================================================================
// SHARED GEOMETRIES (module level for performance)
// ============================================================================

const nodeSphereGeometry = new THREE.SphereGeometry(28, 64, 64);
const progressRingGeometry = new THREE.RingGeometry(34, 37, 128);
const coreGlowGeometry = new THREE.SphereGeometry(32, 32, 32);

// ============================================================================
// INFINITE GRID - Using Drei's Grid component
// ============================================================================

function InfiniteGrid() {
  return (
    <Grid
      args={[4000, 400]}
      cellColor="#082028"
      cellSize={50}
      cellThickness={0.5}
      fadeDistance={2000}
      fadeStrength={0.5}
      infiniteGrid={true}
      position={[0, 0, 0]}
      sectionColor="#0f3844"
      sectionSize={200}
      sectionThickness={1}
      raycast={() => {}}
    />
  );
}

// ============================================================================
// AMBIENT PARTICLES - Atmospheric depth particles
// ============================================================================

function AmbientParticles() {
  const particlesRef = React.useRef<THREE.Points | null>(null);
  const timeRef = React.useRef(0);

  const { positions, colors, sizes } = React.useMemo(() => {
    const count = 400; // Reduced from 800
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorOptions = [
      new THREE.Color(COLORS.holoCyan),
      new THREE.Color(COLORS.progressAmber),
      new THREE.Color(COLORS.conquestGreen),
      new THREE.Color(0x8899aa),
    ];

    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color.r * 0.6; // Darker particles
      colors[i * 3 + 1] = color.g * 0.6;
      colors[i * 3 + 2] = color.b * 0.6;

      sizes[i] = 0.3 + Math.random() * 1.5; // Smaller
    }

    return { positions, colors, sizes };
  }, []);

  const particleGeometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geom;
  }, []);

  const particleMaterial = React.useMemo(() => new THREE.PointsMaterial({
    size: 1,
    transparent: true,
    opacity: 0.25,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += delta * 0.3 * (0.5 + Math.sin(timeRef.current + i) * 0.5);
        if (pos[i * 3 + 1] > 100) pos[i * 3 + 1] = -100;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += delta * 0.005;
    }
  });

  return <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} raycast={() => {}} />;
}

// ============================================================================
// HYPERLANES - Curved glowing tubes between tactical nodes
// ============================================================================

function Hyperlane({ from, to, color, isActive }: {
  from: [number, number, number];
  to: [number, number, number];
  color: number;
  isActive: boolean
}) {
  const timeRef = React.useRef(0);
  const tubeRef = React.useRef<THREE.Mesh | null>(null);

  const tubeGeometry = React.useMemo(() => {
    const midX = (from[0] + to[0]) / 2;
    const midY = 25; // Arc height
    const midZ = (from[2] + to[2]) / 2;

    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(from[0], midY, from[2]),
      new THREE.Vector3(to[0], midY, to[2]),
      new THREE.Vector3(...to)
    );

    const geometry = new THREE.TubeGeometry(curve, 64, 1.2, 8, false);
    return geometry;
  }, [from, to]);

  const tubeMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: isActive ? 0.35 : 0.1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }), [color, isActive]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (tubeRef.current) {
      const opacity = isActive ? 0.3 + Math.sin(timeRef.current * 3) * 0.1 : 0.08;
      (tubeRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return <mesh ref={tubeRef} geometry={tubeGeometry} material={tubeMaterial} raycast={() => {}} />;
}

// ============================================================================
// TACTICAL NODE - Large glowing sphere with progress ring
// ============================================================================

const TacticalNode = React.memo(function TacticalNode({
  node,
  onSelect,
  onHover,
  isSelected,
  isHovered
}: {
  node: TacticalNodeData;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const timeRef = React.useRef(0);
  const groupRef = React.useRef<THREE.Group | null>(null);
  const sphereRef = React.useRef<THREE.Mesh | null>(null);
  const ringRef = React.useRef<THREE.Mesh | null>(null);
  const particlesRef = React.useRef<THREE.Points | null>(null);
  const { camera } = useThree();

  const isInteractive = isSelected || isHovered;
  const intensityMultiplier = isInteractive ? 1.3 : 1.0;

  // Sphere material with emissive glow
  const sphereMaterial = React.useMemo(() => new THREE.MeshPhysicalMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.15 * intensityMultiplier,
    transmission: 0.3,
    thickness: 0.8,
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: new THREE.Color(node.color),
    emissiveIntensity: (node.state === "at-risk" ? 1.6 : node.state === "active" ? 1.4 : 1.0) * intensityMultiplier,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [node.color, node.state, intensityMultiplier]);

  // Progress ring material
  const ringMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  }), [node.color]);

  // Core inner glow
  const coreMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.1 * intensityMultiplier,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [node.color, intensityMultiplier]);

  // Particle system for orbiting elements
  const particlesMaterial = React.useMemo(() => new THREE.PointsMaterial({
    color: node.color,
    size: 1.2,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [node.color]);

  // Create orbiting particles
  const particlePositions = React.useMemo(() => {
    const count = node.state === "conquered" ? 14 : node.state === "active" ? 18 : 22;
    const positions = new Float32Array(count * 3);
    const baseRadii: number[] = [];
    const speeds: number[] = [];
    const phases: number[] = [];

    for (let i = 0; i < count; i++) {
      const radius = 38 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      baseRadii.push(radius);
      speeds.push(0.12 + Math.random() * 0.18);
      phases.push(Math.random() * Math.PI * 2);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    return { positions, baseRadii, speeds, phases, count };
  }, [node.state]);

  // Particle geometry
  const particleGeometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(particlePositions.positions, 3));
    return geom;
  }, []);

  // Selection highlight geometry & material (stable references)
  const selectionRingGeometry = React.useMemo(() => new THREE.RingGeometry(48, 52, 64), []);
  const selectionRingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [node.color]);

  // Progress ring background material
  const progressRingBgMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x050810,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  // State indicator ring geometry & material
  const stateRingGeometry = React.useMemo(() => new THREE.RingGeometry(42, 44, 64), []);
  const stateRingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [node.color]);

  // Animation frame
  useFrame((_, delta) => {
    timeRef.current += delta;

    // Sphere rotation
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.05;
      sphereRef.current.rotation.x += delta * 0.03;
    }

    // Progress ring rotation & pulse
    if (ringRef.current) {
      ringRef.current.rotation.x = -Math.PI / 2;
      ringRef.current.rotation.z = -timeRef.current * 0.15;
      const pulse = 1 + Math.sin(timeRef.current * 2) * 0.05;
      ringRef.current.scale.setScalar(pulse);
    }

    // Core glow pulse
    if (groupRef.current) {
      const core = groupRef.current.getObjectByName("core-glow");
      if (core) {
        const pulse = 1 + Math.sin(timeRef.current * 2.5) * 0.18;
        core.scale.setScalar(pulse);
        (core.material as THREE.MeshBasicMaterial).opacity = 0.2 * intensityMultiplier * (0.6 + Math.sin(timeRef.current * 3) * 0.4);
      }
    }

    // Animate particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const { baseRadii, speeds, phases, count } = particlePositions;

      for (let i = 0; i < count; i++) {
        const t = timeRef.current * speeds[i] + phases[i];
        const radius = baseRadii[i];
        const theta = t;
        const phi = Math.PI / 2 + Math.sin(t * 0.7 + i) * 0.4;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += delta * 0.02;
    }
  });

  const handlePointerOver = () => onHover(true);
  const handlePointerOut = () => onHover(false);
  const handleClick = () => onSelect();

  return (
    <group
      ref={groupRef}
      position={node.position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      style={{ cursor: isInteractive ? "pointer" : "default" }}
    >
      {/* Outer particle cloud */}
      <points
        ref={particlesRef}
        geometry={particleGeometry}
        material={particlesMaterial}
        raycast={() => {}}
      />

      {/* Core inner glow */}
      <mesh
        name="core-glow"
        geometry={coreGlowGeometry}
        material={coreMaterial}
        raycast={() => {}}
      />

      {/* Main sphere */}
      <mesh
        ref={sphereRef}
        geometry={nodeSphereGeometry}
        material={sphereMaterial}
        raycast={() => {}}
      />

      {/* Progress ring - shows exact percentage via arc */}
      <mesh
        ref={ringRef}
        geometry={progressRingGeometry}
        material={ringMaterial}
        scale={[
          1,
          1,
          Math.max(0.02, node.progress / 100)
        ] as [number, number, number]}
        raycast={() => {}}
      />

      {/* Progress ring background (subtle) */}
      <mesh
        geometry={progressRingGeometry}
        material={progressRingBgMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => {}}
      />

      {/* State indicator ring at top */}
      <mesh
        geometry={stateRingGeometry}
        material={stateRingMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 35, 0] as [number, number, number]}
        scale={1 + Math.sin(timeRef.current * 3) * 0.1}
        raycast={() => {}}
      />

      {/* Node Label - HTML overlay for crisp text */}
      <Html
        position={[0, -42, 0] as [number, number, number]}
        occlude={false}
        scaleFactor={0.5}
        transform={true}
        sprite={false}
      >
        <div style={{
          textAlign: "center",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          whiteSpace: "nowrap",
        }}>
          <div style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: `#${node.color.toString(16).padStart(6, '0')}`,
            textShadow: `0 0 16px #${node.color.toString(16).padStart(6, '0')}`,
            marginBottom: "4px",
          }}>
            {node.name}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            color: "#8B9CB3",
          }}>
            <div style={{
              width: "48px",
              height: "3px",
              background: "rgba(77, 216, 232, 0.2)",
              borderRadius: "2px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${node.progress}%`,
                height: "100%",
                background: `linear-gradient(90deg, #${node.color.toString(16).padStart(6, '0')}, #${node.color.toString(16).padStart(6, '0')}80)`,
                borderRadius: "2px",
                boxShadow: `0 0 8px #${node.color.toString(16).padStart(6, '0')}`,
                transition: "width 0.5s ease-out",
              }} />
            </div>
            <span style={{ fontWeight: 600, color: `#${node.color.toString(16).padStart(6, '0')}`, minWidth: "40px" }}>
              {node.progress}%
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "1px 6px",
                borderRadius: "2px",
                background: `${node.color}20`,
                border: `1px solid ${node.color}60`,
                color: `#${node.color.toString(16).padStart(6, '0')}`,
              }}
            >
              {node.state.toUpperCase()}
            </span>
          </div>
        </div>
      </Html>

      {/* Selection highlight - stable geometry/material */}
      {isSelected && (
        <mesh
          geometry={selectionRingGeometry}
          material={selectionRingMaterial}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={1 + Math.sin(timeRef.current * 4) * 0.15}
          raycast={() => {}}
        />
      )}
    </group>
  );
});

// ============================================================================
// CAMERA CONTROLLER - Cinematic auto-orbit with smooth damping
// ============================================================================

function CameraController() {
  const { camera } = useThree();
  const { cameraTarget, isAnimating, setCameraTarget } = useWarMapStore(
    useShallow((s) => ({
      cameraTarget: s.cameraTarget,
      isAnimating: s.isAnimating,
      setCameraTarget: s.setCameraTarget,
    }))
  );

  const timeRef = React.useRef(0);
  const targetRef = React.useRef(new THREE.Vector3(0, 0, 0));
  const radiusRef = React.useRef(350);
  const phiRef = React.useRef(Math.PI / 3);
  const thetaRef = React.useRef(0);
  const autoRotateRef = React.useRef(true);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Smoothly interpolate to target if animating
    if (isAnimating) {
      targetRef.current.lerp(cameraTarget, 0.05);
      if (targetRef.current.distanceTo(cameraTarget) < 1) {
        setCameraTarget(cameraTarget, false);
      }
    }

    // Auto-rotate when not animating
    if (autoRotateRef.current && !isAnimating) {
      thetaRef.current += delta * 0.15;
    }

    // Calculate camera position from spherical coordinates
    const x = targetRef.current.x + radiusRef.current * Math.sin(phiRef.current) * Math.cos(thetaRef.current);
    const y = targetRef.current.y + radiusRef.current * Math.cos(phiRef.current);
    const z = targetRef.current.z + radiusRef.current * Math.sin(phiRef.current) * Math.sin(thetaRef.current);

    // Smooth camera movement
    camera.position.lerp(new THREE.Vector3(x, y, z), 0.08);
    camera.lookAt(targetRef.current);
  });

  return null;
}

// ============================================================================
// MAIN INNER CANVAS
// ============================================================================

export function WarMap3DCanvasInner() {
  const selectedNodeId = useWarMapStore(useShallow((s) => s.selectedNodeId));
  const hoveredNodeId = useWarMapStore(useShallow((s) => s.hoveredNodeId));
  const setHoveredNode = useWarMapStore(useShallow((s) => s.setHoveredNode));
  const setSelectedNode = useWarMapStore(useShallow((s) => s.setSelectedNode));

  return (
    <>
      {/* Background - Deep Void with subtle gradient */}
      <color attach="background" args={[COLORS.void]} />

      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={[COLORS.void, 50, 800]} />

      {/* Infinite Grid - replaces finite floor grid */}
      <InfiniteGrid />

      {/* Ambient Atmosphere Particles */}
      <AmbientParticles />

      {/* Hyperlanes - Connections between tactical nodes */}
      <Hyperlane
        from={TACTICAL_NODES[0].position}
        to={TACTICAL_NODES[1].position}
        color={COLORS.progressAmber}
        isActive={true}
      />
      <Hyperlane
        from={TACTICAL_NODES[1].position}
        to={TACTICAL_NODES[2].position}
        color={COLORS.threatRed}
        isActive={true}
      />
      <Hyperlane
        from={TACTICAL_NODES[2].position}
        to={TACTICAL_NODES[0].position}
        color={COLORS.holoCyan}
        isActive={false}
      />

      {/* Tactical Nodes */}
      {TACTICAL_NODES.map((node) => (
        <TacticalNode
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          isHovered={hoveredNodeId === node.id}
          onSelect={() => setSelectedNode(node.id)}
          onHover={(hovered) => setHoveredNode(hovered ? node.id : null)}
        />
      ))}

      {/* Camera Controller removed - OrbitControls in WarMap3DCanvas handles navigation */}
      {/* <CameraController /> */}
    </>
  );
}