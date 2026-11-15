import { enemyById, type EnemyDefinition } from '@/data/enemies';
import type { WaveDefinition } from '@/data/waves/types';

export function createWave(definition: WaveDefinition) {
  const groups = definition.groups.map((group) => {
    const enemy = Object.hasOwn(enemyById, group.enemyId) ? enemyById[group.enemyId] : undefined;
    if (!enemy) throw new Error(`Unknown enemy in wave: ${group.enemyId}`);
    return { enemy, count: group.count, interval: group.interval, delay: group.delay, spawned: 0 };
  });

  return {
    elapsed: 0,
    remaining: groups.reduce((total, group) => total + group.count, 0),
    groups,
    bonus: definition.bonus,
  };
}

export type ActiveWave = ReturnType<typeof createWave>;

export function waveSystem(wave: ActiveWave, delta: number, spawn: (enemy: EnemyDefinition) => void) {
  wave.elapsed += delta;
  if (wave.remaining === 0) return;

  for (const group of wave.groups) {
    while (group.spawned < group.count && group.delay + group.spawned * group.interval <= wave.elapsed) {
      spawn(group.enemy);
      group.spawned++;
      wave.remaining--;
    }
  }
}
