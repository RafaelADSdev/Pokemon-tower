import type { ElementId } from "./elements";

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly element: ElementId;
  readonly health: number;
  readonly speed: number;
  readonly reward: number;
  readonly leakDamage: number;
  readonly color: string;
  readonly model: string | null;
}

export const starterEnemy: EnemyDefinition = {
  id: "mossmite",
  name: "Musguim",
  element: "folha",
  health: 44,
  speed: 2.35,
  reward: 8,
  leakDamage: 1,
  color: "#91cf8f",
  model: null,
};

export const enemies: readonly EnemyDefinition[] = [starterEnemy];

export const enemyById: Readonly<Partial<Record<string, EnemyDefinition>>> =
  Object.fromEntries(enemies.map((enemy) => [enemy.id, enemy]));
