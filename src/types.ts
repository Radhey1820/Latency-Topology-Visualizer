import { MARKER_COLORS } from "./constants";

export type Server = {
  id: string;
  name: string;
  provider: keyof typeof MARKER_COLORS;
  lat: number;
  lon: number;
  city: string;
};

export type Region = {
  provider: keyof typeof MARKER_COLORS; // 'aws' | 'azure' | 'gcp'
  regionCode: string;
  lat: number;
  lon: number;
  serverCount: number;
};