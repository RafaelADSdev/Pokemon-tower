import type { EnemyEntity, TowerEntity } from '../ecs/world';

function withinRadius(source: TowerEntity, target: TowerEntity | EnemyEntity, radius: number) {
  const dx = source.position.x - target.position.x;
  const dz = source.position.z - target.position.z;
  return dx * dx + dz * dz <= radius * radius;
}

export function updateTowerBuffs(towers: readonly TowerEntity[]) {
  for (const target of towers) {
    let damageBoost = 0;
    let rangeBoost = 0;
    for (const aura of towers) {
      const { support } = aura.tower.stats;
      if (aura === target || !support || !withinRadius(aura, target, support.radius)) continue;
      damageBoost = Math.max(damageBoost, support.damage);
      rangeBoost = Math.max(rangeBoost, support.range);
    }
    target.tower.effectiveDamage = target.tower.stats.damage * (1 + damageBoost);
    target.tower.effectiveRange = target.tower.stats.range * (1 + rangeBoost);
  }
}

export function revealSystem(towers: readonly TowerEntity[], enemies: readonly EnemyEntity[]) {
  for (const target of enemies) {
    if (!target.enemy.definition.traits.stealth) continue;
    target.enemy.visible = false;
    for (const aura of towers) {
      const { support } = aura.tower.stats;
      if (!support?.reveal || !withinRadius(aura, target, support.radius)) continue;
      target.enemy.visible = true;
      break;
    }
  }
}
