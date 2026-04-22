import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import type { AVPlaybackSource } from 'expo-av';

import { storage } from '@/lib/store/mmkv';

const SOUND_ENABLED_KEY = 'sound_enabled';

// Pré-chargement des sons
let validSound: Audio.Sound | null = null;
let usedSound: Audio.Sound | null = null;
let invalidSound: Audio.Sound | null = null;
let soundsLoaded = false;

/**
 * Précharger les sons au démarrage de l'app.
 * Appeler dans app/_layout.tsx une seule fois.
 */
export async function preloadSounds() {
  if (soundsLoaded) return;

  try {
    // Configuration audio pour ne pas interrompre la musique en arrière-plan
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const validAsset = require('@/assets/sounds/valid.mp3') as AVPlaybackSource;
    const usedAsset = require('@/assets/sounds/used.mp3') as AVPlaybackSource;
    const invalidAsset = require('@/assets/sounds/invalid.mp3') as AVPlaybackSource;

    const [v, u, i] = await Promise.all([
      Audio.Sound.createAsync(validAsset, { shouldPlay: false, volume: 0.7 }),
      Audio.Sound.createAsync(usedAsset, { shouldPlay: false, volume: 0.7 }),
      Audio.Sound.createAsync(invalidAsset, { shouldPlay: false, volume: 0.7 }),
    ]);

    validSound = v.sound;
    usedSound = u.sound;
    invalidSound = i.sound;
    soundsLoaded = true;
  } catch {
    // Sons non disponibles — le feedback haptique reste actif
  }
}

function isSoundEnabled(): boolean {
  const val = storage.getString(SOUND_ENABLED_KEY);
  return val !== 'false'; // par défaut activé
}

async function playSound(sound: Audio.Sound | null) {
  if (!sound || !isSoundEnabled()) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Ignorer les erreurs de lecture
  }
}

/**
 * Déclencher le feedback multi-canal après un scan.
 * Visuel = géré par ScanResultOverlay.
 * Son + vibration = gérés ici.
 */
export async function triggerFeedback(status: 'valid' | 'used' | 'invalid') {
  switch (status) {
    case 'valid':
      await Promise.all([
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
        playSound(validSound),
      ]);
      break;

    case 'used':
      await Promise.all([
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
        playSound(usedSound),
      ]);
      break;

    case 'invalid':
      await Promise.all([
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
        playSound(invalidSound),
      ]);
      break;
  }
}
