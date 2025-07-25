import { ASN_MAP, SERVERS } from '@/constants';
import { useWorldMapContext } from '@/contexts/WorldMapContext';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LatencyTrendsPanelProps {
  open: boolean;
  onClose: () => void;
}

type LatencyEntry = {
  time: string;
  latency: number | null;
};

function LatencyTrendsPanel({ open, onClose }: LatencyTrendsPanelProps) {
  const { serverPair, setServerPair, timeRange, setTimeRange } =
    useWorldMapContext();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<LatencyEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!serverPair) return;
    const [srcIdx, dstIdx] = serverPair;
    const srcServer = SERVERS[srcIdx];
    const dstServer = SERVERS[dstIdx];
    const srcASN = ASN_MAP[srcServer.id as keyof typeof ASN_MAP];
    const dstASN = ASN_MAP[dstServer.id as keyof typeof ASN_MAP];

    // Calculate time range
    const now = new Date();
    let start = new Date(now),
      interval = '1h';
    switch (timeRange) {
      case '15m':
        // Subtract 15 minutes from current time
        start.setMinutes(now.getMinutes() - 15);
        break;
      case '1h':
        // Subtract 1 hour from current time
        start.setHours(now.getHours() - 1);
        interval = '15m'; // finer interval for 1 hour range
        break;
      case '1d':
        // Subtract 1 day (24 hours)
        start.setDate(now.getDate() - 1);
        interval = '1h'; // 1-hour aggregation for a day
        break;
      case '1w':
        // Subtract 7 days (1 week)
        start.setDate(now.getDate() - 7);
        interval = '4h'; // 4-hour aggregation for week range
        break;
      default:
        // Fallback to 1 day
        start.setDate(now.getDate() - 1);
        interval = '1h';
    }
    const dateStart = start.toISOString();
    const dateEnd = now.toISOString();

    setLoading(true);
    setHistory([]);
    setError('');

    fetch(
      `api/trend-chart?aggInterval=${interval}&dateStart=${dateStart}&dateEnd=${dateEnd}&srcASN=${srcASN}&dstASN=${dstASN}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (
          !json.success ||
          !json.result?.pair ||
          !json.result.pair.timestamps ||
          !json.result.pair.values
        ) {
          setError('No data returned from API');
          setLoading(false);
          return;
        }
        const timestamps = json.result.pair.timestamps;
        const values = json.result.pair.values;
        // ms conversion (values may be null)
        const data = timestamps.map((ts: string, idx: string | number) => ({
          time: ts.slice(0, 16).replace('T', ' '), // show as 'YYYY-MM-DD HH:mm'
          latency: values[idx] === null ? null : Math.round(values[idx] * 1000),
        }));
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching data: ' + String(err));
        setLoading(false);
      });
  }, [serverPair, timeRange]);

  if (!open || !serverPair) return null;
  const [srcIdx, dstIdx] = serverPair;
  const valid =
    history && Array.isArray(history)
      ? history.filter((d) => d.latency !== null)
      : [];
  const min = valid.length
    ? Math.min(...valid.map((d: { latency: any }) => d.latency))
    : 'N/A';
  const max = valid.length
    ? Math.max(...valid.map((d: { latency: any }) => d.latency))
    : 'N/A';
  const avg = valid.length
    ? (
        valid.reduce((a: any, b: { latency: any }) => a + b.latency, 0) /
        valid.length
      ).toFixed(1)
    : 'N/A';

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 390,
        maxWidth: '95vw',
        background: '#222c',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <b>Historical Latency Trends</b>
        <button onClick={onClose}>Close</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>
          <small>Exchange Pair:&nbsp;</small>
          <select
            value={`${srcIdx}-${dstIdx}`}
            onChange={(e) => {
              const [a, b] = e.target.value.split('-').map(Number);
              setServerPair([a, b]);
            }}
          >
            {SERVERS.map((sA, i) =>
              SERVERS.map((sB, j) =>
                i !== j ? (
                  <option key={`${i}-${j}`} value={`${i}-${j}`}>
                    {sA.name} &rarr; {sB.name}
                  </option>
                ) : null
              )
            )}
          </select>
        </label>
        <label style={{ marginLeft: 12 }}>
          <small>Time Range:&nbsp;</small>
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as '15m' | '1h' | '1d' | '1w')
            }
          >
            <option value='1h'>15m</option>
            <option value='24h'>1h</option>
            <option value='7d'>1d</option>
            <option value='30d'>1w</option>
          </select>
        </label>
      </div>
      <div>
        <small style={{ opacity: 0.8 }}>
          <b>{SERVERS[srcIdx].name}</b> &rarr; <b>{SERVERS[dstIdx].name}</b>
        </small>
      </div>
      <div
        style={{ margin: '8px 0', display: 'flex', gap: '1em', fontSize: 15 }}
      >
        <span>
          Min: <b>{min} ms</b>
        </span>
        <span>
          Max: <b>{max} ms</b>
        </span>
        <span>
          Avg: <b>{avg} ms</b>
        </span>
      </div>
      <div
        style={{
          border: '1px solid #3338',
          borderRadius: 6,
          padding: '6px',
          marginBottom: 4,
          height: 210,
          background: '#111c',
        }}
      >
        {loading ? (
          <em>Loading...</em>
        ) : error ? (
          <span style={{ color: 'salmon' }}>{error}</span>
        ) : (
          <ResponsiveContainer width='100%' height={190}>
            <LineChart data={history || []}>
              <CartesianGrid stroke='#3334' />
              <XAxis dataKey='time' tick={{ fontSize: 11 }} minTickGap={15} />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip />
              <Line
                type='monotone'
                dataKey='latency'
                stroke='#00ffc0'
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <small style={{ opacity: 0.6 }}>
        Powered by Cloudflare Radar Netflows API.
      </small>
    </div>
  );
}

export default LatencyTrendsPanel;
