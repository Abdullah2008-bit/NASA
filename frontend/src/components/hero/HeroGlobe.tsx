"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useRef } from "react";

// Minimal rotating globe for the hero header background
function RotatingEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useTexture({
    map: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  });

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Sphere ref={earthRef} args={[2, 64, 64]}>
        <meshPhongMaterial map={texture.map} shininess={5} />
      </Sphere>
    </group>
  );
}

function Scene() {
  const { camera } = useThree();
  camera.position.set(0, 0, 4.5);
  return (
    <>
      {/* Soft lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} />
      <directionalLight
        position={[-5, -3, -5]}
        intensity={0.2}
        color="#88aaff"
      />
      <RotatingEarth />
      <Stars
        radius={100}
        depth={50}
        count={4000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
}

export function HeroGlobe() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none -z-0">
      <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      {/* Gradient overlays to blend into hero background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(40,98,200,0.25),transparent_60%)]" />
    </div>
  );
}
