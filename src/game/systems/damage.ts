import { calculateDamage, elementMultiplier } from '@/lib/damage';
import type { EnemyEntity, ProjectileEntity } from '../ecs/world';
import { applyStatus } from './status';

export function damageEnemy(target: EnemyEntity, projectile: ProjectileEntity['projectile']) {
  const { enemy } = target;
  const durability = enemy.health + enemy.shield;
  const { mark } = enemy.statuses;
  const markMultiplier = mark.remaining > 0 ? 1 + mark.strength : 1;
  const airMultiplier = enemy.definition.traits.flying ? projectile.airMultiplier : 1;
  let damage = projectile.damage * airMultiplier * markMultiplier;

  const shield = enemy.definition.traits.shield;
  if (shield && enemy.shield > 0) {
    const shieldMultiplier = elementMultiplier(projectile.element, shield.element);
    const absorbed = Math.min(damage, enemy.shield / shieldMultiplier);
    enemy.shield = Math.max(0, enemy.shield - absorbed * shieldMultiplier);
    damage -= absorbed;
  }

  enemy.health = Math.max(0, enemy.health - calculateDamage(damage, projectile.element, enemy.definition.element));
  if (projectile.status && enemy.health > 0) applyStatus(enemy.statuses, projectile.status);
  return durability - enemy.health - enemy.shield;
}
