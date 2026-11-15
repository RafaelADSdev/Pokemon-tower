import { gameRules } from "./rules";

export type Stars = 0 | 1 | 2 | 3;

export const progressionRules = {
  starLives: [1, 8, 16],
  creatureUnlockStars: {
    cragbeak: 1,
    duskspore: 3,
    gildmole: 5,
  } as Readonly<Partial<Record<string, number>>>,
} as const;

export function getStarsForLives(lives: number): Stars {
  const [one, two, three] = progressionRules.starLives;
  const remainingLives = Math.min(gameRules.startingLives, lives);
  if (remainingLives >= three) return 3;
  if (remainingLives >= two) return 2;
  return remainingLives >= one ? 1 : 0;
}

export function getCreatureUnlockStars(creatureId: string): number {
  return Object.hasOwn(progressionRules.creatureUnlockStars, creatureId)
    ? progressionRules.creatureUnlockStars[creatureId] ?? 0
    : 0;
}
