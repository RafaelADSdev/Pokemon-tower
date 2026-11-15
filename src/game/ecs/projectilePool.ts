import type { World } from 'miniplex';
import { starterCreature } from '@/data/creatures';
import { createPosition, snapshotPosition, type GameEntity, type ProjectileEntity, type EnemyEntity, type TowerEntity } from './world';

const CAPACITY = 512;
const TOWER_SHOT_HEIGHT = 0.85;

export function createProjectilePool(world: World<GameEntity>) {
  const available = Array.from({ length: CAPACITY }, (_, index): ProjectileEntity => ({
    id: -1 - index,
    position: createPosition(),
    projectile: {
      color: '', damage: 0, speed: 0, heading: 0, target: null, element: starterCreature.element,
      targets: 'none', splash: 0, status: undefined, airMultiplier: 1,
    },
  }));

  return {
    fire(tower: TowerEntity, target: EnemyEntity) {
      const entity = available.pop();
      if (!entity) return null;

      const { position, projectile } = entity;
      const { definition } = tower.tower;
      position.x = tower.position.x;
      position.y = tower.position.y + TOWER_SHOT_HEIGHT;
      position.z = tower.position.z;
      snapshotPosition(position);
      projectile.color = definition.color;
      projectile.damage = tower.tower.effectiveDamage;
      projectile.speed = definition.projectileSpeed;
      projectile.heading = Math.atan2(target.position.x - position.x, target.position.z - position.z);
      projectile.target = target;
      projectile.element = definition.element;
      projectile.targets = tower.tower.stats.targets;
      projectile.splash = tower.tower.stats.splash;
      projectile.status = tower.tower.stats.status;
      projectile.airMultiplier = tower.tower.stats.airMultiplier;
      world.add(entity);
      return entity;
    },

    release(entity: ProjectileEntity) {
      world.remove(entity);
      entity.projectile.target = null;
      available.push(entity);
    },
  };
}

export type ProjectilePool = ReturnType<typeof createProjectilePool>;
