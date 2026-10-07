// Vercel Serverless Function to synchronize store status globally
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a116792823170a';

  if (req.method === 'GET') {
    try {
      const resp = await fetch(CLOUD_URL);
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.data) {
          return res.status(200).json(json.data);
        }
      }
    } catch (e) {
      console.error('Vercel API GET error:', e);
    }
    return res.status(200).json({ isPaused: false });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const resp = await fetch(CLOUD_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'millany_store_status',
          data: body
        })
      });
      const data = await resp.json();
      return res.status(200).json({ success: true, data });
    } catch (e) {
      console.error('Vercel API POST error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
