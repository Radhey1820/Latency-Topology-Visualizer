import { Server } from '@/types';
import {
  getLatencyColor,
  getMidpointCurve,
  latLonToVector3,
} from '@/utils/geoUtils';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

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

export type Latency = {
  fromIdx: number;
  toIdx: number;
  value: number;
};

type LatencyLinesProps = {
  servers: Server[];
  latencies: Latency[];
};

function LatencyLines({ servers, latencies }: LatencyLinesProps) {
  return latencies.map(({ fromIdx, toIdx, value }, idx) => {
    const start = latLonToVector3(servers[fromIdx].lat, servers[fromIdx].lon);
    const end = latLonToVector3(servers[toIdx].lat, servers[toIdx].lon);
    const ms = Math.round(value * 1000);
    return (
      <AnimatedLatencyLine key={idx} start={start} end={end} latency={ms} />
    );
  });
}

export default LatencyLines;
