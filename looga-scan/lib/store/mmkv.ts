import { Platform } from 'react-native';

export interface Storage {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
}

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    set: (key, value) => map.set(key, value),
    getString: (key) => map.get(key),
    delete: (key) => { map.delete(key); },
  };
}

function createStorage(): Storage {
  if (Platform.OS === 'web') {
    return createMemoryStorage();
  }

  try {
    // react-native-mmkv v3 — requires native build (dev client)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require('react-native-mmkv');
    return new MMKV({ id: 'looga-scan-storage' });
  } catch {
    // Fallback pour Expo Go (module natif non disponible)
    if (__DEV__) console.warn('[MMKV] Module natif non disponible — fallback mémoire (Expo Go)');
    return createMemoryStorage();
  }
}

export const storage = createStorage();
