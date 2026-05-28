interface MMKVLike {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
  contains: (key: string) => boolean;
}

let storage: MMKVLike;

try {
  const { MMKV } = require('react-native-mmkv');
  storage = new MMKV({ id: 'looga-storage' });
} catch {
  // Fallback en mémoire pour Expo Go (pas de module natif MMKV)
  const _store: Record<string, string> = {};
  storage = {
    set: (key: string, value: string) => { _store[key] = value; },
    getString: (key: string) => _store[key],
    delete: (key: string) => { delete _store[key]; },
    contains: (key: string) => key in _store,
  };
}

export { storage };
