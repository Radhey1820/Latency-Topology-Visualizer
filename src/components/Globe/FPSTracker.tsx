import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function FPSTracker({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
  const lastTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    lastTime.current = now;
    const fps = 1000 / delta;
    onFpsUpdate(fps);
  });

  return null;
}

export default FPSTracker;
