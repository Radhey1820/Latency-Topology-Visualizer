'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import ControlPanel from './Panels/ControlPanel';
import FPSTracker from './Globe/FPSTracker';
import Markers from './Globe/Markers';
import RegionMarkers from './Globe/RegionMarkers';
import LatencyLines, { Latency } from './Globe/LatencyLines';
import EarthSphere from './Globe/EarthSphere';
import ProviderFilterPanel from './Panels/FilterPanel';
import LatencyTrendsPanel from './Panels/LatencyTrendsPanel';
import Legend from './Globe/Legend';
import { REGIONS, SERVERS } from '@/constants';
import { Server } from '@/types';
import { useWorldMapContext } from '@/contexts/WorldMapContext';

/**
 * WorldMap component renders an interactive 3D globe visualization
 * displaying server markers, latency lines, and regional data.
 * It supports filtering by provider and latency level, and shows latency trends.
 *
 * @component
 * @returns {JSX.Element} The rendered WorldMap component with 3D globe and UI panels.
 */
export default function WorldMap() {
  const {
    exchangeFilter,
    latencyFilter,
    providerFilters,
    setProviderFilters,
    setFps,
    showHistorical,
    showRealTime,
    showRegions,
    setServerPair,
    setShowTrends,
    showTrends,
  } = useWorldMapContext();

  /**
   * Currently selected server by user interaction.
   * @type {[Server | null, React.Dispatch<React.SetStateAction<Server | null>>]}
   */
  const [selected, setSelected] = useState<Server | null>(null);

  /**
   * List of latency objects representing network latencies between server pairs.
   * @type {[Latency[], React.Dispatch<React.SetStateAction<Latency[]>>]}
   */
  const [latencies, setLatencies] = useState<Latency[]>([]);

  /**
   * Filter the servers based on the exchangeFilter text and providerFilters.
   */
  const filteredServers = SERVERS.filter((server) => {
    const searchText = exchangeFilter.toLowerCase();
    const matchesSearch =
      server.name.toLowerCase().includes(searchText) ||
      server.id.toLowerCase().includes(searchText) ||
      server.city.toLowerCase().includes(searchText);
    const providerSelected = providerFilters[server.provider];
    return matchesSearch && providerSelected;
  });

  /**
   * Determines the latency level classification based on latency in milliseconds.
   * @param {number} ms - Latency in milliseconds.
   * @returns {'low' | 'medium' | 'high'} Latency level as a string.
   */
  function getLatencyLevel(ms: number) {
    if (ms < 200) return 'low';
    if (ms < 400) return 'medium';
    return 'high';
  }

  /**
   * Filters latency data according to selected latency filter and provider restrictions.
   */
  const filteredLatencies = latencies.filter((latency) => {
    if (latencyFilter !== 'all') {
      const level = getLatencyLevel(latency.value);
      if (level !== latencyFilter) return false;
    }
    const fromServer = SERVERS[latency.fromIdx];
    const toServer = SERVERS[latency.toIdx];
    if (!fromServer || !toServer) return false;

    const matchesFrom =
      fromServer.name.toLowerCase().includes(exchangeFilter.toLowerCase()) &&
      providerFilters[fromServer.provider];

    const matchesTo =
      toServer.name.toLowerCase().includes(exchangeFilter.toLowerCase()) &&
      providerFilters[toServer.provider];

    return matchesFrom && matchesTo;
  });

  /**
   * Filter regions by currently selected providers.
   */
  const filteredRegions = REGIONS.filter(
    (region) => providerFilters[region.provider]
  );

  /**
   * Boolean flag to indicate if the component is running on the client.
   * Necessary due to server/client rendering differences.
   */
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  /**
   * Effect to update server pair and UI state when a server marker is selected.
   * Sets default target server index and toggles trend display accordingly.
   */
  useEffect(() => {
    if (selected) {
      const srcIdx = SERVERS.findIndex((s) => s.id === selected.id);
      const dstIdx = (srcIdx + 1) % SERVERS.length; // default destination server
      setServerPair([srcIdx, dstIdx]);
      setShowTrends(true);
    } else {
      setShowTrends(false);
      setServerPair(null);
    }
  }, [selected]);

  /**
   * Fetches latency data from the Cloudflare latency API every 10 seconds
   * and updates latency state with parsed latency values.
   */
  useEffect(() => {
    const fetchLatency = async () => {
      try {
        const res = await fetch('/api/cloudfare-latency');
        const json = await res.json();

        if (json.success && json.result?.serie_0) {
          const values = json.result.serie_0.values;

          // Find the latest non-null value in the latency values array
          const latestNormalized: number | null | undefined = (
            values as (number | null | undefined)[]
          )
            .reverse()
            .find((v) => v !== null);
          if (!latestNormalized) return;

          const latencyMs = Math.round(latestNormalized * 1000); // Convert normalized value to ms

          const latencies: Latency[] = [
            {
              fromIdx: 0, // Binance (Seattle)
              toIdx: 1, // OKX (Hong Kong)
              value: latencyMs,
            },
            {
              fromIdx: 1,
              toIdx: 2, // OKX → Bybit
              value: latencyMs + 20,
            },
            {
              fromIdx: 2,
              toIdx: 0, // Bybit → Binance
              value: latencyMs + 40,
            },
          ];

          setLatencies(latencies);
        }
      } catch (error) {
        console.error('Failed to fetch latency data:', error);
      }
    };

    fetchLatency();
    const interval = setInterval(fetchLatency, 10000);
    return () => clearInterval(interval);
  }, []);

  // While server-side rendering or before client hydration, render a placeholder div
  if (!isClient) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#181E2A' }} />
    );
  }

  // Render the 3D globe, controls, markers, and filtering panels
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#181E2A' }}>
      <Canvas camera={{ position: [0, 0, 5] }} gl={{ antialias: false }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.7} />
        <FPSTracker onFpsUpdate={setFps} />
        <EarthSphere />

        <Markers servers={filteredServers} onMarkerClick={setSelected} />
        {showRealTime && (
          <LatencyLines servers={SERVERS} latencies={filteredLatencies} />
        )}
        {showRegions && (
          <RegionMarkers regions={filteredRegions} filters={providerFilters} />
        )}

        <OrbitControls enablePan enableZoom enableRotate />

        {selected && (
          <Html>
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: '#222c',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: 6,
                minWidth: 180,
                userSelect: 'none',
              }}
            >
              <b>{selected.name}</b> <br />
              Cloud: {selected.provider.toUpperCase()} <br />
              Location: {selected.city} <br />
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
          </Html>
        )}
      </Canvas>
      <Legend />

      <ProviderFilterPanel
        filters={providerFilters}
        setFilters={setProviderFilters}
      />
      {showHistorical && (
        <LatencyTrendsPanel
          open={showTrends}
          onClose={() => setShowTrends(false)}
        />
      )}
      <ControlPanel />
    </div>
  );
}
