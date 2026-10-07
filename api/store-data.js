// Vercel Serverless Function to synchronize full store data across all devices
const FALLBACK_REDIS_URL = 'https://stunning-wolf-211005.upstash.io';
const FALLBACK_REDIS_TOKEN = 'gQAAAAAAAzg9AQIgcDFhYTAzYzJkYjkwYTQ0N2MxOTE1YzcwNDQyM2RhNTNiZA';

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || FALLBACK_REDIS_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || FALLBACK_REDIS_TOKEN;
  return { url, token };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, token } = getRedisConfig();

  // GET: Retrieve latest master store catalog
  if (req.method === 'GET') {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['GET', 'millany_store_catalog'])
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          return res.status(200).json({ success: true, data: parsed });
        }
      }
      return res.status(200).json({ success: false, data: null, message: 'No remote catalog found' });
    } catch (e) {
      console.error('Vercel API GET store-data error:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST: Save updated store data (merge with existing if partial)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body) {
        return res.status(400).json({ error: 'Body is required' });
      }

      // Fetch existing data to allow partial updates
      let currentData = {};
      try {
        const getResp = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(['GET', 'millany_store_catalog'])
        });
        if (getResp.ok) {
          const json = await getResp.json();
          if (json && json.result) {
            currentData = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          }
        }
      } catch (err) {
        console.warn('Could not read existing catalog, overwriting:', err);
      }

      const mergedData = {
        ...currentData,
        ...body,
        updatedAt: new Date().toISOString()
      };

      const setResp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', 'millany_store_catalog', JSON.stringify(mergedData)])
      });

      if (setResp.ok) {
        return res.status(200).json({
          success: true,
          updatedAt: mergedData.updatedAt
        });
      } else {
        const errText = await setResp.text();
        return res.status(502).json({ error: 'Failed to write to Redis', details: errText });
      }
    } catch (e) {
      console.error('Vercel API POST store-data error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
