// Cloud Synchronization Service for Millany Modas
// Connects desktop, mobile, tablet, and all visitor browsers to the same real-time catalog

const CLOUD_REDIS_URL = 'https://stunning-wolf-211005.upstash.io';
const CLOUD_REDIS_TOKEN = 'gQAAAAAAAzg9AQIgcDFhYTAzYzJkYjkwYTQ0N2MxOTE1YzcwNDQyM2RhNTNiZA';

let lastKnownUpdatedAt = null;

// Helper to directly call Upstash Redis REST API
async function directRedisCommand(commandArray) {
  const resp = await fetch(CLOUD_REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLOUD_REDIS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commandArray)
  });
  if (!resp.ok) {
    throw new Error(`Redis error: ${resp.status} ${await resp.text()}`);
  }
  return await resp.json();
}

/**
 * Fetches the global master catalog from the cloud.
 * Tries Vercel Serverless Function first, falls back to direct Cloud Redis.
 */
export async function fetchRemoteStoreData() {
  // 1. Try Vercel Serverless /api/store-data
  try {
    const res = await fetch('/api/store-data', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        lastKnownUpdatedAt = json.data.updatedAt;
        return json.data;
      }
    }
  } catch (err) {
    // Proceed to direct cloud fallback
  }

  // 2. Direct Cloud Redis fallback
  try {
    const res = await directRedisCommand(['GET', 'millany_store_catalog']);
    if (res && res.result) {
      const data = typeof res.result === 'string' ? JSON.parse(res.result) : res.result;
      if (data && typeof data === 'object') {
        lastKnownUpdatedAt = data.updatedAt;
        return data;
      }
    }
  } catch (err) {
    console.warn('Direct Cloud Sync fetch warning:', err.message);
  }

  return null;
}

/**
 * Saves store data globally to the cloud so all browsers & devices receive it.
 * Accepts partial or full updates (e.g. { products: [...] } or { storeInfo: {...} }).
 */
export async function saveRemoteStoreData(partialData) {
  const timestamp = new Date().toISOString();
  lastKnownUpdatedAt = timestamp;

  // 1. Send to Vercel Serverless /api/store-data
  try {
    fetch('/api/store-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialData)
    }).catch(() => {});
  } catch (e) {}

  // 2. Also send directly to Cloud Redis to ensure instant cross-device sync
  try {
    // Read current data first to merge
    let currentData = {};
    try {
      const getRes = await directRedisCommand(['GET', 'millany_store_catalog']);
      if (getRes && getRes.result) {
        currentData = typeof getRes.result === 'string' ? JSON.parse(getRes.result) : getRes.result;
      }
    } catch (e) {}

    const merged = {
      ...currentData,
      ...partialData,
      updatedAt: timestamp
    };

    await directRedisCommand(['SET', 'millany_store_catalog', JSON.stringify(merged)]);
    return { success: true, updatedAt: timestamp };
  } catch (err) {
    console.error('Direct Cloud Sync save error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Subscribes to real-time cloud updates.
 * Periodically polls and listens to window focus to sync other devices.
 */
export function subscribeToStoreSync(onUpdate, intervalMs = 15000) {
  let isSubscribed = true;

  const checkForUpdates = async () => {
    if (!isSubscribed) return;
    try {
      const remote = await fetchRemoteStoreData();
      if (!remote || !remote.updatedAt) return;

      if (!lastKnownUpdatedAt || remote.updatedAt !== lastKnownUpdatedAt) {
        lastKnownUpdatedAt = remote.updatedAt;
        onUpdate(remote);
      }
    } catch (err) {
      console.warn('Sync check error:', err);
    }
  };

  const intervalId = setInterval(checkForUpdates, intervalMs);
  const onFocus = () => checkForUpdates();
  window.addEventListener('focus', onFocus);

  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
    window.removeEventListener('focus', onFocus);
  };
}
