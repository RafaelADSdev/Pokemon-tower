'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { playMapMusic, playSound, setAudioMuted, unlockAudio } from '@/audio/audio';
import type { MapId } from '@/data/maps/types';
import type { GameRuntime } from '@/game/runtime';

const storageKey = 'critter-defense.muted';
const change = 'critter-defense:audio';
let sessionMuted: boolean | undefined;

function getMuted() {
  try { return sessionMuted ?? (window.localStorage.getItem(storageKey) === 'true'); }
  catch { return sessionMuted ?? false; }
}

function subscribe(callback: () => void) {
  window.addEventListener(change, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(change, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useBattleAudio(runtime: GameRuntime, mapId: MapId) {
  const muted = useSyncExternalStore(subscribe, getMuted, () => false);

  useEffect(() => { setAudioMuted(muted); }, [muted]);

  useEffect(() => {
    const activate = () => unlockAudio();
    window.addEventListener('pointerup', activate, { capture: true, once: true });
    window.addEventListener('keydown', activate, { capture: true, once: true });
    playMapMusic(mapId);
    const unsubscribe = runtime.subscribeAudio(playSound);
    return () => {
      window.removeEventListener('pointerup', activate, true);
      window.removeEventListener('keydown', activate, true);
      unsubscribe();
      playMapMusic(null);
    };
  }, [mapId, runtime]);

  function toggleMuted() {
    const next = !getMuted();
    setAudioMuted(next);
    try {
      window.localStorage.setItem(storageKey, String(next));
      sessionMuted = undefined;
    } catch { sessionMuted = next; }
    window.dispatchEvent(new Event(change));
  }

  return { muted, toggleMuted };
}
