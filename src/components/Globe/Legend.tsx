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
