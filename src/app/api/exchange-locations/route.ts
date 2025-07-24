import { NextResponse } from 'next/server';

export async function GET() {
  const exchangeLocations = [
    {
      exchange: 'Binance',
      provider: 'AWS',
      location: 'Singapore',
      lat: 1.3521,
      lon: 103.8198,
    },
    {
      exchange: 'Bybit',
      provider: 'Azure',
      location: 'Tokyo',
      lat: 35.6895,
      lon: 139.6917,
    },
    {
      exchange: 'OKX',
      provider: 'GCP',
      location: 'Frankfurt',
      lat: 50.1109,
      lon: 8.6821,
    },
    {
      exchange: 'Deribit',
      provider: 'AWS',
      location: 'London',
      lat: 51.5074,
      lon: -0.1278,
    },
    {
      exchange: 'Kraken',
      provider: 'Azure',
      location: 'San Francisco',
      lat: 37.7749,
      lon: -122.4194,
    },
  ];

  return NextResponse.json(exchangeLocations);
}
