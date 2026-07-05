import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your home server's actual LAN address once you deploy the
// backend (see backend/README.md), or set it from the in-app Settings screen.
export const DEFAULT_API_BASE_URL = 'http://home.home:4000/api';

const STORAGE_KEY = 'homehub.apiBaseUrl';

let cachedBaseUrl: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  cachedBaseUrl = stored || DEFAULT_API_BASE_URL;
  return cachedBaseUrl;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const trimmed = url.trim().replace(/\/+$/, '');
  cachedBaseUrl = trimmed;
  await AsyncStorage.setItem(STORAGE_KEY, trimmed);
}
