import { strict as assert } from 'node:assert';
import { arch, cpus, platform } from 'node:os';
import { bench } from 'vitest';
import { creatures } from '@/data/creatures';
import { forestMap } from '@/data/maps/forest';
import { samplePath } from '@/lib/pathing';
import { snapshotPosition } from './ecs/world';
import { createGameRuntime, type GameRuntime } from './runtime';
import { FIXED_STEP } from './time';

const activeEnemies = 300;
const measuredSteps = 2400;
const enemyCounts = [
  ['mossmite', 68], ['reedrunner', 58], ['flinthide', 38], ['galefoal', 38], ['springtail', 33],
  ['cindershield', 27], ['hollowpod', 20], ['mistveil', 16], ['marrowcrown', 1], ['ashdrummer', 1],
] as const;

function prepareBattle(): GameRuntime {
  const runtime = createGameRuntime(forestMap, {
    seed: 333,
    waves: [{
      bonus: 0, healthScale: 10_000, speedScale: 0.025,
      groups: enemyCounts.map(([enemyId, count]) => ({ enemyId, count, delay: 0, interval: 0 })),
    }],
  });
  runtime.store.setState({ money: 100_000 });
  for (const [index, { id }] of forestMap.slots.entries()) {
    assert(runtime.placeTower(id, creatures[index % creatures.length].id));
    assert(runtime.upgradeTower(id));
    assert(runtime.upgradeTower(id));
  }

  assert(runtime.startWave());
  runtime.advance(FIXED_STEP);
  const enemies = runtime.queries.enemies.entities;
  assert.equal(enemies.length, activeEnemies);
  for (const [index, { enemy, position }] of enemies.entries()) {
    // Fill the board at the start. High HP and slow movement keep all 300 active for the sample.
    enemy.progress = ((index * 29) % activeEnemies) / activeEnemies * 0.75;
    samplePath(enemy.path, enemy.progress, position);
    snapshotPosition(position);
  }
  return runtime;
}

let runtime: GameRuntime;

bench('one fixed simulation step with 300 active enemies and 11 evolved towers', () => {
  runtime.advance(FIXED_STEP);
  if (runtime.queries.enemies.entities.length !== activeEnemies) throw new Error('An enemy left the benchmark');
}, {
  time: 0,
  iterations: measuredSteps,
  warmupTime: 0,
  warmupIterations: 600,
  setup(task, mode) {
    runtime = prepareBattle();
    if (mode === 'warmup') return;
    task.addEventListener('cycle', () => {
      const samples = task.result?.samples;
      if (!samples?.length) return;
      const percentile = (p: number) => samples[Math.ceil(samples.length * p) - 1].toFixed(4);
      console.log(`${activeEnemies} enemies · ${samples.length} steps · p50 ${percentile(0.5)} ms · p95 ${percentile(0.95)} ms · p99 ${percentile(0.99)} ms`);
      console.log(`${cpus()[0].model} · ${platform()} ${arch()} · Node ${process.version}`);
    }, { once: true });
  },
});
