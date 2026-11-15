import { expect, test } from 'vitest';
import { maps } from '@/data/maps';
import type { MapId } from '@/data/maps/types';
import { getCreatureUnlockStars } from '@/data/progression';
import { getMapWaves } from '@/data/waves';
import { createGameRuntime } from './runtime';
import { FIXED_STEP } from './time';

type Action = readonly [slot: string, creature: string] | readonly [slot: string];

// Recruit the named creature, or upgrade the existing creature when only a slot is listed.
const plans: Record<MapId, readonly Action[]> = {
  forest: [
    ['a4', 'emberling'], ['a6', 'voltwing'], ['a4'], ['a4'], ['a7', 'runebell'], ['a8', 'rivermutt'],
    ['a6'], ['a7'], ['a5', 'glimleaf'], ['a10', 'voltwing'], ['a8'], ['a9', 'rivermutt'],
    ['a7'], ['a6'], ['a8'], ['a5'], ['a5'], ['a9'], ['a10'], ['a9'], ['a10'],
    ['a3', 'emberling'], ['a3'], ['a3'], ['a1', 'emberling'], ['a1'], ['a1'],
    ['a11', 'runebell'], ['a11'], ['a11'], ['a2', 'glimleaf'], ['a2'], ['a2'],
  ],
  cave: [
    ['c5', 'voltwing'], ['c8', 'emberling'], ['c8'], ['c3', 'rivermutt'], ['c4', 'rivermutt'],
    ['c7', 'runebell'], ['c8'], ['c5'], ['c6', 'runebell'], ['c3'], ['c4'], ['c7'], ['c6'],
    ['c5'], ['c3'], ['c4'], ['c9', 'voltwing'], ['c10', 'voltwing'], ['c7'], ['c6'],
    ['c9'], ['c10'], ['c9'], ['c10'], ['c1', 'emberling'], ['c2', 'emberling'],
    ['c1'], ['c2'], ['c1'], ['c2'], ['c11', 'glimleaf'], ['c12', 'glimleaf'], ['c11'], ['c12'], ['c11'], ['c12'],
  ],
  volcano: [
    ['v4', 'emberling'], ['v9', 'voltwing'], ['v4'], ['v4'], ['v6', 'rivermutt'], ['v8', 'runebell'],
    ['v9'], ['v8'], ['v3', 'voltwing'], ['v5', 'runebell'], ['v6'], ['v9'], ['v8'], ['v3'], ['v6'],
    ['v5'], ['v7', 'glimleaf'], ['v11', 'rivermutt'], ['v7'], ['v11'], ['v3'], ['v11'], ['v5'],
    ['v1', 'emberling'], ['v1'], ['v1'], ['v10', 'glimleaf'], ['v10'], ['v10'], ['v7'],
    ['v2', 'rivermutt'], ['v2'], ['v2'],
  ],
};

test.each(maps)('can finish all 30 waves in $name with the starting roster', (map) => {
  const game = createGameRuntime(map, { seed: 333, canUseCreature: (id) => getCreatureUnlockStars(id) === 0 });
  const plan = plans[map.id];
  expect(game.waves).toBe(getMapWaves(map.id));
  expect(game.waves).toHaveLength(30);
  expect(game.placeTower(map.slots[0].id, 'cragbeak')).toBe(false);
  game.store.getState().setSpeed(3);

  let nextAction = 0;
  for (let wave = 1; wave <= game.waves.length; wave++) {
    while (nextAction < plan.length) {
      const [slot, creature] = plan[nextAction];
      if (!(creature ? game.placeTower(slot, creature) : game.upgradeTower(slot))) break;
      nextAction++;
    }
    expect(game.startWave()).toBe(true);
    for (let frame = 0; frame < 3600 && game.store.getState().status === 'running'; frame++) {
      game.advance(FIXED_STEP);
    }
    expect(game.store.getState().status, 'Wave ' + wave).toBe(wave === 30 ? 'victory' : 'ready');
    expect(game.store.getState().wavesCompleted).toBe(wave);
  }

  expect(game.store.getState()).toMatchObject({ status: 'victory', wavesActive: 0, wavesCompleted: 30 });
  expect(game.store.getState().lives).toBeGreaterThan(0);
  expect(game.queries.enemies.entities).toHaveLength(0);
  expect(game.queries.projectiles.entities).toHaveLength(0);
});
