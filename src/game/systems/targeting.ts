import type { CreatureDefinition } from '@/data/creatures';
import type { EnemyEntity, TargetPriority, TowerEntity } from '../ecs/world';

export const ATTACK_WINDUP_SECONDS = 0.16;

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
    const previousCooldown = tower.cooldown;
    tower.cooldown = Math.max(0, previousCooldown - delta);
    const ready = tower.cooldown === 0;
    const beginWindup = previousCooldown > ATTACK_WINDUP_SECONDS && tower.cooldown <= ATTACK_WINDUP_SECONDS;
    if ((!ready && !beginWindup) || tower.stats.targets === 'none') continue;

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
    if (ready) {
      tower.target = selected;
      tower.aimHeading = undefined;
    } else if (selected) {
      tower.aimHeading = Math.atan2(selected.position.x - position.x, selected.position.z - position.z);
    }
  }
}
