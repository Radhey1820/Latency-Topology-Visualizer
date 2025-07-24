'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

const apiKey = process.env.CF_RADAR_API_TOKEN;

// Servers you want to monitor, each with an id matching target hostname/IP
const SERVERS: Server[] = [
  {
    id: 'binance.com',
    name: 'Binance',
    provider: 'aws',
    lat: 47.6062,
    lon: -122.3321,
    city: 'Seattle, USA',
  },
  {
    id: 'okx.com',
    name: 'OKX',
    provider: 'azure',
    lat: 22.3964,
    lon: 114.1095,
    city: 'Hong Kong',
  },
  {
    id: 'bybit.com',
    name: 'Bybit',
    provider: 'gcp',
    lat: 1.3521,
    lon: 103.8198,
    city: 'Singapore',
  },
];

const MARKER_COLORS = {
  aws: 'red',
  azure: 'blue',
  gcp: 'yellow',
};

// Utility: convert lat/lon to 3D vector on globe radius
function latLonToVector3(lat: number, lon: number, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Colors for latency ranges
function getLatencyColor(latency: number): string {
  // Assume latency is normalized (0–1000 ms range)
  if (latency < 200) return '#00ff00'; // Green
  if (latency < 400) return '#ffff00'; // Yellow
  if (latency < 600) return '#ffa500'; // Orange
  return '#ff0000'; // Red
}

// Calculate raised curve midpoint for arcs
function getMidpointCurve(start: THREE.Vector3, end: THREE.Vector3) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  const elevation = distance * 0.4;
  const radius = 2;
  mid.normalize().multiplyScalar(radius + elevation);
  return mid;
}

type Server = {
  id: string;
  name: string;
  provider: keyof typeof MARKER_COLORS;
  lat: number;
  lon: number;
  city: string;
};

type MarkersProps = {
  servers: Server[];
  onMarkerClick: (server: Server) => void;
};

function Markers({ servers, onMarkerClick }: MarkersProps) {
  return servers.map((server) => {
    const pos = latLonToVector3(server.lat, server.lon);
    return (
      <mesh
        key={server.id}
        position={pos.toArray()}
        onClick={() => onMarkerClick(server)}
        castShadow
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={MARKER_COLORS[server.provider]} />
      </mesh>
    );
  });
}

interface LatencyTrailProps {
  path: THREE.Vector3[]; // points on the arc
  color?: string;
  speed?: number; // higher = faster
  trailCount?: number; // number of moving dots
  radius?: number; // radius of each dot
  interval?: number; // time offset between pulses
}

export const LatencyTrail = ({
  path,
  color = 'white',
  speed = 1,
  trailCount = 5,
  radius = 0.5,
  interval = 200,
}: LatencyTrailProps) => {
  const dots = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    const now = performance.now();

    for (let i = 0; i < trailCount; i++) {
      const t = ((now - i * interval) * speed * 0.001) % 1; // value from 0 to 1
      const index = Math.floor(t * (path.length - 1));
      if (dots.current[i] && path[index]) {
        dots.current[i].position.copy(path[index]);
      }
    }
  });

  return (
    <>
      {Array.from({ length: trailCount }).map((_, i) => (
        <mesh key={i} ref={(el) => (dots.current[i] = el!)}>
          <sphereGeometry args={[radius, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </>
  );
};

function AnimatedLatencyLine({
  start,
  end,
  latency,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  latency: number;
}) {
  const color = getLatencyColor(latency);

  // Setup curve
  const mid = getMidpointCurve(start, end);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const points = curve.getPoints(100);
  const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]));

  const labelPos = curve.getPoint(0.5);

  return (
    <>
      {/* Arc line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes.position'
            args={[positions, 3] as [Float32Array, number]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </line>

      {/* Latency pulses */}
      <LatencyTrail
        path={points}
        color={color}
        trailCount={5}
        speed={1.2}
        radius={0.025}
        interval={150}
      />

      {/* Latency label */}
      <Html
        position={labelPos.toArray()}
        style={{
          fontSize: 12,
          background: 'rgba(0,0,0,0.75)',
          padding: '2px 6px',
          borderRadius: 4,
          color,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        center
        distanceFactor={8}
      >
        {latency} ms
      </Html>
    </>
  );
}

type Latency = {
  fromIdx: number;
  toIdx: number;
  value: number;
};

type LatencyLinesProps = {
  servers: Server[];
  latencies: Latency[];
};

function LatencyLines({ servers, latencies }: LatencyLinesProps) {
  console.log('rkp latencies => ', latencies);
  // latencies is array of objects with {fromIdx, toIdx, value}
  return latencies.map(({ fromIdx, toIdx, value }, idx) => {
    const start = latLonToVector3(servers[fromIdx].lat, servers[fromIdx].lon);
    const end = latLonToVector3(servers[toIdx].lat, servers[toIdx].lon);
    const ms = Math.round(value * 1000);
    return (
      <AnimatedLatencyLine key={idx} start={start} end={end} latency={ms} />
    );
  });
}

export default function WorldMap() {
  const [selected, setSelected] = useState<Server | null>(null);
  const [latencies, setLatencies] = useState<Latency[]>([]);
  // useEffect(() => {
  // async function startAllMeasurements() {
  //   const newMeasurementIds: { [key: string]: string } = {};
  //   for (let i = 0; i < SERVERS.length; i++) {
  //     try {
  //       const res = await fetch('/api/cloudfare-latency', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         // body: JSON.stringify({ target: SERVERS[i].id }), // domain names as targets
  //       });
  //       if (!res.ok) {
  //         console.error('Start measurement failed:', await res.text());
  //         continue;
  //       }
  //       const data = await res.json();
  //       if (data.measurementId)
  //         newMeasurementIds[SERVERS[i].id] = data.measurementId;
  //     } catch (e) {
  //       console.error('Failed to start measurement for', SERVERS[i].id, e);
  //     }
  //   }
  //   setMeasurementIds(newMeasurementIds);
  // }

  // startAllMeasurements();

  useEffect(() => {
    const fetchLatency = async () => {
      try {
        const res = await fetch('/api/cloudfare-latency');
        const json = await res.json();

        if (json.success && json.result?.serie_0) {
          const timestamps = json.result.serie_0.timestamps;
          const values = json.result.serie_0.values;

          // Find the latest non-null value
          const latestNormalized: number | null | undefined = (
            values as (number | null | undefined)[]
          )
            .reverse()
            .find((v: number | null | undefined) => v !== null);
          if (!latestNormalized) return;

          const latencyMs = Math.round(latestNormalized * 1000); // normalized to ms

          const latencies: Latency[] = [
            {
              fromIdx: 0, // Binance (Seattle)
              toIdx: 1, // OKX (Hong Kong)
              value: latencyMs,
            },
            {
              fromIdx: 1,
              toIdx: 2, // OKX → Bybit
              value: latencyMs + 20,
            },
            {
              fromIdx: 2,
              toIdx: 0, // Bybit → Binance
              value: latencyMs + 40,
            },
          ];

          setLatencies(latencies);
        }
      } catch (error) {
        console.error('Failed to fetch latency data:', error);
      }
    };

    fetchLatency();
    const interval = setInterval(fetchLatency, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#181E2A' }}>
      <Canvas camera={{ position: [0, 0, 5] }} gl={{ antialias: false }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.7} />
        <Sphere args={[2, 64, 64]}>
          <meshStandardMaterial color='#334' roughness={1} metalness={0.4} />
        </Sphere>

        {/* You can add your CountryBorders component here */}

        <Markers servers={SERVERS} onMarkerClick={setSelected} />
        <LatencyLines servers={SERVERS} latencies={latencies} />
        <OrbitControls enablePan enableZoom enableRotate />

        {selected && (
          <Html>
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: '#222c',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: 6,
                minWidth: 180,
                userSelect: 'none',
              }}
            >
              <b>{selected.name}</b> <br />
              Cloud: {selected.provider.toUpperCase()} <br />
              Location: {selected.city} <br />
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
          </Html>
        )}
      </Canvas>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: '#111c',
          color: 'white',
          padding: '0.5rem',
          borderRadius: 6,
          userSelect: 'none',
        }}
      >
        <b>Legend</b>
        <br />
        <span style={{ color: 'red' }}>●</span> AWS &nbsp;
        <span style={{ color: 'blue' }}>●</span> Azure &nbsp;
        <span style={{ color: 'yellow' }}>●</span> GCP
        <br />
        <span style={{ color: 'lime' }}>━</span> Low latency &nbsp;
        <span style={{ color: 'yellow' }}>━</span> Medium latency &nbsp;
        <span style={{ color: 'red' }}>━</span> High latency
      </div>
    </div>
  );
}
