/**
 * Storage service — wraps the platform's window.storage API.
 * Falls back to an in-memory store when the API is unavailable
 * (e.g., when running outside the Antigravity IDE, or during tests).
 */

const STORAGE_KEY = "isms-grc-state-v1";

const memoryStore = {};

const hasWindowStorage = () =>
  typeof window !== "undefined" && typeof window.storage?.get === "function";

export const storageService = {
  async get(key = STORAGE_KEY) {
    if (hasWindowStorage()) {
      const res = await window.storage.get(key, false);
      return res?.value ? JSON.parse(res.value) : null;
    }
    return memoryStore[key] ?? null;
  },

  async set(key = STORAGE_KEY, value) {
    const serialized = JSON.stringify(value);
    if (hasWindowStorage()) {
      await window.storage.set(key, serialized, false);
    } else {
      memoryStore[key] = value;
    }
  },
};
