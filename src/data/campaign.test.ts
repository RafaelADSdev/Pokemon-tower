import { expect, test } from 'vitest';
import { campaignExpeditions, campaignRegions, finalTournament, getCampaignExpedition, type GymExpedition } from './campaign';
import { enemyById } from './enemies';
import { regionalRosters, tournamentRoster } from './regionalCreatures';
import type { WaveDefinition } from './waves/types';

const gyms = campaignExpeditions.filter((expedition): expedition is GymExpedition => expedition.kind === 'gym');
const dexRanges = { kanto: [1, 151], johto: [152, 251], hoenn: [252, 386] } as const;

function nationalDexNumber(model: string | null | undefined) {
  return Number(model?.match(/\/regular\/(\d+)\.glb$/)?.[1]);
}

test('defines eight ordered gyms in each region and one final expedition', () => {
  expect(campaignRegions.map(({ id }) => id)).toEqual(Object.keys(dexRanges));
  expect(campaignExpeditions).toHaveLength(25);
  expect(new Set(campaignExpeditions.map(({ id }) => id)).size).toBe(25);
  expect(campaignExpeditions.at(-1)).toBe(finalTournament);
  expect(getCampaignExpedition('missing-gym')).toBeUndefined();

  for (const { id } of campaignRegions) {
    const regionalGyms = gyms.filter(({ regionId }) => regionId === id);
    expect(regionalGyms, id).toHaveLength(8);
    expect(regionalGyms.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(regionalGyms.map(({ badge }) => badge)).size).toBe(8);
  }

  for (const expedition of campaignExpeditions) {
    expect(getCampaignExpedition(expedition.id)).toBe(expedition);
  }
});

test('each gym uses region-native Pokémon and valid wave routes', () => {
  for (const gym of gyms) {
    const [first, last] = dexRanges[gym.regionId];
    const lineup = new Set(gym.waves.flatMap(({ groups }) => groups.map(({ enemyId }) => enemyId)));
    expect(gym.waves.length, gym.id).toBeGreaterThanOrEqual(8);

    for (const { groups } of gym.waves) {
      expect(groups.length, gym.id).toBeGreaterThan(0);
      for (const group of groups) {
        const context = `${gym.id} / ${group.enemyId}`;
        expect(Number.isInteger(group.count), context).toBe(true);
        expect(group.count, context).toBeGreaterThan(0);
        expect(group.delay, context).toBeGreaterThanOrEqual(0);
        expect(group.interval, context).toBeGreaterThanOrEqual(0);
        if (group.pathIndex !== undefined) expect(gym.map.paths[group.pathIndex], context).toBeDefined();

        const dex = nationalDexNumber(enemyById[group.enemyId]?.model);
        expect(dex, context).toBeGreaterThanOrEqual(first);
        expect(dex, context).toBeLessThanOrEqual(last);
        const split = enemyById[group.enemyId]?.traits.split;
        if (split) {
          const childDex = nationalDexNumber(enemyById[split.enemyId]?.model);
          expect(childDex, context).toBeGreaterThanOrEqual(first);
          expect(childDex, context).toBeLessThanOrEqual(last);
        }
      }
    }

    expect(gym.featuredEnemies.length, gym.id).toBeGreaterThan(0);
    expect(gym.featuredEnemies.every((enemyId) => lineup.has(enemyId)), gym.id).toBe(true);
    expect(new Set(gym.map.slots.map(({ id }) => id)).size, gym.id).toBe(gym.map.slots.length);
  }
});

test('the selectable Pokémon and their evolutions debut in the same region as the gym', () => {
  for (const { id } of campaignRegions) {
    const [first, last] = dexRanges[id];
    const roster = regionalRosters[id];
    expect(roster, id).toHaveLength(8);
    expect(new Set(roster.map(({ role }) => role)).size, id).toBe(8);
    for (const { name, model, evolution } of roster) {
      for (const path of [model, evolution.model]) {
        const dex = nationalDexNumber(path);
        expect(dex, name).toBeGreaterThanOrEqual(first);
        expect(dex, name).toBeLessThanOrEqual(last);
      }
    }
  }

  const finalRosterDex = tournamentRoster.map(({ model }) => nationalDexNumber(model));
  for (const [first, last] of Object.values(dexRanges)) {
    expect(finalRosterDex.some((dex) => dex >= first && dex <= last)).toBe(true);
  }
});

function waveHealth({ groups, healthScale }: WaveDefinition) {
  return groups.reduce((total, { enemyId, count }) => {
    const enemy = enemyById[enemyId];
    if (!enemy) throw new Error(`Unknown enemy ${enemyId}`);
    return total + (enemy.health + (enemy.traits.shield?.health ?? 0)) * count * healthScale;
  }, 0);
}

test('the final tournament draws from all regions and reaches a higher wave load than any gym', () => {
  expect(finalTournament.kind).toBe('tournament');
  const finalLineup = finalTournament.waves.flatMap(({ groups }) => groups.map(({ enemyId }) => nationalDexNumber(enemyById[enemyId]?.model)));
  for (const [first, last] of Object.values(dexRanges)) {
    expect(finalLineup.some((dex) => dex >= first && dex <= last)).toBe(true);
  }

  expect(finalTournament.waves.length).toBeGreaterThan(Math.max(...gyms.map(({ waves }) => waves.length)));
  const peakGymHealth = Math.max(...gyms.flatMap(({ waves }) => waves.map(waveHealth)));
  expect(Math.max(...finalTournament.waves.map(waveHealth))).toBeGreaterThan(peakGymHealth);
});
