// pages/api/globalping-measure.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed, use POST' });
  }

  const { target } = req.body;  // Single hostname or IP
  if (!target) {
    return res.status(400).json({ error: 'Missing target in request body' });
  }

  const apiKey = process.env.GLOBALPING_API_TOKEN;
  if (!apiKey) {
    return res.status(500).json({ error: 'Globalping API key not set' });
  }

  try {
    const response = await fetch('https://api.globalping.io/v1/measurements', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target,             // e.g. 'binance.com'
        type: 'ping',       // test type: ping, traceroute, etc.
        count: 5,           // number of pings per probe
        locations: [],      // Optional: leave empty for default global probes
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    // data.id contains measurement job ID; use this to fetch results later.
    return res.status(200).json({ measurementId: data.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
