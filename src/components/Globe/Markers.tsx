import { MARKER_COLORS } from '@/constants';
import { Server } from '@/types';
import { latLonToVector3 } from '@/utils/geoUtils';

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

export default Markers;
