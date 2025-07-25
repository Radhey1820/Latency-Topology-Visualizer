import { Server } from '@/types';
import {
  getLatencyColor,
  getMidpointCurve,
  latLonToVector3,
} from '@/utils/geoUtils';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface LatencyTrailProps {
  /**
   * Array of THREE.Vector3 points defining the path for the moving dots.
   */
  path: THREE.Vector3[];
  /**
   * Color of the dots representing latency pulses.
   * @default 'white'
   */
  color?: string;
  /**
   * Speed multiplier of the moving dots along the path.
   * Higher means faster movement.
   * @default 1
   */
  speed?: number;
  /**
   * Number of moving dots (pulses) shown in the trail.
   * @default 5
   */
  trailCount?: number;
  /**
   * Radius of each moving dot.
   * @default 0.5
   */
  radius?: number;
  /**
   * Time offset in milliseconds between the pulses.
   * @default 200
   */
  interval?: number;
}

/**
 * LatencyTrail renders animated moving dots ("pulses") along a provided path
 * representing latency visualization on a curve.
 * Uses useFrame to update dots positions based on current time.
 *
 * @param {LatencyTrailProps} props - Component props.
 * @returns {JSX.Element} A group of sphere meshes moving along the path.
 */
export const LatencyTrail = ({
  path,
  color = 'white',
  speed = 1,
  trailCount = 5,
  radius = 0.5,
  interval = 200,
}: LatencyTrailProps) => {
  // References to meshes representing each dot pulse
  const dots = useRef<(THREE.Mesh | null)[]>([]);

  // Animation loop updates positions of dots along the path in each frame
  useFrame(() => {
    const now = performance.now();
    const pathLength = path.length;
    if (pathLength === 0) return;

    for (let i = 0; i < trailCount; i++) {
      // Compute normalized progress [0,1) for each dot with interval offset
      const t = ((now - i * interval) * speed * 0.001) % 1;
      // Corresponding index on path points array
      const index = Math.floor(t * (pathLength - 1));

      const dot = dots.current[i];
      if (dot && path[index]) {
        dot.position.copy(path[index]);
      }
    }
  });

  // Memoize dots array to avoid recreation on each render
  const dotsArray = useMemo(() => Array(trailCount).fill(0), [trailCount]);

  return (
    <>
      {dotsArray.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            dots.current[i] = el;
          }}
          castShadow={false}
          receiveShadow={false}
        >
          <sphereGeometry args={[radius, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </>
  );
};

interface AnimatedLatencyLineProps {
  /**
   * Starting point of the latency arc as a Vector3.
   */
  start: THREE.Vector3;
  /**
   * Ending point of the latency arc as a Vector3.
   */
  end: THREE.Vector3;
  /**
   * Latency value in milliseconds to determine color and label.
   */
  latency: number;
}

/**
 * AnimatedLatencyLine renders a curved latency arc between two points with animated latency pulses
 * and a latency label positioned mid-curve.
 *
 * @param {AnimatedLatencyLineProps} props - Component props.
 * @returns {JSX.Element} A group containing the arc line, latency pulses, and label.
 */
function AnimatedLatencyLine({
  start,
  end,
  latency,
}: AnimatedLatencyLineProps) {
  // Color derived from the latency value
  const color = useMemo(() => getLatencyColor(latency), [latency]);

  // Memoize curve geometry and positions buffer for performance
  const { curve, points, positions, labelPos } = useMemo(() => {
    const mid = getMidpointCurve(start, end);
    const bezierCurve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const pts = bezierCurve.getPoints(100);

    // Convert points to flattened Float32Array for BufferGeometry
    const posBuffer = new Float32Array(pts.length * 3);
    pts.forEach((p, idx) => {
      posBuffer[idx * 3] = p.x;
      posBuffer[idx * 3 + 1] = p.y;
      posBuffer[idx * 3 + 2] = p.z;
    });

    return {
      curve: bezierCurve,
      points: pts,
      positions: posBuffer,
      labelPos: bezierCurve.getPoint(0.5), // Midpoint for label
    };
  }, [start, end]);

  return (
    <>
      {/* Latency arc as a semi-transparent line */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach='attributes.position' args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </line>

      {/* Animated latency pulses along the arc */}
      <LatencyTrail
        path={points}
        color={color}
        trailCount={5}
        speed={1.2}
        radius={0.025}
        interval={150}
      />

      {/* Latency label displayed at midpoint of arc */}
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
  /** Source server index */
  fromIdx: number;
  /** Destination server index */
  toIdx: number;
  /** Latency value in seconds/fractional units */
  value: number;
};

type LatencyLinesProps = {
  /** Array of server data with lat/lon */
  servers: Server[];
  /** Array of latency definitions between server pairs */
  latencies: Latency[];
};

/**
 * LatencyLines renders multiple animated latency arcs between server pairs.
 * It converts lat/lon to 3D coordinates and passes data to AnimatedLatencyLine components.
 *
 * @param {LatencyLinesProps} props - Component props.
 * @returns {JSX.Element} A fragment containing multiple latency arc components.
 */
function LatencyLines({ servers, latencies }: LatencyLinesProps) {
  return (
    <>
      {latencies.map(({ fromIdx, toIdx, value }, idx) => {
        // Memoized 3D coordinates from lat/lon of servers to optimize renders
        const start = useMemo(
          () => latLonToVector3(servers[fromIdx].lat, servers[fromIdx].lon),
          [servers, fromIdx]
        );
        const end = useMemo(
          () => latLonToVector3(servers[toIdx].lat, servers[toIdx].lon),
          [servers, toIdx]
        );

        // Latency rounded to integer milliseconds
        const ms = Math.round(value * 1000);

        return (
          <AnimatedLatencyLine key={idx} start={start} end={end} latency={ms} />
        );
      })}
    </>
  );
}

export default LatencyLines;
