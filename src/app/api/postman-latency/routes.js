// pages/api/postman-latency.js

export default async function handler(req, res) {
  const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;
  const MONITOR_ID = process.env.POSTMAN_MONITOR_ID;

  if (!POSTMAN_API_KEY || !MONITOR_ID) {
    return res.status(500).json({ error: 'Postman API key or monitor ID not set' });
  }

  try {
    const runsRes = await fetch(`https://api.getpostman.com/monitors/${MONITOR_ID}/runs`, {
      headers: {
        'X-Api-Key': POSTMAN_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!runsRes.ok) {
      const errorText = await runsRes.text();
      return res.status(runsRes.status).json({ error: errorText });
    }

    const runsData = await runsRes.json();

    if (!runsData.monitor_run || runsData.monitor_run.length === 0) {
      return res.status(404).json({ error: 'No monitor run data available' });
    }

    const latestRun = runsData.monitor_run[0];

    if (!latestRun.run_results) {
      return res.status(404).json({ error: 'No run results in latest monitor run' });
    }

    // Map latency data — adjust naming if needed
    const latencyData = latestRun.run_results.map((runResult) => ({
      region: runResult.region,
      latency: runResult.response_time,
      requestName: runResult.request_name,
      status: runResult.code,
    }));

    return res.status(200).json(latencyData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
