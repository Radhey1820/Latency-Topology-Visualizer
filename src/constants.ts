import { Region, Server } from "./types";

type ServerId = 'binance.com' | 'okx.com' | 'bybit.com';

export const SERVERS: Server[] = [
  {
    id: 'binance.com',
    name: 'Binance',
    provider: 'aws',
    lat: 47.6062,
    lon: -122.3321,
    city: 'Seattle, USA',
  },
  {
    id: 'okx.com',
    name: 'OKX',
    provider: 'azure',
    lat: 22.3964,
    lon: 114.1095,
    city: 'Hong Kong',
  },
  {
    id: 'bybit.com',
    name: 'Bybit',
    provider: 'gcp',
    lat: 1.3521,
    lon: 103.8198,
    city: 'Singapore',
  },
];

export const MARKER_COLORS = {
  aws: 'red',
  azure: 'blue',
  gcp: 'yellow',
};

export const REGION_COLORS = {
  aws: 'orange',
  azure: 'deepskyblue',
  gcp: 'limegreen',
};
export const REGIONS: Region[] = [
  {
    provider: 'aws',
    regionCode: 'us-east-1',
    lat: 37.224,
    lon: -77.433,
    serverCount: 3,
  },
  {
    provider: 'aws',
    regionCode: 'us-west-1',
    lat: 47.6062,
    lon: -122.3321,
    serverCount: 1,
  },
  {
    provider: 'azure',
    regionCode: 'eastus',
    lat: 37.3719,
    lon: -79.8164,
    serverCount: 2,
  },
  {
    provider: 'gcp',
    regionCode: 'asia-south1',
    lat: 19.076,
    lon: 72.8777,
    serverCount: 1,
  },
];

export const ASN_MAP: Record<ServerId, number> = {
  'binance.com': 13335,
  'okx.com': 16509,
  'bybit.com': 264777,
};