import { REGION_COLORS } from '@/constants';
import { Region } from '@/types';
import { latLonToVector3 } from '@/utils/geoUtils';
import { Html } from '@react-three/drei';

type RegionMarkerProps = {
  /**
   * Region data to be rendered as a marker on the globe.
   */
  region: Region;
};

/**
 * RegionMarker renders a glowing sphere representing a cloud region on the globe.
 * It positions the marker according to the region's latitude and longitude,
 * colors it according to its cloud provider, and shows an HTML label with region info.
 *
 * @param {RegionMarkerProps} props - Component props.
 * @returns {JSX.Element} A group with a colored glowing sphere and a floating label.
 */
function RegionMarker({ region }: RegionMarkerProps) {
  // Convert latitude and longitude to 3D vector position on the sphere
  const pos = latLonToVector3(region.lat, region.lon);

  return (
    <group position={pos.toArray()}>
      <mesh>
        {/* Sphere geometry as the marker */}
        <sphereGeometry args={[0.07, 12, 12]} />
        {/* Mesh material colored and emissive for glowing effect */}
        <meshStandardMaterial
          color={REGION_COLORS[region.provider]}
          emissive={REGION_COLORS[region.provider]}
          emissiveIntensity={0.7}
        />
      </mesh>
      {/* HTML label positioned slightly above the marker */}
      <Html
        distanceFactor={10}
        position={[0, 0.1, 0]}
        style={{ color: 'white', pointerEvents: 'auto' }}
      >
        <div
          style={{
            backgroundColor: '#111c',
            padding: 6,
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          <b>{region.provider.toUpperCase()}</b>
          <br />
          Region: {region.regionCode}
          <br />
          Servers: {region.serverCount}
        </div>
      </Html>
    </group>
  );
}

type RegionMarkersProps = {
  /**
   * Array of region objects to be displayed as markers.
   */
  regions: Region[];
  /**
   * Object containing provider filters to determine which regions to render.
   */
  filters: { aws: boolean; azure: boolean; gcp: boolean };
};

/**
 * RegionMarkers renders a collection of RegionMarker components filtered by provider.
 *
 * @param {RegionMarkersProps} props - Component props.
 * @returns {JSX.Element} A fragment with visible RegionMarker elements.
 */
function RegionMarkers({ regions, filters }: RegionMarkersProps) {
  return (
    <>
      {regions.map((region) =>
        filters[region.provider] ? (
          <RegionMarker key={region.regionCode} region={region} />
        ) : null
      )}
    </>
  );
}

export default RegionMarkers;
