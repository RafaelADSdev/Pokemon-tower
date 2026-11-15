import type { GameFeedback } from '../ecs/effectPool';
import type { ProjectilePool } from '../ecs/projectilePool';
import type { TowerEntity } from '../ecs/world';

export function combatSystem(towers: readonly TowerEntity[], pool: ProjectilePool, feedback: GameFeedback) {
  for (const entity of towers) {
    const { tower, position } = entity;
    if (tower.cooldown > 0 || !tower.target) continue;
    const shot = pool.fire(entity, tower.target);
    if (!shot) continue;
    tower.cooldown = tower.stats.cooldown;
    tower.heading = Math.atan2(tower.target.position.x - position.x, tower.target.position.z - position.z);
    tower.target = null;
    feedback.spawn('shot', shot.position, shot.projectile.color);
    feedback.queue('shot');
  }
}
