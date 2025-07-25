import { REGION_COLORS } from '@/constants';
import { Region } from '@/types';
import { latLonToVector3 } from '@/utils/geoUtils';
import { Html } from '@react-three/drei';

function RegionMarker({ region }: { region: Region }) {
  const pos = latLonToVector3(region.lat, region.lon);
  return (
    <group position={pos.toArray()}>
      <mesh>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color={REGION_COLORS[region.provider]}
          emissive={REGION_COLORS[region.provider]}
          emissiveIntensity={0.7}
        />
      </mesh>
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

function RegionMarkers({
  regions,
  filters,
}: {
  regions: Region[];
  filters: { aws: boolean; azure: boolean; gcp: boolean };
}) {
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
