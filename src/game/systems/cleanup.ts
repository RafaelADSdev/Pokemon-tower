import type { World } from 'miniplex';
import type { EnemyEntity, GameEntity } from '../ecs/world';

export interface EconomyDelta {
  reward: number;
  livesLost: number;
}

export function cleanupSystem(enemies: readonly EnemyEntity[], world: World<GameEntity>, economy: EconomyDelta) {
  economy.reward = 0;
  economy.livesLost = 0;

  // Bucket removal moves the last entity into this index. Go backwards to visit each one once.
  for (let index = enemies.length - 1; index >= 0; index--) {
    const entity = enemies[index];
    const { enemy } = entity;
    if (enemy.escaped) economy.livesLost += enemy.definition.leakDamage;
    else if (enemy.health <= 0) economy.reward += enemy.definition.reward;
    else continue;
    world.remove(entity);
  }
}
