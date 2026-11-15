import type { World } from 'miniplex';
import type { GameFeedback } from '../ecs/effectPool';
import type { EnemyEntity, GameEntity } from '../ecs/world';

export interface EconomyDelta {
  reward: number;
  livesLost: number;
  selectedEnemyGone: boolean;
}

export function cleanupSystem(
  enemies: readonly EnemyEntity[], world: World<GameEntity>, economy: EconomyDelta, feedback: GameFeedback,
  selectedEnemyId: number | null, splitEnemy: (parent: EnemyEntity) => void,
) {
  economy.reward = 0;
  economy.livesLost = 0;
  economy.selectedEnemyGone = false;

  // Bucket removal moves the last entity into this index. Go backwards to visit each one once.
  for (let index = enemies.length - 1; index >= 0; index--) {
    const entity = enemies[index];
    const { enemy } = entity;
    if (enemy.escaped) economy.livesLost += enemy.definition.leakDamage;
    else if (enemy.health <= 0) economy.reward += enemy.definition.reward;
    else continue;

    const kind = enemy.escaped ? 'leak' : 'death';
    feedback.spawn(kind, entity.position, enemy.definition.color, enemy.definition.leakDamage);
    feedback.queue(kind);
    if (entity.id === selectedEnemyId) economy.selectedEnemyGone = true;
    enemy.wave.alive--;
    world.remove(entity);
    if (!enemy.escaped && enemy.definition.traits.split) splitEnemy(entity);
  }
}
