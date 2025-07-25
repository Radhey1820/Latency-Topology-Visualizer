import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import earthImage from '../../../public/assets/world-map-with-countries-borders-outline-vector.jpg';

/**
 * EarthSphere component renders a 3D sphere mesh with an Earth texture map applied.
 * Uses React Three Fiber's useLoader hook with Three.js TextureLoader to load the Earth image texture.
 *
 * @component
 * @returns {JSX.Element} A mesh representing a textured sphere resembling the Earth.
 */
function EarthSphere() {
  /**
   * Loads the Earth texture image as a Three.js texture object.
   * useLoader is a React Three Fiber hook that caches the loaded texture for performance.
   *
   * @type {THREE.Texture}
   */
  const earthTexture = useLoader(TextureLoader, earthImage.src);

  return (
    <mesh>
      {/* Sphere geometry with radius 2 and high detail segments */}
      <sphereGeometry args={[2, 64, 64]} />
      {/* Standard material using the loaded Earth texture, with roughness and metalness for subtle shading */}
      <meshStandardMaterial map={earthTexture} roughness={1} metalness={0.4} />
    </mesh>
  );
}

export default EarthSphere;
