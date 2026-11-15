'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { maps } from '@/data/maps';
import type { MapId } from '@/data/maps/types';
import { getCreatureUnlockStars, getStarsForLives } from '@/data/progression';
import { gameRules } from '@/data/rules';

const storageKey = 'critter-defense.progress.v1';
const changeEvent = 'critter-defense:progress';
type Records = Partial<Record<MapId, number>>;

let sessionRecord: string | null = null;

function snapshot() {
  try { return sessionRecord ?? window.localStorage.getItem(storageKey); }
  catch { return sessionRecord; }
}

function subscribe(callback: () => void) {
  function storageChanged(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      sessionRecord = null;
      callback();
    }
  }
  window.addEventListener('storage', storageChanged);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener('storage', storageChanged);
    window.removeEventListener(changeEvent, callback);
  };
}

function parse(raw: string | null): Records {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return {};
    const valid: Records = {};
    for (const { id } of maps) {
      const lives = (value as Record<string, unknown>)[id];
      if (typeof lives === 'number' && Number.isInteger(lives) && lives > 0 && lives <= gameRules.startingLives) valid[id] = lives;
    }
    return valid;
  } catch { return {}; }
}

function sumStars(bestLives: Records) {
  return maps.reduce((total, { id }) => total + getStarsForLives(bestLives[id] ?? 0), 0);
}

export function useProgress() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => {
    const bestLives = parse(raw);
    return { bestLives, totalStars: sumStars(bestLives) };
  }, [raw]);
}

export function canRecruitCreature(creatureId: string) {
  return sumStars(parse(snapshot())) >= getCreatureUnlockStars(creatureId);
}

export function recordVictory(mapId: MapId, lives: number) {
  const records = parse(snapshot());
  if (lives <= (records[mapId] ?? 0)) return;
  const next = JSON.stringify({ ...records, [mapId]: lives });
  try {
    window.localStorage.setItem(storageKey, next);
    sessionRecord = null;
  } catch { sessionRecord = next; }
  window.dispatchEvent(new Event(changeEvent));
}
