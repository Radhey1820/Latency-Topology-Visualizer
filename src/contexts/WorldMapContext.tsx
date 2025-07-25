'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ProviderFilters = { aws: boolean; azure: boolean; gcp: boolean };

interface WorldMapContextType {
  providerFilters: ProviderFilters;
  setProviderFilters: React.Dispatch<React.SetStateAction<ProviderFilters>>;
  exchangeFilter: string;
  setExchangeFilter: React.Dispatch<React.SetStateAction<string>>;
  latencyFilter: 'all' | 'low' | 'medium' | 'high';
  setLatencyFilter: React.Dispatch<
    React.SetStateAction<'all' | 'low' | 'medium' | 'high'>
  >;
  showRealTime: boolean;
  setShowRealTime: React.Dispatch<React.SetStateAction<boolean>>;
  showHistorical: boolean;
  setShowHistorical: React.Dispatch<React.SetStateAction<boolean>>;
  showRegions: boolean;
  setShowRegions: React.Dispatch<React.SetStateAction<boolean>>;
  fps: number;
  setFps: React.Dispatch<React.SetStateAction<number>>;
  timeRange: '15m' | '1h' | '1d' | '1w';
  setTimeRange: React.Dispatch<
    React.SetStateAction<'15m' | '1h' | '1d' | '1w'>
  >;
  serverPair: [number, number] | null;
  setServerPair: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  showTrends: boolean;
  setShowTrends: React.Dispatch<React.SetStateAction<boolean>>;
}

const WorldMapContext = createContext<WorldMapContextType | undefined>(
  undefined
);

export function WorldMapProvider({ children }: { children: ReactNode }) {
  const [providerFilters, setProviderFilters] = useState<ProviderFilters>({
    aws: true,
    azure: true,
    gcp: true,
  });
  const [exchangeFilter, setExchangeFilter] = useState('');
  const [latencyFilter, setLatencyFilter] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');
  const [showRealTime, setShowRealTime] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [fps, setFps] = useState(0);
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '1d' | '1w'>('15m');
  const [serverPair, setServerPair] = useState<[number, number] | null>(null);
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

export function useWorldMapContext() {
  const context = useContext(WorldMapContext);
  if (!context) {
    throw new Error(
      'useWorldMapContext must be used within a WorldMapProvider'
    );
  }
  return context;
}
