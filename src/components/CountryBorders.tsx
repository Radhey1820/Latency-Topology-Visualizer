//@ts-nocheck
import { useEffect, useState } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Reuse this from your globe code
function latLonToVector3(lat, lon, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function CountryBorders() {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch('/sampleCountries.geojson')
      .then((res) => res.json())
      .then((data) => setFeatures(data.features || []));
  }, []);

  return (
    <>
      {features.map((f, idx) => {
        // Handles Polygon and MultiPolygon
        const polys =
          f.geometry.type === 'MultiPolygon'
            ? f.geometry.coordinates.flat()
            : f.geometry.coordinates;

        return polys.map((poly, j) => {
          const points = poly.map(([lon, lat]) => latLonToVector3(lat, lon));
          return (
            <Line
              key={`${idx}-${j}`}
              points={points}
              color='white'
              lineWidth={0.5}
              transparent
              opacity={0.4}
            />
          );
        });
      })}
    </>
  );
}
