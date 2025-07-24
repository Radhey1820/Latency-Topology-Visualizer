// pages/api/globalping-results/[id].js

export default async function handler(req, res) {
  const {
    query: { id },
  } = req;

  if (!id) {
    return res.status(400).json({ error: 'Measurement ID is required' });
  }

  const apiKey = process.env.GLOBALPING_API_TOKEN;
  if (!apiKey) {
    return res.status(500).json({ error: 'Globalping API key not set' });
  }

  try {
    const response = await fetch(`https://api.globalping.io/v1/measurements/${id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    // Return raw data — parse and transform in frontend as needed
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
