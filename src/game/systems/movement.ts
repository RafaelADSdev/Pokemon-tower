import { samplePath } from '@/lib/pathing';
import { snapshotPosition, type EnemyEntity } from '../ecs/world';

export function movementSystem(entities: readonly EnemyEntity[], delta: number) {
  for (const { enemy, position } of entities) {
    snapshotPosition(position);
    if (enemy.health <= 0) continue;
    const step = enemy.path.length > 0 ? (enemy.speed * enemy.movementFactor * delta) / enemy.path.length : 1;
    enemy.progress = Math.min(1, enemy.progress + step);
    samplePath(enemy.path, enemy.progress, position);
    enemy.escaped = enemy.progress === 1;
  }
}
