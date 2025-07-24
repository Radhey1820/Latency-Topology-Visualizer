// app/api/latency/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.cloudflare.com/client/v4/radar/netflows/timeseries?metrics=latency&dateRange=1d&format=json',
      {
        headers: {
          Authorization: `Bearer ${process.env.CF_RADAR_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
