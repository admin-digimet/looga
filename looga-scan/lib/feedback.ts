import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { storage } from '@/lib/store/mmkv';

const SOUND_ENABLED_KEY = 'sound_enabled';

// Lecteurs audio préchargés (expo-audio — remplace expo-av déprécié)
let validPlayer: AudioPlayer | null = null;
let usedPlayer: AudioPlayer | null = null;
let invalidPlayer: AudioPlayer | null = null;
let soundsLoaded = false;

/**
 * Précharge les 3 sons au démarrage de l'app.
 * Appelé une seule fois dans app/_layout.tsx.
 */
export async function preloadSounds() {
  if (soundsLoaded) return;
  try {
    // Jouer même quand le téléphone est en mode silencieux (iOS)
    await setAudioModeAsync({ playsInSilentMode: true });

    validPlayer = createAudioPlayer(require('@/assets/sounds/valid.mp3'));
    usedPlayer = createAudioPlayer(require('@/assets/sounds/used.mp3'));
    invalidPlayer = createAudioPlayer(require('@/assets/sounds/invalid.wav'));

    for (const p of [validPlayer, usedPlayer, invalidPlayer]) {
      p.volume = 0.8;
    }
    soundsLoaded = true;
  } catch {
    // Sons indisponibles → le feedback haptique reste actif.
  }
}

function isSoundEnabled(): boolean {
  return storage.getString(SOUND_ENABLED_KEY) !== 'false'; // activé par défaut
}

async function play(player: AudioPlayer | null) {
  if (!player || !isSoundEnabled()) return;
  try {
    await player.seekTo(0); // rejoue depuis le début à chaque scan
    player.play();
  } catch {
    // Ignore les erreurs de lecture.
  }
}

/**
 * Feedback multi-canal après un scan — 3 états, chacun son son + sa vibration.
 * Le visuel est géré par ScanResultOverlay.
 */
export function triggerFeedback(status: 'valid' | 'used' | 'invalid') {
  switch (status) {
    case 'valid':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void play(validPlayer);
      break;
    case 'used':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      void play(usedPlayer);
      break;
    case 'invalid':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      void play(invalidPlayer);
      break;
  }
}
