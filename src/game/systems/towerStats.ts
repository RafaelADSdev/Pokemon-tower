import { getCreatureStats, type CreatureDefinition } from '@/data/creatures';
import type { TowerLevel, TowerStats } from '../ecs/world';

export function createTowerStats(definition: CreatureDefinition, level: TowerLevel): TowerStats {
  const stats = getCreatureStats(definition, level);
  const evolution = level === 3 ? definition.evolution : undefined;

  return {
    damage: stats.damage,
    range: stats.range,
    cooldown: stats.cooldown,
    targets: evolution?.targets ?? stats.targets ?? definition.targets,
    splash: evolution?.splash ?? stats.splash ?? definition.splash ?? 0,
    status: evolution?.status ?? stats.status ?? definition.status,
    support: evolution?.support ?? stats.support ?? definition.support,
    income: evolution?.income ?? stats.income ?? definition.income,
    airMultiplier: evolution?.airMultiplier ?? stats.airMultiplier ?? definition.airMultiplier ?? 1,
  };
}
