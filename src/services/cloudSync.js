// Cloud Synchronization Service for Millany Modas
// Connects desktop, mobile, tablet, and all visitor browsers using Supabase Realtime & PostgreSQL

import { supabase } from './supabaseClient';

const CLOUD_REDIS_URL = 'https://stunning-wolf-211005.upstash.io';
const CLOUD_REDIS_TOKEN = 'gQAAAAAAAzg9AQIgcDFhYTAzYzJkYjkwYTQ0N2MxOTE1YzcwNDQyM2RhNTNiZA';

let lastKnownUpdatedAt = null;

// Helper for direct Redis fallback
async function directRedisCommand(commandArray) {
  try {
    const resp = await fetch(CLOUD_REDIS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUD_REDIS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commandArray)
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    return null;
  }
}

/**
 * Fetches the global master catalog from Supabase.
 * Falls back to direct Redis if Supabase is unavailable.
 */
export async function fetchRemoteStoreData() {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('store_catalog')
      .select('data, updated_at')
      .eq('id', 'master')
      .maybeSingle();

    if (!error && data && data.data) {
      const catalogData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      lastKnownUpdatedAt = catalogData.updatedAt || data.updated_at;
      return catalogData;
    }
  } catch (err) {
    console.warn('Supabase fetch notice:', err.message);
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
 * Saves store data globally to Supabase.
 * Merges partial data into the master catalog.
 */
export async function saveRemoteStoreData(partialData) {
  const timestamp = new Date().toISOString();
  lastKnownUpdatedAt = timestamp;

  // Read current data first to merge
  let currentData = {};
  try {
    const existing = await fetchRemoteStoreData();
    if (existing && typeof existing === 'object') {
      currentData = existing;
    }
  } catch (e) {}

  const merged = {
    ...currentData,
    ...partialData,
    updatedAt: timestamp
  };

  let savedToSupabase = false;

  // 1. Save to Supabase (primary database)
  try {
    const { error } = await supabase
      .from('store_catalog')
      .upsert({
        id: 'master',
        data: merged,
        updated_at: timestamp
      }, { onConflict: 'id' });

    if (!error) {
      savedToSupabase = true;
    } else {
      console.warn('Supabase save error:', error);
    }
  } catch (e) {
    console.warn('Supabase save exception:', e);
  }

  // 2. Also save to Redis as redundant backup
  try {
    await directRedisCommand(['SET', 'millany_store_catalog', JSON.stringify(merged)]);
  } catch (err) {
    console.warn('Redis backup save warning:', err);
  }

  return { success: true, updatedAt: timestamp, supabase: savedToSupabase };
}

/**
 * Subscribes to real-time cloud updates via Supabase Realtime WebSockets.
 * Zero polling, instant delivery, zero serverless origin transfer on Vercel.
 */
export function subscribeToStoreSync(onUpdate) {
  let isSubscribed = true;

  // 1. Initial hydration from Supabase
  fetchRemoteStoreData().then((data) => {
    if (isSubscribed && data) {
      onUpdate(data);
    }
  });

  // 2. Supabase Realtime WebSocket channel
  const channel = supabase
    .channel('millany_catalog_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'store_catalog',
        filter: 'id=eq.master'
      },
      (payload) => {
        if (!isSubscribed) return;
        const newRecord = payload.new;
        if (newRecord && newRecord.data) {
          const parsed = typeof newRecord.data === 'string'
            ? JSON.parse(newRecord.data)
            : newRecord.data;
          if (parsed) {
            lastKnownUpdatedAt = parsed.updatedAt || newRecord.updated_at;
            onUpdate(parsed);
          }
        }
      }
    )
    .subscribe();

  // 3. Fallback only when window gains focus (e.g. user returns to tab)
  const onFocus = async () => {
    if (!isSubscribed) return;
    try {
      const remote = await fetchRemoteStoreData();
      if (!remote || !remote.updatedAt) return;
      if (!lastKnownUpdatedAt || remote.updatedAt !== lastKnownUpdatedAt) {
        lastKnownUpdatedAt = remote.updatedAt;
        onUpdate(remote);
      }
    } catch (e) {}
  };
  window.addEventListener('focus', onFocus);

  return () => {
    isSubscribed = false;
    window.removeEventListener('focus', onFocus);
    supabase.removeChannel(channel);
  };
}
