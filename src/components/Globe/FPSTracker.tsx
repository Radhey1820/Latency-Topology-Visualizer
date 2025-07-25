import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/**
 * FPSTracker component measures and reports the frames per second (FPS)
 * of the rendering loop using React Three Fiber's useFrame hook.
 *
 * This component does not render any visible elements.
 *
 * @param {Object} props - Component props.
 * @param {(fps: number) => void} props.onFpsUpdate - Callback function
 *        called on every animation frame with the current FPS value.
 *
 * @component
 * @returns {null} This component does not render any DOM or canvas elements.
 */
function FPSTracker({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
  /**
   * Ref to store the timestamp of the last frame.
   * Initialized to the current performance time.
   *
   * @type {React.MutableRefObject<number>}
   */
  const lastTime = useRef(performance.now());

  /**
   * useFrame runs on each rendered frame.
   * It calculates the delta time since the last frame and computes FPS,
   * then calls the onFpsUpdate callback with the new FPS value.
   */
  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    lastTime.current = now;
    const fps = 1000 / delta;
    onFpsUpdate(fps);
  });

  // This component renders nothing visible.
  return null;
}

export default FPSTracker;
