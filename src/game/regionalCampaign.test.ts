import { expect, test } from 'vitest';
import { campaignExpeditions } from '@/data/campaign';
import type { MapId } from '@/data/maps/types';
import { getCreatureUnlockStars } from '@/data/progression';
import { regionalRosters, tournamentRoster } from '@/data/regionalCreatures';
import { createGameRuntime } from './runtime';
import { FIXED_STEP } from './time';

type Purchase = readonly [slot: string, creature?: string];

// Each layout gets an opening with rapid fire and air coverage, then a support tower
// for hidden enemies. Subsequent purchases wait until earned coins can fund them.
const strategies = {
  forest: [
    ['a4', 'emberling'], ['a6', 'voltwing'], ['a7', 'runebell'], ['a8', 'rivermutt'],
    ['a4'], ['a4'], ['a6'], ['a7'], ['a8'], ['a9', 'rivermutt'], ['a10', 'voltwing'],
    ['a8'], ['a6'], ['a7'], ['a9'], ['a10'], ['a3', 'emberling'], ['a3'], ['a9'], ['a10'],
    ['a5', 'glimleaf'], ['a11', 'runebell'], ['a1', 'emberling'], ['a2', 'glimleaf'],
  ],
  cave: [
    ['c5', 'voltwing'], ['c8', 'emberling'], ['c7', 'runebell'], ['c3', 'rivermutt'],
    ['c4', 'rivermutt'], ['c8'], ['c5'], ['c8'], ['c6', 'runebell'], ['c3'], ['c4'],
    ['c7'], ['c6'], ['c5'], ['c3'], ['c4'], ['c9', 'voltwing'], ['c10', 'voltwing'],
    ['c9'], ['c10'], ['c7'], ['c6'], ['c1', 'emberling'], ['c2', 'emberling'],
  ],
  volcano: [
    ['v4', 'emberling'], ['v9', 'voltwing'], ['v8', 'runebell'], ['v6', 'rivermutt'],
    ['v4'], ['v4'], ['v9'], ['v8'], ['v5', 'runebell'], ['v3', 'voltwing'], ['v6'],
    ['v9'], ['v6'], ['v8'], ['v3'], ['v5'], ['v11', 'rivermutt'], ['v7', 'glimleaf'],
    ['v3'], ['v5'], ['v11'], ['v1', 'emberling'], ['v10', 'glimleaf'], ['v2', 'rivermutt'],
  ],
} as const satisfies Record<MapId, readonly Purchase[]>;

const tournamentStrategy: readonly Purchase[] = [
  ['c5', 'glimleaf'], ['c8', 'cragbeak'], ['c5'], ['c7', 'duskspore'], ['c6', 'duskspore'],
  ['c4', 'runebell'], ['c3', 'runebell'], ['c8'], ['c7'], ['c6'],
  ['c5'], ['c8'], ['c4'], ['c3'], ['c7'], ['c6'], ['c4'], ['c3'],
  ['c9', 'voltwing'], ['c10', 'voltwing'], ['c9'], ['c10'], ['c9'], ['c10'],
  ['c1', 'emberling'], ['c2', 'emberling'], ['c1'], ['c2'], ['c1'], ['c2'],
  ['c11', 'glimleaf'], ['c12', 'glimleaf'], ['c11'], ['c12'], ['c11'], ['c12'],
];

test.each(campaignExpeditions)('clears $id with the regular starting coins', (expedition) => {
  const { map, waves } = expedition;
  const isTournament = expedition.kind === 'tournament';
  const roster = isTournament ? tournamentRoster : regionalRosters[expedition.regionId];
  const runtime = createGameRuntime(map, { waves, roster, seed: 333, canUseCreature: (id) => isTournament || getCreatureUnlockStars(id) === 0 });
  const purchases: readonly Purchase[] = isTournament ? tournamentStrategy : strategies[map.id];
  expect(runtime.roster).toBe(roster);
  expect(runtime.store.getState().maxWaves).toBe(waves.length);
  runtime.store.getState().setSpeed(3);

  let nextPurchase = 0;
  for (let wave = 1; wave <= waves.length; wave++) {
    while (nextPurchase < purchases.length) {
      const [slot, creature] = purchases[nextPurchase];
      if (!(creature ? runtime.placeTower(slot, creature) : runtime.upgradeTower(slot))) break;
      if (creature) expect(runtime.getTower(slot)?.tower.definition).toBe(roster.find(({ id }) => id === creature));
      nextPurchase++;
    }

    expect(runtime.startWave()).toBe(true);
    for (let frame = 0; frame < 3600 && runtime.store.getState().status === 'running'; frame++) {
      runtime.advance(FIXED_STEP);
    }

    const state = runtime.store.getState();
    expect(state.status, `Wave ${wave}, ${state.lives} lives remaining`).toBe(wave === waves.length ? 'victory' : 'ready');
    expect(state.wavesCompleted).toBe(wave);
  }

  expect(runtime.store.getState().lives).toBeGreaterThan(0);
  expect(runtime.queries.enemies.entities).toHaveLength(0);
});
