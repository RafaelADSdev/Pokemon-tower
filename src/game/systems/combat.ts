import type { GameFeedback } from '../ecs/effectPool';
import type { ProjectilePool } from '../ecs/projectilePool';
import type { TowerEntity } from '../ecs/world';

export function combatSystem(towers: readonly TowerEntity[], pool: ProjectilePool, feedback: GameFeedback) {
  for (const entity of towers) {
    const { tower } = entity;
    if (tower.cooldown > 0 || !tower.target) continue;
    const shot = pool.fire(entity, tower.target);
    if (!shot) continue;
    tower.cooldown = tower.stats.cooldown;
    const { heading, element, color } = shot.projectile;
    tower.heading = heading;
    tower.attackSerial++;
    tower.target = null;
    feedback.spawn('shot', shot.position, color, 0, { element, heading });
    feedback.queue('shot', element);
  }
}
