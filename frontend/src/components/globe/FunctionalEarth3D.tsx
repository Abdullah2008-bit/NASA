"use client";

import {
  useRef,
  useMemo,
  Suspense,
  useState,
  Component,
  ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  useTexture,
  Html,
  Stars,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";
// (framer-motion removed: no direct usage in this component)

// Error Boundary for 3D content
class ThreeErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("3D rendering error (non-critical):", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

interface PollutantDataPoint {
  type: "no2" | "o3" | "pm25" | "hcho";
  intensity: number;
  lat: number;
  lon: number;
  location?: string;
  value?: number;
  unit?: string;
  timestamp?: string;
}

/**
 * Props for the interactive 3D Earth component.
 * pollutantData: optional particle-style pollutant points (e.g. TEMPO). If empty or omitted, layer is hidden.
 * selectedPollutant: filter mode; 'all' shows every point type.
 * onLocationClick: callback when a predefined marker or arbitrary globe coordinate is clicked.
 * showLocations: toggles static major location markers.
 */
interface Earth3DGlobeProps {
  pollutantData?: PollutantDataPoint[]; // safe to pass [] for none
  selectedPollutant?: "no2" | "o3" | "pm25" | "hcho" | "all";
  onLocationClick?: (lat: number, lon: number, location: string) => void;
  showLocations?: boolean;
  focusLocation?: { lat: number; lon: number; name: string } | null;
}

// Major cities for location markers
const MAJOR_LOCATIONS = [
  { name: "New York", lat: 40.7128, lon: -74.006, aqi: 68 },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, aqi: 85 },
  { name: "London", lat: 51.5074, lon: -0.1278, aqi: 52 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, aqi: 45 },
  { name: "Paris", lat: 48.8566, lon: 2.3522, aqi: 58 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074, aqi: 125 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333, aqi: 72 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, aqi: 38 },
  // Pakistan major cities (added after removing dedicated Pakistan tab)
  { name: "Karachi", lat: 24.8607, lon: 67.0011, aqi: 140 },
  { name: "Lahore", lat: 31.5204, lon: 74.3587, aqi: 165 },
  { name: "Islamabad", lat: 33.6844, lon: 73.0479, aqi: 110 },
  { name: "Faisalabad", lat: 31.418, lon: 73.0791, aqi: 150 },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249, aqi: 135 },
  { name: "Quetta", lat: 30.1798, lon: 66.975, aqi: 120 },
  { name: "Multan", lat: 30.1575, lon: 71.5249, aqi: 155 },
];

function LocationMarker({
  location,
  onClick,
}: {
  location: (typeof MAJOR_LOCATIONS)[0];
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const phi = (90 - location.lat) * (Math.PI / 180);
  const theta = (location.lon + 180) * (Math.PI / 180);
  const radius = 2.05;

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  const color =
    location.aqi > 100 ? "#ef4444" : location.aqi > 50 ? "#f59e0b" : "#10b981";

  return (
    <group position={[x, y, z]}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.5 : 1}
      >
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Pulsing ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.05, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white text-sm whitespace-nowrap">
            <div className="font-bold">{location.name}</div>
            <div className="text-xs text-white/60">AQI: {location.aqi}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Clouds layer component with error handling
function CloudsLayer() {
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load clouds texture - Suspense will handle loading/errors
  const cloudsTexture = useTexture(
    "https://unpkg.com/three-globe/example/img/earth-clouds.png"
  );

  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.015;
    }
  });

  return (
    <Sphere ref={cloudsRef} args={[2.02, 64, 64]}>
      <meshPhongMaterial
        map={cloudsTexture}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </Sphere>
  );
}

function TEMPODataLayer({
  data,
  selectedPollutant,
}: {
  data: PollutantDataPoint[];
  selectedPollutant: string;
}) {
  const particles = useMemo(() => {
    return data
      .filter(
        (d) => selectedPollutant === "all" || d.type === selectedPollutant
      )
      .map((point, index) => {
        const phi = (90 - point.lat) * (Math.PI / 180);
        const theta = (point.lon + 180) * (Math.PI / 180);
        const radius = 2.08;

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const color = getPollutantColor(point.type, point.intensity);
        const size = 0.015 + (point.intensity / 100) * 0.02;

        return (
          <mesh key={index} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      });
  }, [data, selectedPollutant]);

  return <>{particles}</>;
}

function Earth({
  pollutantData = [],
  selectedPollutant = "all",
  onLocationClick,
  showLocations = true,
  focusLocation = null,
}: Earth3DGlobeProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [clickedPoint, setClickedPoint] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);
  // hoverPoint removed (unused state)

  // Load Earth textures with error handling
  // texturesLoaded flag removed (not used after load)
  const texture = useTexture({
    map: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    bumpMap: "https://unpkg.com/three-globe/example/img/earth-topology.png",
    specularMap: "https://unpkg.com/three-globe/example/img/earth-water.png",
  });

  // Handle Earth click
  const handleEarthClick = (event: {
    stopPropagation: () => void;
    intersections?: { point: THREE.Vector3 }[];
  }) => {
    event.stopPropagation();

    if (!earthRef.current) return;

    // Get intersection point
    const intersects = event.intersections;
    if (intersects && intersects.length > 0) {
      const point = intersects[0].point;

      // Convert 3D point to lat/lon
      const radius = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);
      const lat = 90 - (Math.acos(point.y / radius) * 180) / Math.PI;
      const lon =
        ((270 + (Math.atan2(point.x, point.z) * 180) / Math.PI) % 360) - 180;

      setClickedPoint({
        lat,
        lon,
        name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      });

      // Call parent callback if provided
      if (onLocationClick) {
        onLocationClick(
          lat,
          lon,
          `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
        );
      }
    }
  };

  // Rotate Earth smoothly
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * 0.03;
    }
  });

  return (
    <group>
      {/* Earth Sphere - Clickable */}
      <Sphere ref={earthRef} args={[2, 64, 64]} onClick={handleEarthClick}>
        <meshPhongMaterial
          map={texture.map}
          bumpMap={texture.bumpMap}
          bumpScale={0.05}
          specularMap={texture.specularMap}
          specular={new THREE.Color("grey")}
          shininess={10}
        />
      </Sphere>

      {/* Show stats at clicked location */}
      {clickedPoint && (
        <group>
          <mesh
            position={[
              -2.1 *
                Math.sin((90 - clickedPoint.lat) * (Math.PI / 180)) *
                Math.cos((clickedPoint.lon + 180) * (Math.PI / 180)),
              2.1 * Math.cos((90 - clickedPoint.lat) * (Math.PI / 180)),
              2.1 *
                Math.sin((90 - clickedPoint.lat) * (Math.PI / 180)) *
                Math.sin((clickedPoint.lon + 180) * (Math.PI / 180)),
            ]}
          >
            <Html distanceFactor={15}>
              <div className="bg-black/90 backdrop-blur-md border border-blue-500/50 rounded-xl px-4 py-3 text-white text-sm shadow-2xl min-w-[200px]">
                <div className="font-bold text-blue-400 mb-2">
                  {clickedPoint.name}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Latitude:</span>
                    <span className="font-mono">
                      {clickedPoint.lat.toFixed(2)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Longitude:</span>
                    <span className="font-mono">
                      {clickedPoint.lon.toFixed(2)}°
                    </span>
                  </div>
                  <div className="border-t border-white/10 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-white/60">AQI:</span>
                    <span className="font-bold text-green-400">68</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">NO₂:</span>
                    <span className="font-mono">15.2 ppb</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">O₃:</span>
                    <span className="font-mono">45.8 ppb</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">PM2.5:</span>
                    <span className="font-mono">12.3 μg/m³</span>
                  </div>
                </div>
                <button
                  onClick={() => setClickedPoint(null)}
                  className="mt-2 w-full text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded px-2 py-1 transition-colors"
                >
                  Close
                </button>
              </div>
            </Html>
          </mesh>
        </group>
      )}

      {/* Clouds Layer - Wrapped in error boundary for graceful degradation */}
      <ThreeErrorBoundary>
        <Suspense fallback={null}>
          <CloudsLayer />
        </Suspense>
      </ThreeErrorBoundary>

      {/* Atmosphere Glow */}
      <Sphere ref={atmosphereRef} args={[2.15, 64, 64]}>
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* TEMPO Data Overlay */}
      {pollutantData.length > 0 && (
        <TEMPODataLayer
          data={pollutantData}
          selectedPollutant={selectedPollutant}
        />
      )}

      {/* Location Markers */}
      {showLocations &&
        MAJOR_LOCATIONS.map((location) => (
          <LocationMarker
            key={location.name}
            location={location}
            onClick={() =>
              onLocationClick?.(location.lat, location.lon, location.name)
            }
          />
        ))}
      {focusLocation &&
        (() => {
          const phi = (90 - focusLocation.lat) * (Math.PI / 180);
          const theta = (focusLocation.lon + 180) * (Math.PI / 180);
          const r = 2.12;
          const x = -(r * Math.sin(phi) * Math.cos(theta));
          const y = r * Math.cos(phi);
          const z = r * Math.sin(phi) * Math.sin(theta);
          return (
            <group position={[x, y, z]}>
              <mesh>
                <sphereGeometry args={[0.055, 24, 24]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.07, 0.085, 48]} />
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <Html distanceFactor={10} position={[0, 0.09, 0]}>
                <div className="px-2 py-1 rounded bg-white text-black text-[10px] font-medium shadow-md whitespace-nowrap">
                  {focusLocation.name}
                </div>
              </Html>
            </group>
          );
        })()}
    </group>
  );
}

function getPollutantColor(type: string, intensity: number): string {
  const colors = {
    no2: intensity > 40 ? "#ef4444" : intensity > 20 ? "#f59e0b" : "#10b981",
    o3: intensity > 70 ? "#ef4444" : intensity > 50 ? "#f59e0b" : "#10b981",
    pm25: intensity > 35 ? "#ef4444" : intensity > 12 ? "#f59e0b" : "#10b981",
    hcho: intensity > 10 ? "#ef4444" : intensity > 5 ? "#f59e0b" : "#10b981",
  };
  return colors[type as keyof typeof colors] || "#10b981";
}

export default function Earth3DGlobe(props: Earth3DGlobeProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<
    "no2" | "o3" | "pm25" | "hcho" | "all"
  >("all");

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 to-black">
      {/* Compact Legend & Layer Control (Bottom Right repositioned) */}
      <div className="absolute bottom-3 right-3 z-20">
        <details className="group open:backdrop-blur-xl">
          <summary className="list-none cursor-pointer select-none flex items-center gap-2 bg-black/60 hover:bg-black/70 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white/70 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 animate-pulse" />
              Layers / Legend
            </span>
            <span className="ml-1 text-white/40 group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <div className="mt-2 w-56 bg-black/65 backdrop-blur-xl border border-white/10 rounded-xl p-3 space-y-3 shadow-xl">
            <div>
              <div className="text-[9px] text-white/50 font-semibold uppercase tracking-wide mb-1">
                Layers
              </div>
              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {[
                  { id: "all", name: "All Pollutants", color: "#8b5cf6" },
                  { id: "no2", name: "NO₂", color: "#f59e0b" },
                  { id: "o3", name: "O₃", color: "#3b82f6" },
                  { id: "pm25", name: "PM2.5", color: "#ef4444" },
                  { id: "hcho", name: "HCHO", color: "#10b981" },
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() =>
                      setSelectedPollutant(layer.id as typeof selectedPollutant)
                    }
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] transition-colors border ${
                      selectedPollutant === layer.id
                        ? "bg-white/15 text-white border-white/30"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border-transparent"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="truncate">{layer.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/50 font-semibold uppercase tracking-wide mb-1">
                AQI
              </div>
              <div className="space-y-1 text-[9px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Good
                  0–50
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />{" "}
                  Moderate 51–100
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Unhealthy
                  101+
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="bg-black/55 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white/50 flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Drag • Scroll • Click markers
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 3, 5]}
            intensity={1.5}
            color="#ffffff"
          />
          <pointLight position={[-5, -3, -5]} intensity={0.5} color="#60a5fa" />

          {/* Stars Background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Earth with all features - wrapped in error boundary */}
          <ThreeErrorBoundary
            fallback={
              <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#1e3a8a" wireframe />
              </mesh>
            }
          >
            <Earth
              {...props}
              selectedPollutant={selectedPollutant}
              showLocations={true}
            />
          </ThreeErrorBoundary>

          {/* Camera Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={3}
            maxDistance={15}
            autoRotate={false}
            rotateSpeed={0.4}
            zoomSpeed={0.8}
          />

          {/* Preload all assets */}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
