import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import earthImage from '../../../public/assets/world-map-with-countries-borders-outline-vector.jpg';

function EarthSphere() {
  const earthTexture = useLoader(TextureLoader, earthImage.src);

  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={earthTexture} roughness={1} metalness={0.4} />
    </mesh>
  );
}

export default EarthSphere;
