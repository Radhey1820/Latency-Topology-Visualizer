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
  const [selected, setSelected] = useState<Server | null>(null);
  const [latencies, setLatencies] = useState<Latency[]>([]);

  const filteredServers = SERVERS.filter((server) => {
    const searchText = exchangeFilter.toLowerCase();
    const matchesSearch =
      server.name.toLowerCase().includes(searchText) ||
      server.id.toLowerCase().includes(searchText) ||
      server.city.toLowerCase().includes(searchText);
    const providerSelected = providerFilters[server.provider];
    return matchesSearch && providerSelected;
  });

  function getLatencyLevel(ms: number) {
    if (ms < 200) return 'low';
    if (ms < 400) return 'medium';
    return 'high';
  }

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

  const filteredRegions = REGIONS.filter(
    (region) => providerFilters[region.provider]
  );

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (selected) {
      const srcIdx = SERVERS.findIndex((s) => s.id === selected.id);
      const dstIdx = (srcIdx + 1) % SERVERS.length; // default dst server
      setServerPair([srcIdx, dstIdx]);
      setShowTrends(true);
    } else {
      setShowTrends(false);
      setServerPair(null);
    }
  }, [selected]);

  useEffect(() => {
    const fetchLatency = async () => {
      try {
        const res = await fetch('/api/cloudfare-latency');
        const json = await res.json();

        if (json.success && json.result?.serie_0) {
          const timestamps = json.result.serie_0.timestamps;
          const values = json.result.serie_0.values;

          // Find the latest non-null value
          const latestNormalized: number | null | undefined = (
            values as (number | null | undefined)[]
          )
            .reverse()
            .find((v: number | null | undefined) => v !== null);
          if (!latestNormalized) return;

          const latencyMs = Math.round(latestNormalized * 1000); // normalized to ms

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

  if (!isClient) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#181E2A' }} />
    );
  }

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
