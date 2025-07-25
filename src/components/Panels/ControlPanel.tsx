import { useWorldMapContext } from '@/contexts/WorldMapContext';
import React from 'react';

/**
 * Color mapping for cloud providers used in UI elements.
 */
export const REGION_COLORS = {
  aws: 'orange',
  azure: 'deepskyblue',
  gcp: 'limegreen',
} as const;

/**
 * ControlPanel component provides an interactive UI panel for filtering and controlling
 * the world map visualization of cloud providers, latency ranges, and data display options.
 *
 * It connects to the world map context to read and update state related to search filters,
 * cloud provider visibility, latency range, visualization layers, and displays FPS performance.
 *
 * @component
 * @returns {JSX.Element} The rendered control panel UI element.
 */
function ControlPanel() {
  const {
    exchangeFilter,
    setExchangeFilter,
    fps,
    providerFilters,
    setProviderFilters,
    latencyFilter,
    setLatencyFilter,
    setShowRealTime,
    showRealTime,
    showHistorical,
    setShowHistorical,
    setShowRegions,
    showRegions,
  } = useWorldMapContext();

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 190,
        background: '#222c',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        userSelect: 'none',
        zIndex: 1000,
        width: 300,
      }}
    >
      {/* Search input to filter exchanges and regions by text */}
      <div style={{ marginBottom: 12 }}>
        <label>
          Search Exchanges/Regions:
          <input
            type='text'
            value={exchangeFilter}
            onChange={(e) => setExchangeFilter(e.target.value)}
            style={{ width: '100%', marginTop: 4 }}
            placeholder='Type to search...'
          />
        </label>
      </div>

      {/* Cloud provider filtering checkboxes */}
      <div style={{ marginBottom: 12 }}>
        <b>Cloud Provider Filters</b>
        <br />
        {['aws', 'azure', 'gcp'].map((key) => (
          <label
            key={key}
            style={{ marginRight: 12, display: 'inline-block', marginTop: 6 }}
          >
            <input
              type='checkbox'
              checked={providerFilters[key as keyof typeof REGION_COLORS]}
              onChange={() =>
                setProviderFilters((f) => ({
                  ...f,
                  [key]: !f[key as keyof typeof REGION_COLORS],
                }))
              }
            />
            <span
              style={{
                marginLeft: 6,
                textTransform: 'uppercase',
                color: REGION_COLORS[key as keyof typeof REGION_COLORS],
              }}
            >
              {key}
            </span>
          </label>
        ))}
      </div>

      {/* Latency range selector dropdown */}
      <div style={{ marginBottom: 12 }}>
        <b>Latency Range</b>
        <br />
        <select
          value={latencyFilter}
          onChange={(e) => setLatencyFilter(e.target.value as any)}
          style={{ width: '100%' }}
        >
          <option value='all'>All</option>
          <option value='low'>&lt; 200 ms</option>
          <option value='medium'>200 - 400 ms</option>
          <option value='high'>&gt; 400 ms</option>
        </select>
      </div>

      {/* Visualization layer toggles (checkboxes) */}
      <div style={{ marginBottom: 12 }}>
        <b>Visualization Layers</b>
        <br />
        <label style={{ display: 'block', marginTop: 6 }}>
          <input
            type='checkbox'
            checked={showRealTime}
            onChange={() => setShowRealTime((v) => !v)}
          />
          Real-time Data
        </label>
        <label style={{ display: 'block', marginTop: 6 }}>
          <input
            type='checkbox'
            checked={showHistorical}
            onChange={() => setShowHistorical((v) => !v)}
          />
          Historical Trends
        </label>
        <label style={{ display: 'block', marginTop: 6 }}>
          <input
            type='checkbox'
            checked={showRegions}
            onChange={() => setShowRegions((v) => !v)}
          />
          Cloud Provider Regions
        </label>
      </div>

      {/* Display current FPS (frames per second) */}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #444' }}>
        <b>Performance Metrics</b>
        <br />
        FPS: {fps.toFixed(1)}
      </div>
    </div>
  );
}

export default ControlPanel;
