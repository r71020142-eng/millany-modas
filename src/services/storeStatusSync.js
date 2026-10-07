import { DEFAULT_STORE_STATUS } from '../data/storeStatus';

const CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a116792823170a';

// Fetch the current global status of the store
export async function fetchRemoteStoreStatus() {
  // 1. Try local or Vercel serverless /api/store-status
  try {
    const res = await fetch('/api/store-status', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.isPaused === 'boolean') {
        saveLocalStoreStatus(data);
        return data;
      }
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

// Persist the status locally and globally to all devices
export async function saveRemoteStoreStatus(newStatus) {
  saveLocalStoreStatus(newStatus);

  // Send to /api/store-status
  try {
    fetch('/api/store-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStatus)
    }).catch(() => {});
  } catch (e) {}

  // Also send directly to cloud endpoint so Vercel & all devices get it
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
