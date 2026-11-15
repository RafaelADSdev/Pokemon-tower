import { expect, test } from 'vitest';
import { caveMap } from '@/data/maps/cave';
import { forestMap } from '@/data/maps/forest';
import { gameRules } from '@/data/rules';
import type { WaveDefinition } from '@/data/waves/types';
import { createGameRuntime } from './runtime';
import { FIXED_STEP } from './time';

test('overlapping waves settle independently and pay their bonuses once', () => {
  const waves: WaveDefinition[] = [
    { bonus: 60, healthScale: 1, speedScale: 1, groups: [{ enemyId: 'mossmite', count: 2, interval: 0.25, delay: 0.5 }] },
    { bonus: 100, healthScale: 1, speedScale: 2, groups: [{ enemyId: 'galefoal', count: 1, interval: 0.1, delay: 0 }] },
  ];
  const game = createGameRuntime({ ...forestMap, paths: [[[0, 0], [0, 0.5], [2, 1]]] }, { waves });
  expect(game.startWave()).toBe(true);
  expect(game.startWave()).toBe(true);
  expect(game.startWave()).toBe(false);
  expect(game.store.getState()).toMatchObject({ wave: 2, wavesActive: 2, wavesCompleted: 0 });
  game.advance(FIXED_STEP);

  const flyer = game.queries.enemies.entities[0];
  expect(flyer.enemy.path.waypoints).toEqual([[0, 0], [2, 1]]);
  game.store.getState().selectEnemy(flyer.id);
  const progressBeforePause = flyer.enemy.progress;
  game.store.getState().setPaused(true);
  game.advance(0.3);
  expect(flyer.enemy.progress).toBe(progressBeforePause);
  game.store.getState().setPaused(false);

  for (let frame = 0; frame < 30; frame++) game.advance(FIXED_STEP);
  expect(game.store.getState()).toMatchObject({
    selectedEnemyId: null,
    wavesActive: 1,
    wavesCompleted: 1,
    status: 'running',
    money: gameRules.startingMoney + 100,
    lives: gameRules.startingLives - 1,
  });
  for (let frame = 0; frame < 120; frame++) game.advance(FIXED_STEP);
  expect(game.store.getState()).toMatchObject({
    status: 'victory',
    wavesCompleted: 2,
    wavesActive: 0,
    money: gameRules.startingMoney + 160,
    lives: gameRules.startingLives - 3,
  });
});

test('the cave uses its explicit lanes and a stable seeded route across render rates', () => {
  const waves: WaveDefinition[] = [{
    bonus: 0, healthScale: 1, speedScale: 1, groups: [
      { enemyId: 'mossmite', count: 2, interval: 0, delay: 0, pathIndex: 1 },
      { enemyId: 'reedrunner', count: 2, interval: 0, delay: 0, pathIndex: 0 },
      { enemyId: 'galefoal', count: 35, interval: 0, delay: 0 },
    ],
  }];
  const regular = createGameRuntime(caveMap, { waves, seed: 333 });
  const faster = createGameRuntime(caveMap, { waves, seed: 333 });
  regular.startWave();
  faster.startWave();
  for (let frame = 0; frame < 120; frame++) regular.advance(FIXED_STEP);
  for (let frame = 0; frame < 240; frame++) faster.advance(FIXED_STEP / 2);

  const entities = regular.queries.enemies.entities;
  const paths = entities.map(({ enemy }) => enemy.pathIndex);
  expect(paths.slice(0, 4)).toEqual([1, 1, 0, 0]);
  expect(new Set(paths.slice(4))).toEqual(new Set([0, 1]));
  expect(entities[0].position.z).toBeGreaterThan(0);
  expect(entities[2].position.z).toBeLessThan(0);
  expect(faster.queries.enemies.entities.map(({ enemy }) => enemy.pathIndex)).toEqual(paths);
  expect(faster.queries.enemies.entities.map(({ position }) => position)).toEqual(entities.map(({ position }) => position));
});

test('upgrading activates the evolved ability and selling returns 70 percent of what was spent', () => {
  const game = createGameRuntime(forestMap);
  const initialMoney = 950;
  game.store.setState({ money: initialMoney });
  expect(game.placeTower('a5')).toBe(true);
  expect(game.setTargetPriority('a5', 'last')).toBe(true);
  expect(game.upgradeTower('a5')).toBe(true);
  expect(game.upgradeTower('a5')).toBe(true);
  expect(game.upgradeTower('a5')).toBe(false);

  const entity = game.getTower('a5');
  expect(entity).toBeDefined();
  expect(entity?.tower).toMatchObject({ level: 3, evolved: true, priority: 'last', stats: { status: { id: 'burn' } } });
  const spent = initialMoney - game.store.getState().money;
  expect(game.sellTower('a5')).toBe(true);
  expect(game.getTower('a5')).toBeUndefined();
  expect(game.store.getState().money).toBe(initialMoney - spent + Math.floor(spent * gameRules.sellRefund));
});
