import type { GameFeedback } from '../ecs/effectPool';
import type { EnemyEntity } from '../ecs/world';

export function abilitySystem(enemies: readonly EnemyEntity[], feedback: GameFeedback, delta: number) {
  for (const source of enemies) {
    const { enemy, position } = source;
    if (enemy.health <= 0 || enemy.escaped) continue;
    const { regen, boss } = enemy.definition.traits;
    if (regen) enemy.health = Math.min(enemy.maxHealth, enemy.health + regen * delta);
    if (!boss || enemy.statuses.stun.remaining > 0) continue;

    enemy.abilityCooldown -= delta;
    if (enemy.abilityCooldown > 0) continue;
    enemy.abilityCooldown += boss.interval;
    feedback.queue('boss');

    const radiusSquared = boss.radius ** 2;
    for (const target of enemies) {
      if (target === source || target.enemy.health <= 0 || target.enemy.escaped) continue;
      const dx = target.position.x - position.x;
      const dz = target.position.z - position.z;
      if (dx * dx + dz * dz > radiusSquared) continue;
      if (boss.kind === 'heal') {
        target.enemy.health = Math.min(target.enemy.maxHealth, target.enemy.health + boss.strength);
      } else if (boss.strength >= target.enemy.haste) {
        target.enemy.haste = boss.strength;
        target.enemy.hasteRemaining = Math.max(target.enemy.hasteRemaining, boss.duration ?? boss.interval);
      }
    }
  }
}
