import type { GameFeedback } from '../ecs/effectPool';
import type { ProjectilePool } from '../ecs/projectilePool';
import { snapshotPosition, type EnemyEntity, type ProjectileEntity } from '../ecs/world';
import { damageEnemy } from './damage';
import { canHitTarget } from './targeting';

function applyProjectileDamage(target: EnemyEntity, projectile: ProjectileEntity['projectile'], feedback: GameFeedback) {
  const damage = damageEnemy(target, projectile);
  if (damage > 0) feedback.spawn('damage', target.position, projectile.color, damage);
}

function splashDamage(
  target: EnemyEntity, projectile: ProjectileEntity['projectile'], enemies: readonly EnemyEntity[], feedback: GameFeedback,
) {
  const radiusSquared = projectile.splash ** 2;
  if (radiusSquared === 0) return;

  for (const other of enemies) {
    if (other === target || !canHitTarget(other, projectile.targets)) continue;
    const dx = target.position.x - other.position.x;
    const dz = target.position.z - other.position.z;
    if (dx * dx + dz * dz <= radiusSquared) applyProjectileDamage(other, projectile, feedback);
  }
}

export function projectileSystem(
  entities: readonly ProjectileEntity[], enemies: readonly EnemyEntity[], pool: ProjectilePool, feedback: GameFeedback, delta: number,
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
      feedback.spawn('impact', target.position, projectile.color, 0, {
        element: projectile.element,
        heading: dx || dz ? Math.atan2(dx, dz) : projectile.heading,
        radius: projectile.splash,
      });
      feedback.queue('impact', projectile.element);
      applyProjectileDamage(target, projectile, feedback);
      splashDamage(target, projectile, enemies, feedback);
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
