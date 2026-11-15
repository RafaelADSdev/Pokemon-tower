import type { CreatureDefinition } from '@/data/creatures';
import type { EnemyEntity, TargetPriority, TowerEntity } from '../ecs/world';

export function canHitTarget(target: EnemyEntity, targets: CreatureDefinition['targets']) {
  return !target.enemy.escaped && target.enemy.health > 0 &&
    (targets === 'any' || (target.enemy.definition.traits.flying ? targets === 'air' : targets === 'ground'));
}

function targetScore(entity: EnemyEntity, priority: TargetPriority, distanceSquared: number) {
  switch (priority) {
    case 'first': return entity.enemy.progress;
    case 'last': return -entity.enemy.progress;
    case 'strongest': return entity.enemy.maxHealth + entity.enemy.maxShield;
    case 'nearest': return -distanceSquared;
  }
}

export function targetingSystem(towers: readonly TowerEntity[], enemies: readonly EnemyEntity[], delta: number) {
  for (const { tower, position } of towers) {
    tower.cooldown = Math.max(0, tower.cooldown - delta);
    if (tower.cooldown > 0 || tower.stats.targets === 'none') continue;

    let selected: EnemyEntity | null = null;
    let bestScore = -Infinity;
    const rangeSquared = tower.effectiveRange ** 2;
    for (const entity of enemies) {
      if (!entity.enemy.visible || !canHitTarget(entity, tower.stats.targets)) continue;
      const dx = entity.position.x - position.x;
      const dz = entity.position.z - position.z;
      const distanceSquared = dx * dx + dz * dz;
      if (distanceSquared > rangeSquared) continue;

      const score = targetScore(entity, tower.priority, distanceSquared);
      if (!selected || score > bestScore || (score === bestScore && entity.id < selected.id)) {
        selected = entity;
        bestScore = score;
      }
    }
    tower.target = selected;
  }
}
