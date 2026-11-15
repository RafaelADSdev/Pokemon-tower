import type { World } from 'miniplex';
import { createPosition, snapshotPosition, type GameEntity, type ProjectileEntity, type EnemyEntity, type TowerEntity } from './world';

const CAPACITY = 512;
const TOWER_SHOT_HEIGHT = 0.85;

export function createProjectilePool(world: World<GameEntity>) {
  const available = Array.from({ length: CAPACITY }, (_, index): ProjectileEntity => ({
    id: -1 - index,
    position: createPosition(),
    projectile: { color: '', damage: 0, speed: 0, target: null },
  }));

  return {
    fire(tower: TowerEntity, target: EnemyEntity) {
      const entity = available.pop();
      if (!entity) return false;

      const { position, projectile } = entity;
      const { definition } = tower.tower;
      position.x = tower.position.x;
      position.y = tower.position.y + TOWER_SHOT_HEIGHT;
      position.z = tower.position.z;
      snapshotPosition(position);
      projectile.color = definition.color;
      projectile.damage = definition.damage;
      projectile.speed = definition.projectileSpeed;
      projectile.target = target;
      world.add(entity);
      return true;
    },

    release(entity: ProjectileEntity) {
      world.remove(entity);
      entity.projectile.target = null;
      available.push(entity);
    },
  };
}

export type ProjectilePool = ReturnType<typeof createProjectilePool>;
