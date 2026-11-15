import { starterEnemy } from "../enemies";
import type { WaveDefinition } from "./types";

export const forestWaves: readonly WaveDefinition[] = [
  {
    bonus: 45,
    groups: [{ enemyId: starterEnemy.id, count: 6, interval: 1.15, delay: 0 }],
  },
  {
    bonus: 55,
    groups: [{ enemyId: starterEnemy.id, count: 9, interval: 0.93, delay: 0 }],
  },
  {
    bonus: 65,
    groups: [
      { enemyId: starterEnemy.id, count: 8, interval: 0.83, delay: 0 },
      { enemyId: starterEnemy.id, count: 6, interval: 0.72, delay: 7 },
    ],
  },
];
