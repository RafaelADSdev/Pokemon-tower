import type { EnemyEntity, TowerEntity } from '../ecs/world';

export function targetingSystem(towers: readonly TowerEntity[], enemies: readonly EnemyEntity[], delta: number) {
  for (const { tower, position } of towers) {
    tower.cooldown = Math.max(0, tower.cooldown - delta);
    if (tower.cooldown > 0) continue;

    let selected: EnemyEntity | null = null;
    const rangeSquared = tower.definition.range ** 2;
    for (const entity of enemies) {
      if (entity.enemy.escaped || entity.enemy.health <= 0) continue;
      const dx = entity.position.x - position.x;
      const dz = entity.position.z - position.z;
      if (dx * dx + dz * dz > rangeSquared) continue;

      if (!selected || entity.enemy.progress > selected.enemy.progress ||
          (entity.enemy.progress === selected.enemy.progress && entity.id < selected.id)) {
        selected = entity;
      }
    }
    tower.target = selected;
  }
}
