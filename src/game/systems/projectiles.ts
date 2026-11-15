import type { ProjectilePool } from '../ecs/projectilePool';
import { snapshotPosition, type ProjectileEntity } from '../ecs/world';

export function projectileSystem(entities: readonly ProjectileEntity[], pool: ProjectilePool, delta: number) {
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
      target.enemy.health = Math.max(0, target.enemy.health - projectile.damage);
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
