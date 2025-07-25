'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Type definition for cloud provider filters state.
 * Keys represent provider names and values indicate whether the provider is enabled.
 */
export type ProviderFilters = {
  aws: boolean;
  azure: boolean;
  gcp: boolean;
};

/**
 * Type definition for the WorldMapContext's state and state update functions.
 * This context provides global state management for filtering, toggling visualization layers,
 * performance metrics, and selected server pairs in the WorldMap visualization.
 */
export interface WorldMapContextType {
  /** Current enabled state of cloud provider filters */
  providerFilters: ProviderFilters;
  /** Setter for providerFilters state */
  setProviderFilters: React.Dispatch<React.SetStateAction<ProviderFilters>>;

  /** Current exchange or region search filter string */
  exchangeFilter: string;
  /** Setter for exchangeFilter state */
  setExchangeFilter: React.Dispatch<React.SetStateAction<string>>;

  /** Current latency filtering option */
  latencyFilter: 'all' | 'low' | 'medium' | 'high';
  /** Setter for latencyFilter state */
  setLatencyFilter: React.Dispatch<
    React.SetStateAction<'all' | 'low' | 'medium' | 'high'>
  >;

  /** Whether real-time latency lines are shown */
  showRealTime: boolean;
  /** Setter for showRealTime state */
  setShowRealTime: React.Dispatch<React.SetStateAction<boolean>>;

  /** Whether historical latency trends panel is shown */
  showHistorical: boolean;
  /** Setter for showHistorical state */
  setShowHistorical: React.Dispatch<React.SetStateAction<boolean>>;

  /** Whether cloud provider regions are displayed */
  showRegions: boolean;
  /** Setter for showRegions state */
  setShowRegions: React.Dispatch<React.SetStateAction<boolean>>;

  /** Current frames per second (FPS) value from rendering loop */
  fps: number;
  /** Setter for fps state */
  setFps: React.Dispatch<React.SetStateAction<number>>;

  /** Selected time range for latency trends */
  timeRange: '15m' | '1h' | '1d' | '1w';
  /** Setter for timeRange state */
  setTimeRange: React.Dispatch<
    React.SetStateAction<'15m' | '1h' | '1d' | '1w'>
  >;

  /** Pair of selected server indices [sourceIndex, destinationIndex], or null if none */
  serverPair: [number, number] | null;
  /** Setter for serverPair state */
  setServerPair: React.Dispatch<React.SetStateAction<[number, number] | null>>;

  /** Whether latency trends panel is shown */
  showTrends: boolean;
  /** Setter for showTrends state */
  setShowTrends: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * React context instance to hold world map application state.
 * It is initialized as `undefined` to catch improper usage outside provider.
 */
const WorldMapContext = createContext<WorldMapContextType | undefined>(
  undefined
);

/**
 * WorldMapProvider component provides global state for the WorldMap visualization
 * via React context. It manages filter states, visualization toggles, performance stats,
 * and user selections related to cloud providers and latency data.
 *
 * @param {Object} props - React component props.
 * @param {ReactNode} props.children - Child components consuming the context.
 *
 * @returns {JSX.Element} The context provider wrapping child components.
 */
export function WorldMapProvider({ children }: { children: ReactNode }) {
  // Cloud provider filters state (AWS, Azure, GCP)
  const [providerFilters, setProviderFilters] = useState<ProviderFilters>({
    aws: true,
    azure: true,
    gcp: true,
  });

  // Search filter string for exchanges or regions
  const [exchangeFilter, setExchangeFilter] = useState('');

  // Latency filter selecting relevant latency ranges
  const [latencyFilter, setLatencyFilter] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');

  // Visualization toggles
  const [showRealTime, setShowRealTime] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showRegions, setShowRegions] = useState(true);

  // Performance metric tracked in FPS
  const [fps, setFps] = useState(0);

  // Selected time range for historical data
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '1d' | '1w'>('15m');

  // Selected server pair indices for latency trends visualization
  const [serverPair, setServerPair] = useState<[number, number] | null>(null);

  // Whether to show the latency trends panel
  const [showTrends, setShowTrends] = useState<boolean>(false);

  return (
    <WorldMapContext.Provider
      value={{
        providerFilters,
        setProviderFilters,
        exchangeFilter,
        setExchangeFilter,
        latencyFilter,
        setLatencyFilter,
        showRealTime,
        setShowRealTime,
        showHistorical,
        setShowHistorical,
        showRegions,
        setShowRegions,
        fps,
        setFps,
        timeRange,
        setTimeRange,
        serverPair,
        setServerPair,
        showTrends,
        setShowTrends,
      }}
    >
      {children}
    </WorldMapContext.Provider>
  );
}

/**
 * Custom hook to access the WorldMapContext.
 * Throws an error if used outside of the WorldMapProvider.
 *
 * @throws {Error} If there is no context value (not wrapped in provider).
 * @returns {WorldMapContextType} The context value including all state and setters.
 */
export function useWorldMapContext(): WorldMapContextType {
  const context = useContext(WorldMapContext);
  if (!context) {
    throw new Error(
      'useWorldMapContext must be used within a WorldMapProvider'
    );
  }
  return context;
}
