"use client";

import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Grid, DragControls } from "@react-three/drei";
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

// Wireframe/grid overlay geometries for holographic effect
const wireframeSphereGeometry = new THREE.SphereGeometry(29, 24, 24); // Slightly larger for overlay
const wireframeEdgesGeometry = new THREE.EdgesGeometry(wireframeSphereGeometry);
const latitudeLinesGeometry = new THREE.SphereGeometry(28.5, 32, 16); // For latitude rings

// Orbital ring geometries - thinner, multi-layered
const orbitalRingGeometries = [
  new THREE.TorusGeometry(36, 0.4, 8, 64),  // Inner ring
  new THREE.TorusGeometry(40, 0.3, 8, 64),  // Middle ring
  new THREE.TorusGeometry(44, 0.25, 8, 64), // Outer ring
];

// Satellite marker geometry
const satelliteGeometry = new THREE.SphereGeometry(1.2, 16, 16);

// ============================================================================
// CENTRAL HOLO-EMITTER BASE & PROJECTOR LIGHTING
// ============================================================================

function HoloEmitterBase() {
  const timeRef = React.useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  // Industrial projector base - stacked hexagonal plates with cylindrical core
  return (
    <group position={[0, 0, 0]} raycast={() => {}}>
      {/* Base platform - large hexagonal plate */}
      <mesh
        geometry={new THREE.CylinderGeometry(22, 24, 3, 6)}
        position={[0, 1.5, 0]}
        material={new THREE.MeshStandardMaterial({
          color: 0x1a1f2e,
          metalness: 0.9,
          roughness: 0.2,
          emissive: 0x0a1a2a,
          emissiveIntensity: 0.3,
        })}
        raycast={() => {}}
      />

      {/* Middle section - tapered hexagonal core */}
      <mesh
        geometry={new THREE.CylinderGeometry(14, 18, 8, 6)}
        position={[0, 7, 0]}
        material={new THREE.MeshStandardMaterial({
          color: 0x121826,
          metalness: 0.9,
          roughness: 0.15,
          emissive: 0x081828,
          emissiveIntensity: 0.4,
        })}
        raycast={() => {}}
      />

      {/* Upper housing - projector array */}
      <mesh
        geometry={new THREE.CylinderGeometry(10, 14, 6, 6)}
        position={[0, 14, 0]}
        material={new THREE.MeshStandardMaterial({
          color: 0x0d1420,
          metalness: 0.95,
          roughness: 0.1,
          emissive: 0x082030,
          emissiveIntensity: 0.5,
        })}
        raycast={() => {}}
      />

      {/* Emitter lens - glowing aperture at top */}
      <mesh
        geometry={new THREE.CylinderGeometry(8, 8, 1, 6)}
        position={[0, 17.5, 0]}
        material={new THREE.MeshStandardMaterial({
          color: 0x083040,
          metalness: 0.5,
          roughness: 0.05,
          emissive: COLORS.holoCyan,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.8,
        })}
        raycast={() => {}}
      />

      {/* Rotating detail rings on middle section - horizontal (XZ plane) */}
      <group rotation={[-Math.PI / 2, timeRef.current * 0.3, 0]}>
        <mesh
          geometry={new THREE.TorusGeometry(16, 0.3, 4, 32)}
          position={[0, 6.5, 0]}
          material={new THREE.MeshBasicMaterial({
            color: COLORS.holoCyan,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
          })}
          raycast={() => {}}
        />
        <mesh
          geometry={new THREE.TorusGeometry(18, 0.2, 4, 32)}
          position={[0, 7.5, 0]}
          material={new THREE.MeshBasicMaterial({
            color: COLORS.progressAmber,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
          })}
          raycast={() => {}}
        />
      </group>

      {/* Accent strips on upper housing - pulsing glow lines */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          geometry={new THREE.BoxGeometry(0.4, 4, 0.2)}
          position={[
            12 * Math.cos((i / 6) * Math.PI * 2),
            14,
            12 * Math.sin((i / 6) * Math.PI * 2)
          ]}
          material={new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? COLORS.holoCyan : COLORS.progressAmber,
            transparent: true,
            opacity: 0.4 + Math.sin(timeRef.current * 2 + i) * 0.2,
          })}
          raycast={() => {}}
        />
      ))}
    </group>
  );
}

// Upward volumetric light beam from emitter
function EmitterLightBeam() {
  const timeRef = React.useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <group position={[0, 18, 0]} raycast={() => {}}>
      {/* Main light cone - semi-transparent cylinder gradient */}
      <mesh
        geometry={new THREE.CylinderGeometry(0.5, 18, 80, 8, 1, true)}
        position={[0, 40, 0]}
        material={new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.04,
          side: THREE.DoubleSide,
          depthWrite: false,
        })}
        raycast={() => {}}
      />

      {/* Inner tighter beam */}
      <mesh
        geometry={new THREE.CylinderGeometry(0.3, 10, 60, 8, 1, true)}
        position={[0, 30, 0]}
        material={new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.06,
          side: THREE.DoubleSide,
          depthWrite: false,
        })}
        raycast={() => {}}
      />

      {/* Core beam - brightest center */}
      <mesh
        geometry={new THREE.CylinderGeometry(0.2, 4, 40, 8, 1, true)}
        position={[0, 20, 0]}
        material={new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.08,
          side: THREE.DoubleSide,
          depthWrite: false,
        })}
        raycast={() => {}}
      />

      {/* Particle sparkles rising in beam */}
      <points
        geometry={(() => {
          const geom = new THREE.BufferGeometry();
          const count = 150;
          const positions = new Float32Array(count * 3);
          const sizes = new Float32Array(count);
          const colors = new Float32Array(count * 3);

          for (let i = 0; i < count; i++) {
            const h = Math.random() * 80;
            const r = (h / 80) * 18 * 0.5;
            const theta = Math.random() * Math.PI * 2;
            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = h;
            positions[i * 3 + 2] = r * Math.sin(theta);
            sizes[i] = 0.15 + Math.random() * 0.3;
            const c = new THREE.Color(0x38bdf8);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
          }

          geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
          geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          return geom;
        })()}
        material={new THREE.PointsMaterial({
          size: 0.3,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })}
        raycast={() => {}}
      />
    </group>
  );
}

// ============================================================================
// INFINITE GRID - Using Drei's Grid component with Topological Contours & Sector Labels
// ============================================================================

// Pre-compute contour ring configurations
const CONTOUR_RINGS = [
  { baseRadius: 100, color: COLORS.holoCyan, speed: 0.5, phase: 0, thickness: 2 },
  { baseRadius: 250, color: COLORS.progressAmber, speed: 0.5, phase: 0.8, thickness: 2 },
  { baseRadius: 400, color: COLORS.conquestGreen, speed: 0.5, phase: 1.6, thickness: 2 },
  { baseRadius: 550, color: COLORS.holoCyan, speed: 0.5, phase: 2.4, thickness: 2 },
  { baseRadius: 700, color: COLORS.progressAmber, speed: 0.5, phase: 3.2, thickness: 2 },
  { baseRadius: 850, color: COLORS.conquestGreen, speed: 0.5, phase: 4.0, thickness: 2 },
  { baseRadius: 1000, color: COLORS.holoCyan, speed: 0.5, phase: 4.8, thickness: 2 },
  { baseRadius: 1150, color: COLORS.progressAmber, speed: 0.5, phase: 5.6, thickness: 2 },
  { baseRadius: 1300, color: COLORS.conquestGreen, speed: 0.5, phase: 6.4, thickness: 2 },
  { baseRadius: 1450, color: COLORS.holoCyan, speed: 0.5, phase: 7.2, thickness: 2 },
];

const FINE_CONTOUR_RINGS = Array.from({ length: 20 }, (_, i) => ({
  baseRadius: 50 + i * 75,
  color: 0x4dd8e8,
  speed: 0.4,
  phase: i * 0.5,
  thickness: 1,
}));

// Static sector labels - separate component to avoid re-renders from useFrame
function SectorLabels() {
  return (
    <group position={[0, 0.4, 0]} raycast={() => {}}>
      {/* DSA SECTOR - near command center */}
      <Html
        position={[0, 0, 0]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(12)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '28px',
          fontWeight: 600,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#4DD8E8',
          opacity: 0.15,
          textShadow: '0 0 20px #4DD8E8',
          whiteSpace: 'nowrap',
        }}>
          DSA SECTOR
        </div>
      </Html>

      {/* SECTOR 01 - near tactical physical node */}
      <Html
        position={[-100, 0, -80]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(10)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#2ECC71',
          opacity: 0.12,
          textShadow: '0 0 16px #2ECC71',
          whiteSpace: 'nowrap',
        }}>
          SECTOR 01
        </div>
      </Html>

      {/* OPTIMIZATION ZONE - near deploy war node */}
      <Html
        position={[80, 0, -60]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(10)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '22px',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#FFB347',
          opacity: 0.12,
          textShadow: '0 0 16px #FFB347',
          whiteSpace: 'nowrap',
        }}>
          OPTIMIZATION ZONE
        </div>
      </Html>

      {/* THREAT SECTOR - near reach codeforces node */}
      <Html
        position={[-140, 0, 100]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(10)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '22px',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#FF4D5E',
          opacity: 0.1,
          textShadow: '0 0 16px #FF4D5E',
          whiteSpace: 'nowrap',
        }}>
          THREAT SECTOR
        </div>
      </Html>

      {/* EXPANSION FRONTIER - far edge */}
      <Html
        position={[200, 0, 180]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(10)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '20px',
          fontWeight: 400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#8899AA',
          opacity: 0.08,
          textShadow: '0 0 12px #8899AA',
          whiteSpace: 'nowrap',
        }}>
          EXPANSION FRONTIER
        </div>
      </Html>

      {/* GRID COORDINATE MARKERS - corner markers */}
      <Html
        position={[-400, 0, -400]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(8)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '18px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4DD8E8',
          opacity: 0.06,
          whiteSpace: 'nowrap',
        }}>
          [ -400, -400 ]
        </div>
      </Html>

      <Html
        position={[400, 0, -400]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(8)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '18px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4DD8E8',
          opacity: 0.06,
          whiteSpace: 'nowrap',
        }}>
          [ 400, -400 ]
        </div>
      </Html>

      <Html
        position={[-400, 0, 400]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(8)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '18px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4DD8E8',
          opacity: 0.06,
          whiteSpace: 'nowrap',
        }}>
          [ -400, 400 ]
        </div>
      </Html>

      <Html
        position={[400, 0, 400]}
        occlude={false}
        transform={true}
        sprite={false}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotateX(90deg) scale(8)',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '18px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4DD8E8',
          opacity: 0.06,
          whiteSpace: 'nowrap',
        }}>
          [ 400, 400 ]
        </div>
      </Html>
    </group>
  );
}

function InfiniteGrid() {
  const timeRef = React.useRef(0);
  const { scene } = useThree();
  const contourRefs = React.useRef<(THREE.Mesh | null)[]>([]);
  const fineContourRefs = React.useRef<(THREE.Mesh | null)[]>([]);

  // Create contour ring meshes once
  const contourMeshes = React.useMemo(() => {
    return CONTOUR_RINGS.map((config, i) => {
      const geom = new THREE.RingGeometry(config.baseRadius - config.thickness / 2, config.baseRadius + config.thickness / 2, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.12 - i * 0.01,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 1;
      return mesh;
    });
  }, []);

  const fineContourMeshes = React.useMemo(() => {
    return FINE_CONTOUR_RINGS.map((config) => {
      const geom = new THREE.RingGeometry(config.baseRadius - config.thickness / 2, config.baseRadius + config.thickness / 2, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 1;
      return mesh;
    });
  }, []);

  // Animate contour rings in useFrame - no geometry/material recreation
  useFrame((_, delta) => {
    timeRef.current += delta;

    // Animate main contour rings - pulse radius via scale and opacity
    contourMeshes.forEach((mesh, i) => {
      const config = CONTOUR_RINGS[i];
      const pulseScale = 1 + Math.sin(timeRef.current * config.speed + config.phase) * 0.04; // ~4% scale pulse
      const pulseOpacity = Math.max(0.02, (0.12 - i * 0.01) + Math.sin(timeRef.current * 0.3 + config.phase) * 0.03);

      mesh.scale.setScalar(pulseScale);
      (mesh.material as THREE.MeshBasicMaterial).opacity = pulseOpacity;
    });

    // Animate fine contour rings - opacity pulse only
    fineContourMeshes.forEach((mesh, i) => {
      const config = FINE_CONTOUR_RINGS[i];
      const pulseOpacity = 0.04 + Math.sin(timeRef.current * config.speed + config.phase) * 0.02;
      (mesh.material as THREE.MeshBasicMaterial).opacity = pulseOpacity;
    });
  });

  return (
    <group raycast={() => {}}>
      {/* Base Infinite Grid from Drei - followCamera instead of infiniteGrid:
          infiniteGrid multiplies vertex coords by (1 + fadeDistance) in the
          shader (~2.4M units), and float32 interpolation error at that
          magnitude makes lines jiggle ~1px during camera motion. followCamera
          keeps varying values small; the line pattern stays world-anchored. */}
      <Grid
        args={[2400, 2400]}
        cellColor="#082028"
        cellSize={50}
        cellThickness={0.8}
        fadeDistance={1000}
        fadeStrength={1}
        followCamera={true}
        position={[0, 0.1, 0]}
        sectionColor="#0f3844"
        sectionSize={200}
        sectionThickness={1.2}
        raycast={() => {}}
      />

      {/* Topological Contour Lines - Pre-created meshes animated via useFrame */}
      <group position={[0, 0.25, 0]} raycast={() => {}}>
        {contourMeshes.map((mesh, i) => (
          <group key={`contour-${i}`} raycast={() => {}}>
            <mesh geometry={mesh.geometry} material={mesh.material} raycast={() => {}} />
          </group>
        ))}
        {fineContourMeshes.map((mesh, i) => (
          <group key={`contour-fine-${i}`} raycast={() => {}}>
            <mesh geometry={mesh.geometry} material={mesh.material} raycast={() => {}} />
          </group>
        ))}
      </group>

      {/* Sector Ground Labels - HUD text tags on floor grid (static - no useFrame) */}
      <SectorLabels />
    </group>
  );
}

// ============================================================================
// AMBIENT PARTICLES - Atmospheric Particle Field
// ============================================================================

function AmbientParticles() {
  const particlesRef = React.useRef<THREE.Points | null>(null);
  const timeRef = React.useRef(0);

  // Main ambient particle field - wide distribution, slow drift
  const { particleGeometry, particleVelocities } = React.useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    const colorOptions = [
      new THREE.Color(COLORS.holoCyan),
      new THREE.Color(COLORS.progressAmber),
      new THREE.Color(COLORS.conquestGreen),
      new THREE.Color(0x8899aa),
    ];

    for (let i = 0; i < count; i++) {
      // Spherical distribution around node cluster
      const radius = 80 + Math.random() * 350;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color.r * 0.4;
      colors[i * 3 + 1] = color.g * 0.4;
      colors[i * 3 + 2] = color.b * 0.4;

      sizes[i] = 0.2 + Math.random() * 0.8;

      // Slow, gentle drift velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.08;
      velocities[i * 3 + 1] = 0.05 + Math.random() * 0.15; // Upward bias
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    // velocity stored in ref, not as geometry attribute (avoids Three.js buffer upload issues)

    return { particleGeometry: geom, particleVelocities: velocities };
  }, []);

  // Store velocities in ref for animation
  const particleVelocitiesRef = React.useRef(particleVelocities);

  const particleMaterial = React.useMemo(() => new THREE.PointsMaterial({
    size: 1,
    transparent: true,
    opacity: 0.35,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Update main ambient particles
    const posAttr = particlesRef.current?.geometry?.attributes?.position;
    const velocities = particleVelocitiesRef.current;
    const particles = particlesRef.current;
    if (posAttr?.array && velocities && particles) {
      const pos = posAttr.array as Float32Array;
      const vel = velocities;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        // Apply velocity with subtle turbulence
        const turbulence = Math.sin(timeRef.current * 0.5 + i * 0.1) * 0.02;
        pos[i * 3] += vel[i * 3] + turbulence;
        pos[i * 3 + 1] += vel[i * 3 + 1];
        pos[i * 3 + 2] += vel[i * 3 + 2] + turbulence;

        // Wrap around when too high
        if (pos[i * 3 + 1] > 120) {
          pos[i * 3 + 1] = -80;
          pos[i * 3] = (Math.random() - 0.5) * 600;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 600;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += delta * 0.002;
    }
  });

  return (
    <group raycast={() => {}}>
      {/* Main ambient particle field */}
      <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} raycast={() => {}} />
    </group>
  );
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
  const flowParticlesRef = React.useRef<THREE.Points | null>(null);

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

  // Flowing energy particles along the tube path
  const flowGeometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const count = 60;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const progress = new Float32Array(count);
    const phases = new Float32Array(count);

    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(from[0], 25, from[2]),
      new THREE.Vector3(to[0], 25, to[2]),
      new THREE.Vector3(...to)
    );

    for (let i = 0; i < count; i++) {
      const p = i / count;
      const point = curve.getPoint(p);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      sizes[i] = 0.8 + Math.random() * 1.2;
      progress[i] = p;
      phases[i] = Math.random() * Math.PI * 2;

      const c = new THREE.Color(color);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // progress and phase stored in refs
    return geom;
  }, [from, to, color]);

  // Store flow particle progress, size, phase in refs for animation
  const flowProgressRef = React.useRef(new Float32Array(60));
  const flowPhasesRef = React.useRef(new Float32Array(60));
  const flowSizesRef = React.useRef(new Float32Array(60));

  // Initialize refs on first render
  React.useEffect(() => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(from[0], 25, from[2]),
      new THREE.Vector3(to[0], 25, to[2]),
      new THREE.Vector3(...to)
    );
    for (let i = 0; i < 60; i++) {
      const p = i / 60;
      flowProgressRef.current[i] = p;
      flowPhasesRef.current[i] = Math.random() * Math.PI * 2;
      flowSizesRef.current[i] = 0.8 + Math.random() * 1.2;
    }
  }, [from, to]);

  const flowMaterial = React.useMemo(() => new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

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

    // Pulse tube opacity
    if (tubeRef.current) {
      const opacity = isActive ? 0.3 + Math.sin(timeRef.current * 3) * 0.1 : 0.08;
      (tubeRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }

    // Animate flow particles - move along curve from source to target
    const flowPosAttr = flowParticlesRef.current?.geometry?.attributes?.position;
    const flowProgress = flowProgressRef.current;
    const flowPhases = flowPhasesRef.current;
    const flowSizes = flowSizesRef.current;
    if (flowPosAttr?.array && flowProgress && flowPhases && flowSizes && isActive) {
      const positions = flowPosAttr.array as Float32Array;
      const progressAttr = flowProgress;
      const sizeAttr = flowSizes;
      const phaseAttr = flowPhases;
      const count = positions.length / 3;

      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(...from),
        new THREE.Vector3(from[0], 25, from[2]),
        new THREE.Vector3(to[0], 25, to[2]),
        new THREE.Vector3(...to)
      );

      for (let i = 0; i < count; i++) {
        // Move particle along curve
        let p = progressAttr[i] + delta * 0.15; // Flow speed
        if (p > 1) p -= 1; // Loop back to start
        progressAttr[i] = p;

        const point = curve.getPoint(p);
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;

        // Pulse size based on position and phase
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 8 + phaseAttr[i] + p * Math.PI * 4);
        sizeAttr[i] = (0.8 + pulse * 1.2) * (1 - Math.abs(p - 0.5) * 0.5); // Brighter in middle
      }

      const flowParticles = flowParticlesRef.current;
      if (flowParticles) {
        flowParticles.geometry.attributes.position.needsUpdate = true;
        flowParticles.geometry.attributes.size.needsUpdate = true;
      }
    }
  });

  return (
    <group raycast={() => {}}>
      {/* Main tube - the energy beam structure */}
      <mesh ref={tubeRef} geometry={tubeGeometry} material={tubeMaterial} raycast={() => {}} />

      {/* Flowing energy particles traveling along the tube */}
      {isActive && (
        <points ref={flowParticlesRef} geometry={flowGeometry} material={flowMaterial} raycast={() => {}} />
      )}

      {/* Secondary glow tube - wider, more subtle for volume */}
      {isActive && (
        <mesh
          geometry={tubeGeometry}
          material={new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.08 + Math.sin(timeRef.current * 2) * 0.04,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          })}
          scale={[1.8, 1.8, 1]}
          raycast={() => {}}
        />
      )}
    </group>
  );
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
  const { nodes: storeNodes, setNodes } = useWarMapStore(useShallow((s) => ({
    nodes: s.nodes,
    setNodes: s.setNodes,
  })));

  // Track the initial position when drag starts
  const initialPositionRef = React.useRef<[number, number, number] | null>(null);

  const handleDragStart = React.useCallback(() => {
    initialPositionRef.current = [...node.position] as [number, number, number];
  }, [node.position]);

  const handleDragEnd = React.useCallback(async () => {
    // Get the new position from the group ref
    const newPosition = groupRef.current?.position;
    if (newPosition && initialPositionRef.current) {
      const [x, y, z] = [newPosition.x, newPosition.y, newPosition.z] as [number, number, number];

      // Check if position actually changed
      const [initX, initY, initZ] = initialPositionRef.current;
      if (Math.abs(x - initX) < 0.1 && Math.abs(y - initY) < 0.1 && Math.abs(z - initZ) < 0.1) {
        return; // No significant change
      }

      // Determine if this is a goal or agent node
      const isAgent = node.id.startsWith("agent-");
      const entityId = isAgent ? node.id.replace("agent-", "") : node.id;
      const type = isAgent ? "agent" : "goal";

      try {
        const response = await fetch("/api/warmap/positions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: entityId, type, position: [x, y, z] }),
        });

        if (!response.ok) {
          console.error("Failed to persist position:", await response.json());
          // Revert position on failure
          if (groupRef.current && initialPositionRef.current) {
            groupRef.current.position.set(initX, initY, initZ);
          }
          return;
        }

        // Update local store with new position
        setNodes(storeNodes.map((n) =>
          n.id === node.id ? { ...n, position: [x, y, z] } : n
        ));
      } catch (error) {
        console.error("Error persisting position:", error);
        // Revert position on error
        if (groupRef.current && initialPositionRef.current) {
          groupRef.current.position.set(initX, initY, initZ);
        }
      }
    }
    initialPositionRef.current = null;
  }, [node.id, setNodes, storeNodes]);

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

  // Holographic wireframe overlay material
  const wireframeMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.15 * intensityMultiplier,
    wireframe: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [node.color, intensityMultiplier]);

  // Latitude lines (holographic grid overlay) material
  const latitudeLinesMaterial = React.useMemo(() => new THREE.LineBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.1 * intensityMultiplier,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [node.color, intensityMultiplier]);

  // Orbital ring materials - thinner, multi-layered
  const orbitalRingMaterials = React.useMemo(() => [
    new THREE.MeshBasicMaterial({
      color: node.color,
      transparent: true,
      opacity: 0.3 * intensityMultiplier,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    new THREE.MeshBasicMaterial({
      color: node.color,
      transparent: true,
      opacity: 0.2 * intensityMultiplier,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    new THREE.MeshBasicMaterial({
      color: node.color,
      transparent: true,
      opacity: 0.15 * intensityMultiplier,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  ], [node.color, intensityMultiplier]);

  // Satellite marker material
  const satelliteMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.9 * intensityMultiplier,
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
      const core = groupRef.current.getObjectByName("core-glow") as THREE.Mesh | null;
      if (core && core.material) {
        const pulse = 1 + Math.sin(timeRef.current * 2.5) * 0.18;
        core.scale.setScalar(pulse);
        (core.material as THREE.MeshBasicMaterial).opacity = 0.2 * intensityMultiplier * (0.6 + Math.sin(timeRef.current * 3) * 0.4);
      }
    }

    // Animate particles
    const nodePosAttr = particlesRef.current?.geometry?.attributes?.position;
    const particles = particlesRef.current;
    if (nodePosAttr?.array && particles) {
      const positions = nodePosAttr.array as Float32Array;
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
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += delta * 0.02;
    }
  });

  const canvas = useThree((state) => state.gl.domElement);

  const handlePointerOver = () => {
    onHover(true);
    if (canvas) canvas.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    onHover(false);
    if (canvas) canvas.style.cursor = "default";
  };
  const handleClick = () => onSelect();

  return (
    <group ref={groupRef} position={node.position}>
      <DragControls
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <group
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
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

      {/* Holographic wireframe overlay - latitude/longitude grid */}
      <mesh
        geometry={wireframeSphereGeometry}
        material={wireframeMaterial}
        rotation={[0, timeRef.current * 0.02, 0]}
        raycast={() => {}}
      />

      {/* Latitude lines (horizontal rings) - holographic grid overlay */}
      <group rotation={[0, timeRef.current * -0.01, 0]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <mesh
            key={`lat-${i}`}
            geometry={latitudeLinesGeometry}
            material={latitudeLinesMaterial}
            scale={[1, (0.3 + i * 0.12), 1]}
            raycast={() => {}}
          />
        ))}
      </group>

      {/* Multi-layered orbital rings - thinner, elegant tracks - horizontal (XZ plane) */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {orbitalRingGeometries.map((geometry, index) => (
          <mesh
            key={`orbital-${index}`}
            geometry={geometry}
            material={orbitalRingMaterials[index]}
            rotation={[0, 0, index * Math.PI / 6]}
            raycast={() => {}}
          />
        ))}
      </group>

      {/* Satellite markers orbiting on each ring - horizontal (XZ plane) to match orbital rings */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {orbitalRingGeometries.map((geometry, ringIndex) => (
          <mesh
            key={`satellite-${ringIndex}`}
            geometry={satelliteGeometry}
            material={satelliteMaterial}
            position={[
              geometry.parameters.radius * Math.cos(timeRef.current * (0.8 + ringIndex * 0.3) + ringIndex),
              0,
              geometry.parameters.radius * Math.sin(timeRef.current * (0.8 + ringIndex * 0.3) + ringIndex)
            ] as [number, number, number]}
            raycast={() => {}}
          />
        ))}
      </group>

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
        transform={true}
        sprite={false}
        style={{
          transform: 'scale(0.5)',
        }}
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
      </DragControls>
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