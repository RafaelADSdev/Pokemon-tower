import type { ProjectilePool } from '../ecs/projectilePool';
import { snapshotPosition, type EnemyEntity, type ProjectileEntity } from '../ecs/world';
import { damageEnemy } from './damage';
import { canHitTarget } from './targeting';

function splashDamage(target: EnemyEntity, projectile: ProjectileEntity['projectile'], enemies: readonly EnemyEntity[]) {
  const radiusSquared = projectile.splash ** 2;
  if (radiusSquared === 0) return;

  for (const other of enemies) {
    if (other === target || !canHitTarget(other, projectile.targets)) continue;
    const dx = target.position.x - other.position.x;
    const dz = target.position.z - other.position.z;
    if (dx * dx + dz * dz <= radiusSquared) damageEnemy(other, projectile);
  }
}

export function projectileSystem(
  entities: readonly ProjectileEntity[], enemies: readonly EnemyEntity[], pool: ProjectilePool, delta: number,
) {
  for (let index = entities.length - 1; index >= 0; index--) {
    const entity = entities[index];
    const { position, projectile } = entity;
    const { target } = projectile;
    if (!target || target.enemy.escaped || target.enemy.health <= 0) {
      pool.release(entity);
      continue;
    }

    const dx = target.position.x - position.x;
    const dy = target.position.y - position.y;
    const dz = target.position.z - position.z;
    const step = projectile.speed * delta;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    if (distanceSquared <= step * step) {
      damageEnemy(target, projectile);
      splashDamage(target, projectile, enemies);
      pool.release(entity);
      continue;
    }

    snapshotPosition(position);
    const fraction = step / Math.sqrt(distanceSquared);
    position.x += dx * fraction;
    position.y += dy * fraction;
    position.z += dz * fraction;
  }
}
