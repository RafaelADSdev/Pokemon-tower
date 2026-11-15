'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getCampaignExpedition } from '@/data/campaign';
import { maps } from '@/data/maps';
import type { MapId } from '@/data/maps/types';
import { getCreatureUnlockStars, getStarsForLives } from '@/data/progression';
import { gameRules } from '@/data/rules';
import { isExpeditionUnlocked, parseExpeditionResults, type ExpeditionResults } from '@/lib/campaignProgress';

const storageKey = 'critter-defense.progress.v1';
const changeEvent = 'critter-defense:progress';
type Records = Partial<Record<MapId, number>>;
type ProgressRecords = { bestLives: Records; expeditionResults: ExpeditionResults };

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

function parse(raw: string | null): ProgressRecords {
  const empty = { bestLives: {}, expeditionResults: {} };
  if (!raw) return empty;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return empty;
    const saved = value as Record<string, unknown>;
    const valid: Records = {};
    for (const { id } of maps) {
      const lives = saved[id];
      if (typeof lives === 'number' && Number.isInteger(lives) && lives > 0 && lives <= gameRules.startingLives) valid[id] = lives;
    }
    return { bestLives: valid, expeditionResults: parseExpeditionResults(saved.expeditions) };
  } catch { return empty; }
}

function sumStars({ bestLives, expeditionResults }: ProgressRecords) {
  const classicStars = maps.reduce((total, { id }) => total + getStarsForLives(bestLives[id] ?? 0), 0);
  return Object.values(expeditionResults).reduce<number>((total, lives) => total + getStarsForLives(lives ?? 0), classicStars);
}

export function useProgress() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => {
    const records = parse(raw);
    return { ...records, totalStars: sumStars(records) };
  }, [raw]);
}

export function canRecruitCreature(creatureId: string) {
  return sumStars(parse(snapshot())) >= getCreatureUnlockStars(creatureId);
}

export function recordVictory(mapId: MapId, lives: number) {
  const records = parse(snapshot());
  if (lives <= (records.bestLives[mapId] ?? 0)) return;
  saveProgress({ ...records, bestLives: { ...records.bestLives, [mapId]: lives } });
}

export function recordExpeditionVictory(expeditionId: string, lives: number) {
  const stage = getCampaignExpedition(expeditionId);
  const records = parse(snapshot());
  if (!stage || !isExpeditionUnlocked(stage, records.expeditionResults)) return;
  if (lives <= (records.expeditionResults[expeditionId] ?? 0)) return;
  saveProgress({ ...records, expeditionResults: { ...records.expeditionResults, [expeditionId]: lives } });
}

function saveProgress({ bestLives, expeditionResults }: ProgressRecords) {
  const next = JSON.stringify({ ...bestLives, expeditions: expeditionResults });
  try {
    window.localStorage.setItem(storageKey, next);
    sessionRecord = null;
  } catch { sessionRecord = next; }
  window.dispatchEvent(new Event(changeEvent));
}
