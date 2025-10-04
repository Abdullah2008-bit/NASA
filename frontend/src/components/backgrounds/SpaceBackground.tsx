import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface Satellite {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
}

function AnimatedSatellite({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Orbit animation
    const time = state.clock.getElapsedTime();
    meshRef.current.position.x = position[0] + Math.cos(time * 0.5) * 0.5;
    meshRef.current.position.y = position[1] + Math.sin(time * 0.3) * 0.3;
    meshRef.current.position.z = position[2] + Math.sin(time * 0.7) * 0.4;

    // Rotation
    meshRef.current.rotation.y = time;
  });

  return (
    <group>
      {/* Satellite body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glowing aura */}
      <Sphere
        args={[0.15, 16, 16]}
        position={
          meshRef.current?.position.toArray() as [number, number, number]
        }
      >
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Sphere>
    </group>
  );
}

function Galaxy() {
  const points = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!points.current) return;

    const positions = new Float32Array(5000 * 3);
    const colors = new Float32Array(5000 * 3);

    for (let i = 0; i < 5000; i++) {
      const i3 = i * 3;

      // Spiral galaxy shape
      const radius = Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Blue-purple gradient colors
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    points.current.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    points.current.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry />
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AnimatedParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(2000 * 3);
    const velocities = new Float32Array(2000 * 3);

    for (let i = 0; i < 2000; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    particlesRef.current.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particlesRef.current.userData.velocities = velocities;
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;
    const velocities = particlesRef.current.userData.velocities;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Wrap around
      if (Math.abs(positions[i]) > 25) positions[i] *= -1;
      if (Math.abs(positions[i + 1]) > 25) positions[i + 1] *= -1;
      if (Math.abs(positions[i + 2]) > 25) positions[i + 2] *= -1;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.03}
        color="#60a5fa"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function SpaceBackground() {
  const satellites: Satellite[] = [
    {
      id: "TEMPO",
      position: [3, 2, -5],
      velocity: [0.01, 0.005, 0],
      color: "#3b82f6",
    },
    {
      id: "GOES-R",
      position: [-4, 1, -3],
      velocity: [-0.01, 0.003, 0],
      color: "#8b5cf6",
    },
    {
      id: "MERRA-2",
      position: [2, -2, -6],
      velocity: [0.008, -0.004, 0],
      color: "#06b6d4",
    },
  ];

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.3}
          color="#3b82f6"
        />

        {/* Animated Stars - Smaller, more realistic like tiny dots */}
        <Stars
          radius={300}
          depth={60}
          count={8000}
          factor={2}
          saturation={0}
          fade
          speed={0.3}
        />

        {/* Galaxy */}
        <Galaxy />

        {/* Floating Particles */}
        <AnimatedParticles />

        {/* Satellites */}
        {satellites.map((satellite) => (
          <AnimatedSatellite
            key={satellite.id}
            position={satellite.position}
            color={satellite.color}
          />
        ))}

        {/* Nebula Effect */}
        <mesh position={[0, 0, -20]}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>
      </Canvas>

      {/* Gradient Overlay (Prisma-style) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-slate-950/80 pointer-events-none" />
    </div>
  );
}
