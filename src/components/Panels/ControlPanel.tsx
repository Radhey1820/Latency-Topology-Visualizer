import { useWorldMapContext } from '@/contexts/WorldMapContext';
import React, { useEffect, useState } from 'react';

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
 * This version adapts layout and styles based on screen size for responsive usability.
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

  // Responsive screen size detection
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>(
    'large'
  );

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      if (width < 600) setScreenSize('small');
      else if (width >= 600 && width < 1024) setScreenSize('medium');
      else setScreenSize('large');
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Responsive style adjustments
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    background: '#222c',
    color: 'white',
    padding: screenSize === 'small' ? '1rem' : 12,
    borderRadius: screenSize === 'small' ? '12px 12px 0 0' : 8,
    userSelect: 'none',
    zIndex: 1000,
    width:
      screenSize === 'small' ? '100%' : screenSize === 'medium' ? 280 : 300,
    maxHeight: screenSize === 'small' ? '40vh' : 'auto',
    bottom: screenSize === 'small' ? 0 : 'auto',
    top: screenSize !== 'small' ? 20 : 'auto',
    left: screenSize === 'large' ? 190 : screenSize === 'medium' ? 10 : 0,
    overflowY: screenSize === 'small' ? 'auto' : 'visible',
    boxSizing: 'border-box',
    fontSize: screenSize === 'small' ? 16 : 14,
    // Add touch-friendly enhancements
    display: 'flex',
    flexDirection: 'column',
    gap: screenSize === 'small' ? 12 : 8,
  };

  // Style for input/select elements for better touch targets
  const inputStyle: React.CSSProperties = {
    width: '100%',
    marginTop: 4,
    fontSize: screenSize === 'small' ? 16 : 14,
    padding: '6px 8px',
    borderRadius: 4,
    border: '1px solid #555',
    backgroundColor: '#111',
    color: 'white',
  };

  // Checkbox label style for spacing and accessibility
  const checkboxLabelStyle: React.CSSProperties = {
    marginRight: 12,
    display: 'inline-block',
    marginTop: screenSize === 'small' ? 12 : 6,
    fontSize: screenSize === 'small' ? 16 : 14,
    cursor: 'pointer',
  };

  // Button-like style for toggle checkboxes on mobile
  const checkboxStyle: React.CSSProperties = {
    cursor: 'pointer',
    width: 18,
    height: 18,
  };

  return (
    <div style={panelStyle}>
      {/* Search input to filter exchanges and regions by text */}
      <div>
        <label>
          Search Exchanges/Regions:
          <input
            type='text'
            value={exchangeFilter}
            onChange={(e) => setExchangeFilter(e.target.value)}
            style={inputStyle}
            placeholder='Type to search...'
            aria-label='Search Exchanges or Regions'
            autoComplete='off'
          />
        </label>
      </div>

      {/* Cloud provider filtering checkboxes */}
      <div>
        <b>Cloud Provider Filters</b>
        <br />
        {['aws', 'azure', 'gcp'].map((key) => (
          <label
            key={key}
            style={checkboxLabelStyle}
            htmlFor={`provider-filter-${key}`}
          >
            <input
              type='checkbox'
              id={`provider-filter-${key}`}
              checked={providerFilters[key as keyof typeof REGION_COLORS]}
              onChange={() =>
                setProviderFilters((f) => ({
                  ...f,
                  [key]: !f[key as keyof typeof REGION_COLORS],
                }))
              }
              style={checkboxStyle}
            />
            <span
              style={{
                marginLeft: 6,
                textTransform: 'uppercase',
                color: REGION_COLORS[key as keyof typeof REGION_COLORS],
                userSelect: 'none',
              }}
            >
              {key}
            </span>
          </label>
        ))}
      </div>

      {/* Latency range selector dropdown */}
      <div>
        <b>Latency Range</b>
        <br />
        <select
          value={latencyFilter}
          onChange={(e) => setLatencyFilter(e.target.value as any)}
          style={inputStyle}
          aria-label='Select Latency Range'
        >
          <option value='all'>All</option>
          <option value='low'>&lt; 200 ms</option>
          <option value='medium'>200 - 400 ms</option>
          <option value='high'>&gt; 400 ms</option>
        </select>
      </div>

      {/* Visualization layer toggles (checkboxes) */}
      <div>
        <b>Visualization Layers</b>
        <br />
        {[
          {
            label: 'Real-time Data',
            value: showRealTime,
            setter: setShowRealTime,
            id: 'vis-real-time',
          },
          {
            label: 'Historical Trends',
            value: showHistorical,
            setter: setShowHistorical,
            id: 'vis-historical',
          },
          {
            label: 'Cloud Provider Regions',
            value: showRegions,
            setter: setShowRegions,
            id: 'vis-regions',
          },
        ].map(({ label, value, setter, id }) => (
          <label key={id} style={{ ...checkboxLabelStyle, display: 'block' }}>
            <input
              type='checkbox'
              id={id}
              checked={value}
              onChange={() => setter((v) => !v)}
              style={checkboxStyle}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Display current FPS (frames per second) */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid #444',
          fontSize: screenSize === 'small' ? 16 : 14,
          userSelect: 'none',
        }}
      >
        <b>Performance Metrics</b>
        <br />
        FPS: {fps.toFixed(1)}
      </div>
    </div>
  );
}

export default ControlPanel;
