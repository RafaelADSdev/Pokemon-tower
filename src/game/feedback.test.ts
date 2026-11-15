import { expect, test } from 'vitest';
import { forestMap } from '@/data/maps/forest';
import { createFeedback, type GameCue } from './ecs/effectPool';
import { createGameWorld, createPosition, type EffectKind } from './ecs/world';
import { createGameRuntime } from './runtime';
import { FIXED_STEP } from './time';

test('feedback emits on gameplay actions and can fade after a run ends', () => {
  const game = createGameRuntime({ ...forestMap, paths: [[[0, 0], [5, 0]]], slots: [{ id: 'a1', position: [1.5, 1] }] }, {
    waves: [{ bonus: 10, healthScale: 1, speedScale: 1, groups: [{ enemyId: 'mossmite', count: 1, delay: 0, interval: 0 }] }],
  });
  const heard: GameCue[] = [];
  const stop = game.subscribeAudio((cue) => heard.push(cue));
  game.subscribeAudio(() => { throw new Error('broken playback'); });
  expect(game.placeTower('a1')).toBe(true);
  expect(game.startWave()).toBe(true);
  expect(heard).toEqual(['place', 'wave']);

  const seen = new Set<EffectKind>();
  for (let frame = 0; frame < 200 && game.store.getState().status === 'running'; frame++) {
    game.advance(FIXED_STEP);
    for (const { effect } of game.queries.effects.entities) seen.add(effect.kind);
  }
  expect(game.store.getState().status).toBe('victory');
  expect(seen).toEqual(new Set(['shot', 'impact', 'damage', 'death']));
  expect(heard).toEqual(expect.arrayContaining(['shot', 'impact', 'death', 'victory']));
  expect(game.queries.effects.entities.find(({ effect }) => effect.kind === 'damage')?.effect.value).toBeGreaterThan(0);
  expect(game.queries.effects.entities.length).toBeGreaterThan(0);
  game.store.getState().setPaused(true);
  const age = game.queries.effects.entities[0].effect.age;
  game.advance(FIXED_STEP);
  expect(game.queries.effects.entities[0].effect.age).toBe(age);
  game.store.getState().setPaused(false);
  for (let frame = 0; frame < 60; frame++) game.advance(FIXED_STEP);
  expect(game.queries.effects.entities).toHaveLength(0);
  stop();
  game.restart();
  game.placeTower('a1');
  expect(heard.filter((cue) => cue === 'place')).toHaveLength(1);
});

test('pool reserves critical slots, reuses entities and coalesces duplicate audio', () => {
  const { world, queries } = createGameWorld();
  const feedback = createFeedback(world, queries.effects);
  const position = createPosition();
  for (let index = 0; index < 800; index++) feedback.spawn('impact', position, '#fff');
  const saturated = queries.effects.entities.length;
  const first = queries.effects.entities[0];
  const serial = first.effect.serial;
  feedback.spawn('death', position, '#fff', 6);
  expect(queries.effects.entities.length).toBe(saturated + 1);
  const heard: GameCue[] = [];
  feedback.subscribe((cue) => heard.push(cue));
  feedback.queue('impact');
  feedback.queue('impact');
  feedback.flush();
  expect(heard).toEqual(['impact']);
  feedback.clear();
  feedback.spawn('impact', position, '#fff');
  expect(queries.effects.entities[0]).toBe(first);
  expect(first.effect.serial).toBeGreaterThan(serial);
});
