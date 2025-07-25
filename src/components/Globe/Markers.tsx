import { MARKER_COLORS } from '@/constants';
import { Server } from '@/types';
import { latLonToVector3 } from '@/utils/geoUtils';

type MarkersProps = {
  /**
   * Array of server objects to display as markers on the globe.
   */
  servers: Server[];

  /**
   * Callback fired when a marker (server) is clicked.
   * Receives the clicked Server as argument.
   */
  onMarkerClick: (server: Server) => void;
};

/**
 * Markers component renders a collection of 3D sphere markers representing servers
 * positioned using their latitude and longitude coordinates on a globe.
 * Each marker is colored based on the server's provider.
 *
 * Clicking a marker triggers the provided onMarkerClick callback.
 *
 * @param {MarkersProps} props - Component props.
 * @returns {JSX.Element[]} Array of mesh elements representing server markers.
 */
function Markers({ servers, onMarkerClick }: MarkersProps) {
  return servers.map((server) => {
    // Convert server lat/lon coordinates to Vector3 position on the globe
    const pos = latLonToVector3(server.lat, server.lon);

    return (
      <mesh
        key={server.id}
        position={pos.toArray()}
        onClick={() => onMarkerClick(server)}
        castShadow
      >
        {/* Sphere geometry marker */}
        <sphereGeometry args={[0.05, 16, 16]} />
        {/* Marker color depends on the server's provider */}
        <meshStandardMaterial color={MARKER_COLORS[server.provider]} />
      </mesh>
    );
  });
}

export default Markers;
