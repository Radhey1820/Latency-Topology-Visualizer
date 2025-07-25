// src/utils/geoUtils.ts
import * as THREE from 'three';

// Utility: convert lat/lon to 3D vector on globe radius
export function latLonToVector3(lat: number, lon: number, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Colors for latency ranges
export function getLatencyColor(latency: number): string {
  // Assume latency is normalized (0–1000 ms range)
  if (latency < 200) return '#00ff00'; // Green
  if (latency < 400) return '#ffff00'; // Yellow
  if (latency < 600) return '#ffa500'; // Orange
  return '#ff0000'; // Red
}

// Calculate raised curve midpoint for arcs
export function getMidpointCurve(start: THREE.Vector3, end: THREE.Vector3) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  const elevation = distance * 0.4;
  const radius = 2;
  mid.normalize().multiplyScalar(radius + elevation);
  return mid;
}
