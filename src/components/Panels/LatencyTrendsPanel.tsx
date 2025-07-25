import { ASN_MAP, SERVERS } from '@/constants';
import { useWorldMapContext } from '@/contexts/WorldMapContext';
import React, { useEffect, useState, useMemo } from 'react';
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
  /**
   * Controls the visibility of the LatencyTrendsPanel.
   */
  open: boolean;
  /**
   * Callback function to close the panel.
   */
  onClose: () => void;
}

type LatencyEntry = {
  /**
   * Formatted timestamp string of the latency measurement (e.g., 'YYYY-MM-DD HH:mm').
   */
  time: string;
  /**
   * Latency value in milliseconds or null if not available.
   */
  latency: number | null;
};

/**
 * LatencyTrendsPanel component displays historical latency trends between two servers.
 * It fetches latency data from an API according to selected server pair and time range,
 * and visualizes latency over time in a line chart with min, max, and average statistics.
 *
 * The component uses context to read and set server pairs and time ranges, and manages internal
 * loading, error, and history state related to API data fetching.
 *
 * @component
 * @param {LatencyTrendsPanelProps} props - Component props.
 * @returns {JSX.Element | null} The rendered latency trends panel or null if closed/not initialized.
 */
function LatencyTrendsPanel({ open, onClose }: LatencyTrendsPanelProps) {
  const { serverPair, setServerPair, timeRange, setTimeRange } =
    useWorldMapContext();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<LatencyEntry[]>([]);
  const [error, setError] = useState('');

  // Extract source and destination servers and their ASN values from context and constants
  const [srcIdx, dstIdx] = serverPair ?? [-1, -1];
  const srcServer = srcIdx >= 0 ? SERVERS[srcIdx] : null;
  const dstServer = dstIdx >= 0 ? SERVERS[dstIdx] : null;
  const srcASN = srcServer
    ? ASN_MAP[srcServer.id as keyof typeof ASN_MAP]
    : null;
  const dstASN = dstServer
    ? ASN_MAP[dstServer.id as keyof typeof ASN_MAP]
    : null;

  /**
   * Effect hook to fetch historical latency data on changes in selected server pair or time range.
   * Fetches data from the API with aggregation interval and date range based on selected time range.
   * The fetched data is parsed, converted, and stored as latency history state.
   */
  useEffect(() => {
    if (!serverPair || srcASN == null || dstASN == null) return;

    const now = new Date();
    const start = new Date(now);
    let interval = '1h';

    // Determine start time and aggregation interval per selected time range
    switch (timeRange) {
      case '15m':
        start.setMinutes(now.getMinutes() - 15);
        interval = '1m';
        break;
      case '1h':
        start.setHours(now.getHours() - 1);
        interval = '15m';
        break;
      case '1d':
        start.setDate(now.getDate() - 1);
        interval = '1h';
        break;
      case '1w':
        start.setDate(now.getDate() - 7);
        interval = '4h';
        break;
      default:
        start.setDate(now.getDate() - 1);
        interval = '1h';
        break;
    }

    const dateStart = start.toISOString();
    const dateEnd = now.toISOString();

    async function fetchData() {
      setLoading(true);
      setError('');
      setHistory([]);

      try {
        const response = await fetch(
          `api/trend-chart?aggInterval=${interval}&dateStart=${dateStart}&dateEnd=${dateEnd}&srcASN=${srcASN}&dstASN=${dstASN}`
        );
        const json = await response.json();

        if (
          !json.success ||
          !json.result?.pair?.timestamps ||
          !json.result.pair.values
        ) {
          setError('No data returned from API');
          setLoading(false);
          return;
        }

        const { timestamps, values } = json.result.pair;

        // Map timestamps and values to LatencyEntry array, converting values to milliseconds
        const data: LatencyEntry[] = timestamps.map(
          (ts: string, idx: number) => ({
            time: ts.slice(0, 16).replace('T', ' '), // Format 'YYYY-MM-DD HH:mm'
            latency:
              values[idx] === null ? null : Math.round(values[idx] * 1000),
          })
        );

        setHistory(data);
      } catch (err) {
        setError(`Error fetching data: ${String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [serverPair, srcASN, dstASN, timeRange]);

  // Memoize the latency entries that have valid (non-null) latency values
  const validHistory = useMemo(
    () => history.filter((entry) => entry.latency !== null),
    [history]
  );

  // Compute minimal latency from valid data or 'N/A' if no data
  const minLatency = useMemo(
    () =>
      validHistory.length > 0
        ? Math.min(...validHistory.map((e) => e.latency!))
        : 'N/A',
    [validHistory]
  );

  // Compute maximal latency from valid data or 'N/A'
  const maxLatency = useMemo(
    () =>
      validHistory.length > 0
        ? Math.max(...validHistory.map((e) => e.latency!))
        : 'N/A',
    [validHistory]
  );

  // Compute average latency from valid data or 'N/A'
  const avgLatency = useMemo(() => {
    if (validHistory.length === 0) return 'N/A';
    const sum = validHistory.reduce((acc, cur) => acc + (cur.latency ?? 0), 0);
    return (sum / validHistory.length).toFixed(1);
  }, [validHistory]);

  // Memoize the option elements for server pair selector to optimize rendering
  const serverPairOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < SERVERS.length; i++) {
      for (let j = 0; j < SERVERS.length; j++) {
        if (i !== j) {
          options.push(
            <option key={`${i}-${j}`} value={`${i}-${j}`}>
              {SERVERS[i].name} &rarr; {SERVERS[j].name}
            </option>
          );
        }
      }
    }
    return options;
  }, []);

  if (!open || !serverPair) return null;

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
          alignItems: 'center',
        }}
      >
        <b>Historical Latency Trends</b>
        <button onClick={onClose} style={{ cursor: 'pointer' }}>
          Close
        </button>
      </div>

      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
        <label>
          <small>Exchange Pair:&nbsp;</small>
          <select
            value={`${srcIdx}-${dstIdx}`}
            onChange={(e) => {
              const [a, b] = e.target.value.split('-').map(Number);
              setServerPair([a, b]);
            }}
          >
            {serverPairOptions}
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
            <option value='15m'>15m</option>
            <option value='1h'>1h</option>
            <option value='1d'>1d</option>
            <option value='1w'>1w</option>
          </select>
        </label>
      </div>

      <div>
        <small style={{ opacity: 0.8 }}>
          <b>{srcServer?.name}</b> &rarr; <b>{dstServer?.name}</b>
        </small>
      </div>

      <div
        style={{
          margin: '8px 0',
          display: 'flex',
          gap: '1em',
          fontSize: 15,
        }}
      >
        <span>
          Min: <b>{minLatency} ms</b>
        </span>
        <span>
          Max: <b>{maxLatency} ms</b>
        </span>
        <span>
          Avg: <b>{avgLatency} ms</b>
        </span>
      </div>

      <div
        style={{
          border: '1px solid #3338',
          borderRadius: 6,
          padding: 6,
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
            <LineChart data={history}>
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

      <small style={{ opacity: 0.6, userSelect: 'none' }}>
        Powered by Cloudflare Radar Netflows API.
      </small>
    </div>
  );
}

export default LatencyTrendsPanel;
