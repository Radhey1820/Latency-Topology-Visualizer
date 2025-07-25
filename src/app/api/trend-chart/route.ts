// app/api/cloudflare-latency/route.js
export async function GET(req: { url: string | URL; }) {
  const { searchParams } = new URL(req.url);
  const srcASN = searchParams.get('srcASN');
  const dstASN = searchParams.get('dstASN');
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');
  const aggInterval = searchParams.get('aggInterval');
  const name = 'pair';

  if (!srcASN || !dstASN || !dateStart || !dateEnd || !aggInterval) {
    return new Response(JSON.stringify({ error: "Missing required params" }), {
      status: 400,
    });
  }

  const cloudflareUrl = `https://api.cloudflare.com/client/v4/radar/netflows/timeseries?name=${name}&aggInterval=${aggInterval}&dateStart=${dateStart}&srcASN=${srcASN}&dstASN=${dstASN}&dateEnd=${dateEnd}&format=json`;

  const resp = await fetch(cloudflareUrl, {
    headers: {
      // You should set CF_RADAR_API_TOKEN in .env.local (not checked into GIT)
      Authorization: `Bearer ${process.env.CF_RADAR_API_TOKEN}`,
    },
  });

  const data = await resp.json();

  // Optionally prune sensitive fields here

  return new Response(JSON.stringify(data), {
    status: resp.ok ? 200 : 500,
    headers: { "content-type": "application/json" },
  });
}
