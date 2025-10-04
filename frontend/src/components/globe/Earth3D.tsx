"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface EarthProps {
  pollutantData?: {
    type: "no2" | "o3" | "pm25" | "hcho";
    intensity: number;
    lat: number;
    lon: number;
  }[];
}

function Earth({ pollutantData = [] }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load Earth textures (optimized with useMemo)
  const texture = useTexture({
    map: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    bumpMap: "https://unpkg.com/three-globe/example/img/earth-topology.png",
  });

  // Rotate Earth smoothly
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  // Pollutant overlay particles (optimized with InstancedMesh)
  const pollutantParticles = useMemo(() => {
    if (pollutantData.length === 0) return null;

    const particles: React.ReactElement[] = [];
    pollutantData.forEach((data, index) => {
      const phi = (90 - data.lat) * (Math.PI / 180);
      const theta = (data.lon + 180) * (Math.PI / 180);
      const radius = 2.05;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const color = getPollutantColor(data.type, data.intensity);

      particles.push(
        <mesh key={index} position={[x, y, z]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      );
    });

    return particles;
  }, [pollutantData]);

  return (
    <group>
      {/* Earth Sphere */}
      <Sphere ref={earthRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          map={texture.map}
          bumpMap={texture.bumpMap}
          bumpScale={0.05}
          metalness={0.1}
          roughness={0.7}
        />
      </Sphere>

      {/* Atmosphere Glow */}
      <Sphere ref={atmosphereRef} args={[2.1, 64, 64]}>
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Pollutant Particles */}
      {pollutantParticles}
    </group>
  );
}

function getPollutantColor(type: string, intensity: number): string {
  const colors = {
    no2: intensity > 40 ? "#ff0000" : intensity > 20 ? "#ff8800" : "#00ff00",
    o3: intensity > 70 ? "#ff0000" : intensity > 50 ? "#ff8800" : "#00ff00",
    pm25: intensity > 35 ? "#ff0000" : intensity > 12 ? "#ff8800" : "#00ff00",
    hcho: intensity > 10 ? "#ff0000" : intensity > 5 ? "#ff8800" : "#00ff00",
  };
  return colors[type as keyof typeof colors] || "#00ff00";
}

export default function Earth3DGlobe({ pollutantData }: EarthProps) {
  return (
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]} // Adaptive pixel ratio for performance
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 3, 5]} intensity={1.5} />
          <pointLight position={[-5, -3, -5]} intensity={0.5} color="#4a90e2" />

          {/* Earth */}
          <Earth pollutantData={pollutantData} />

          {/* Camera Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            autoRotate={false}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
