import React from 'react';

/**
 * Legend component displays a fixed UI element that explains the color coding for
 * cloud providers and latency levels used in the visualization.
 *
 * The legend shows colored dots for different cloud service providers (AWS, Azure, GCP)
 * as well as colored line indicators for latency tiers (Low, Medium, High).
 *
 * This component uses inline styles to position itself absolutely in the bottom-left corner.
 *
 * @component
 * @returns {JSX.Element} The rendered legend UI element.
 */
function Legend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: '#111c',
        color: 'white',
        padding: '0.5rem',
        borderRadius: 6,
        userSelect: 'none',
      }}
    >
      <b>Legend</b>
      <br />
      <span style={{ color: 'red' }}>●</span> AWS &nbsp;
      <span style={{ color: 'blue' }}>●</span> Azure &nbsp;
      <span style={{ color: 'yellow' }}>●</span> GCP
      <br />
      <span style={{ color: 'lime' }}>━</span> Low latency &nbsp;
      <span style={{ color: 'yellow' }}>━</span> Medium latency &nbsp;
      <span style={{ color: 'red' }}>━</span> High latency
    </div>
  );
}

export default Legend;
