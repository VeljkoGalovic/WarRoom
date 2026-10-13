"use client";

import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
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
// SHARED GEOMETRIES & MATERIALS (module level for performance)
// ============================================================================

// Floor grid
const floorGridGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);

// Sphere geometry for nodes
const nodeSphereGeometry = new THREE.SphereGeometry(28, 64, 64);

// Progress ring geometry
const progressRingGeometry = new THREE.RingGeometry(34, 37, 128);

// Core glow geometry
const coreGlowGeometry = new THREE.SphereGeometry(32, 32, 32);

// ============================================================================
// COMPONENTS
// ============================================================================

// Floor Grid - subtle holographic reference plane
function FloorGrid() {
  const gridRef = React.useRef<THREE.Mesh | null>(null);
  const timeRef = React.useRef(0);

  const gridMaterial = React.useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(COLORS.holoCyan) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec3 uColor;

      float grid(vec2 uv, float scale) {
        vec2 r = abs(fract(uv * scale) - 0.5);
        float lines = step(0.49, max(r.x, r.y));
        return lines;
      }

      void main() {
        float g = grid(vUv * 20.0 + uTime * 0.02, 1.0);
        float dist = length(vPosition.xz) / 250.0;
        float alpha = g * (1.0 - dist) * 0.15;
        alpha += sin(vPosition.x * 0.05 + uTime * 0.3) * 0.02 * (1.0 - dist);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (gridRef.current) {
      (gridRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = timeRef.current;
    }
  });

  return (
    <mesh
      ref={gridRef}
      geometry={floorGridGeometry}
      material={gridMaterial}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1, 0] as [number, number, number]}
    />
  );
}

// Tactical Node - Large glowing sphere with progress ring
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
  const intensityMultiplier = isInteractive ? 1.5 : 1.0;

  // Sphere material with emissive glow
  const sphereMaterial = React.useMemo(() => new THREE.MeshPhysicalMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.25 * intensityMultiplier,
    transmission: 0.4,
    thickness: 0.8,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    emissive: new THREE.Color(node.color),
    emissiveIntensity: (node.state === "at-risk" ? 2.5 : node.state === "active" ? 2.0 : 1.5) * intensityMultiplier,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [node.color, node.state, intensityMultiplier]);

  // Progress ring material
  const ringMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  }), [node.color]);

  // Core inner glow
  const coreMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.15 * intensityMultiplier,
    side: THREE.BackSide,
    depthWrite: false,
  }), [node.color, intensityMultiplier]);

  // Particle system for orbiting elements
  const particlesMaterial = React.useMemo(() => new THREE.PointsMaterial({
    color: node.color,
    size: 1.2,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [node.color]);

  // Create orbiting particles
  const particlePositions = React.useMemo(() => {
    const count = node.state === "conquered" ? 12 : node.state === "active" ? 16 : 20;
    const positions = new Float32Array(count * 3);
    const baseRadii: number[] = [];
    const speeds: number[] = [];
    const phases: number[] = [];

    for (let i = 0; i < count; i++) {
      const radius = 38 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      baseRadii.push(radius);
      speeds.push(0.15 + Math.random() * 0.15);
      phases.push(Math.random() * Math.PI * 2);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    return { positions, baseRadii, speeds, phases, count };
  }, [node.state]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Group rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }

    // Sphere pulse
    if (sphereRef.current) {
      const pulse = 1 + Math.sin(timeRef.current * 1.5) * 0.03 * intensityMultiplier;
      sphereRef.current.scale.setScalar(pulse);

      // Rotate sphere slowly
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
        const pulse = 1 + Math.sin(timeRef.current * 2.5) * 0.15;
        core.scale.setScalar(pulse);
        (core.material as THREE.MeshBasicMaterial).opacity = 0.15 * intensityMultiplier * (0.7 + Math.sin(timeRef.current * 3) * 0.3);
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
        geometry={React.useMemo(() => {
          const geom = new THREE.BufferGeometry();
          geom.setAttribute('position', new THREE.BufferAttribute(particlePositions.positions, 3));
          return geom;
        }, [])}
        material={particlesMaterial}
      />

      {/* Core inner glow */}
      <mesh
        name="core-glow"
        geometry={coreGlowGeometry}
        material={coreMaterial}
      />

      {/* Main sphere */}
      <mesh
        ref={sphereRef}
        geometry={nodeSphereGeometry}
        material={sphereMaterial}
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
      />

      {/* Progress ring background (subtle) */}
      <mesh
        geometry={progressRingGeometry}
        material={React.useMemo(() => new THREE.MeshBasicMaterial({
          color: 0x050810,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        }), [])}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* State indicator ring at top */}
      <mesh
        geometry={React.useMemo(() => new THREE.RingGeometry(42, 44, 64), [])}
        material={React.useMemo(() => new THREE.MeshBasicMaterial({
          color: node.color,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        }), [node.color])}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 35, 0] as [number, number, number]}
        scale={1 + Math.sin(timeRef.current * 3) * 0.1}
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

      {/* Selection highlight */}
      {isSelected && (
        <mesh
          geometry={React.useMemo(() => new THREE.RingGeometry(48, 52, 64), [])}
          material={React.useMemo(() => new THREE.MeshBasicMaterial({
            color: node.color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
          }), [node.color])}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={1 + Math.sin(timeRef.current * 4) * 0.15}
        />
      )}
    </group>
  );
});

// Hyperlane - Curved glowing tubes between nodes
function Hyperlane({ from, to, color, isActive }: { from: [number, number, number]; to: [number, number, number]; color: number; isActive: boolean }) {
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

    return new THREE.TubeGeometry(curve, 64, 1.5, 8, false);
  }, [from, to]);

  const tubeMaterial = React.useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: isActive ? 0.6 : 0.35,
    emissive: new THREE.Color(color),
    emissiveIntensity: isActive ? 1.5 : 0.8,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [color, isActive]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Animate tube emissive pulse
    if (tubeRef.current) {
      const pulse = 1 + Math.sin(timeRef.current * 2) * 0.3;
      (tubeRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = (isActive ? 1.5 : 0.8) * pulse;
    }
  });

  return (
    <mesh
      ref={tubeRef}
      geometry={tubeGeometry}
      material={tubeMaterial}
    />
  );
}

// Camera Controller - Cinematic auto-orbit
function CameraController() {
  const { camera } = useThree();
  const timeRef = React.useRef(0);
  const targetRef = React.useRef(new THREE.Vector3(-10, 0, -10));

  useFrame((_, delta) => {
    timeRef.current += delta;
    const radius = 280;
    const height = 120;
    const angle = timeRef.current * 0.04; // Slow cinematic orbit

    // Smooth camera position
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;

    camera.position.lerp(new THREE.Vector3(targetX, height + Math.sin(timeRef.current * 0.08) * 15, targetZ), delta * 1.5);

    // Smooth look-at target
    targetRef.current.lerp(new THREE.Vector3(-10, 0, -10), delta * 2);
    camera.lookAt(targetRef.current);
  });

  return null;
}

// Ambient floating particles for atmosphere
function AmbientParticles() {
  const timeRef = React.useRef(0);
  const pointsRef = React.useRef<THREE.Points | null>(null);

  const particleData = React.useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const speeds = new Float32Array(count);
    const baseY = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3; // Flattened
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = 0.5 + Math.random() * 1.5;
      alphas[i] = 0.1 + Math.random() * 0.4;
      speeds[i] = 0.02 + Math.random() * 0.03;
      baseY[i] = positions[i * 3 + 1];
    }

    return { positions, sizes, alphas, speeds, baseY, count };
  }, []);

  const geometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(particleData.sizes, 1));
    geom.setAttribute('alpha', new THREE.BufferAttribute(particleData.alphas, 1));
    return geom;
  }, []);

  const material = React.useMemo(() => new THREE.PointsMaterial({
    color: COLORS.holoCyan,
    size: 1,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: false,
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const { speeds, baseY, count } = particleData;

      for (let i = 0; i < count; i++) {
        // Slow orbital motion
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const angle = Math.atan2(z, x) + delta * speeds[i];
        const radius = Math.sqrt(x * x + z * z);

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // Vertical drift
        positions[i * 3 + 1] = baseY[i] + Math.sin(timeRef.current * speeds[i] * 10 + i) * 5;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;

      pointsRef.current.rotation.y += delta * 0.002;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ============================================================================
// MAIN INNER COMPONENT
// ============================================================================

export function WarMap3DCanvasInner() {
  const { selectedNodeId, hoveredNodeId, setHoveredNode, setSelectedNode } = useWarMapStore(
    (s) => ({
      selectedNodeId: s.selectedNodeId,
      hoveredNodeId: s.hoveredNodeId,
      setHoveredNode: s.setHoveredNode,
      setSelectedNode: s.setSelectedNode,
    })
  );

  return (
    <>
      {/* Background - Deep Void */}
      <color attach="background" args={[COLORS.void]} />

      {/* Ambient Atmosphere Particles */}
      <AmbientParticles />

      {/* Floor Grid */}
      <FloorGrid />

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

      {/* Camera Controller */}
      <CameraController />
    </>
  );
}