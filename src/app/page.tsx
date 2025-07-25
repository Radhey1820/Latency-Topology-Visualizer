import WorldMap from '@/components/WorldMap';
import { WorldMapProvider } from '@/contexts/WorldMapContext';

export default function Home() {
  return (
    <WorldMapProvider>
      <WorldMap />
    </WorldMapProvider>
  );
}
