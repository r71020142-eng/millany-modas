import { DEFAULT_STORE_STATUS } from '../data/storeStatus';
import { supabase } from './supabaseClient';

const CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a116792823170a';

// Fetch the current global status of the store
export async function fetchRemoteStoreStatus() {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('store_catalog')
      .select('data')
      .eq('id', 'status')
      .maybeSingle();

    if (!error && data && data.data && typeof data.data.isPaused === 'boolean') {
      saveLocalStoreStatus(data.data);
      return data.data;
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Try direct Cloud URL fallback
  try {
    const res = await fetch(CLOUD_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && typeof json.data.isPaused === 'boolean') {
        saveLocalStoreStatus(json.data);
        return json.data;
      }
    }
  } catch (err) {
    // Continue to local storage fallback
  }

  // 3. Fallback to localStorage
  return getLocalStoreStatus();
}

// Persist the status locally and globally to all devices via Supabase
export async function saveRemoteStoreStatus(newStatus) {
  saveLocalStoreStatus(newStatus);

  // 1. Save to Supabase (primary)
  try {
    await supabase
      .from('store_catalog')
      .upsert({
        id: 'status',
        data: newStatus,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
  } catch (e) {
    console.warn('Supabase store status save error:', e);
  }

  // 2. Also send to backup cloud endpoint
  try {
    fetch(CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'millany_store_status',
        data: newStatus
      })
    }).catch(() => {});
  } catch (e) {}

  return newStatus;
}

/**
 * Subscribes to store status changes via Supabase Realtime WebSockets.
 * Instant store pause/unpause without polling!
 */
export function subscribeToStoreStatus(onUpdate) {
  let isSubscribed = true;

  // 1. Initial fetch
  fetchRemoteStoreStatus().then((status) => {
    if (isSubscribed && status) {
      onUpdate(status);
    }
  });

  // 2. Realtime WebSocket channel for instant status changes
  const channel = supabase
    .channel('millany_status_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'store_catalog',
        filter: 'id=eq.status'
      },
      (payload) => {
        if (!isSubscribed) return;
        const newRecord = payload.new;
        if (newRecord && newRecord.data && typeof newRecord.data.isPaused === 'boolean') {
          saveLocalStoreStatus(newRecord.data);
          onUpdate(newRecord.data);
        }
      }
    )
    .subscribe();

  // 3. Focus listener
  const onFocus = async () => {
    if (!isSubscribed) return;
    try {
      const status = await fetchRemoteStoreStatus();
      if (status && typeof status.isPaused === 'boolean') {
        onUpdate(status);
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

export function getLocalStoreStatus() {
  try {
    const saved = localStorage.getItem('millany_store_status_v1');
    if (saved) {
      return { ...DEFAULT_STORE_STATUS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Erro ao ler localStorage store status:', e);
  }
  return DEFAULT_STORE_STATUS;
}

export function saveLocalStoreStatus(status) {
  try {
    localStorage.setItem('millany_store_status_v1', JSON.stringify(status));
  } catch (e) {
    console.error('Erro ao salvar localStorage store status:', e);
  }
}
