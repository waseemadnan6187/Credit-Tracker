
/**
 * database.ts
 * Live API Bridge for Laravel/MySQL Integration.
 */

const API_BASE = '/api';

export const initDB = async () => {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error("Backend Offline");
    return true;
  } catch (e) {
    console.error("API Connection Failed", e);
    throw new Error("Cannot connect to Laravel server. Please ensure the backend is running.");
  }
};

export const getAllDataForSync = async () => {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch ledger data");
  return await res.json();
};

export const runCommand = async (endpoint: string, method: string = 'POST', data?: any) => {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `API Error ${res.status}`);
  }
  
  return await res.json();
};

export const getSetting = (key: string) => localStorage.getItem(key);
export const setSetting = (key: string, value: string) => localStorage.setItem(key, value);
