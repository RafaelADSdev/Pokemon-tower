import { describe, expect, it } from "vitest";
import { creatures } from "./creatures";
import { getCreatureUnlockStars, getStarsForLives, progressionRules } from "./progression";
import { gameRules } from "./rules";

describe("campaign progression", () => {
  it("awards stars at the configured life boundaries and caps rewards at three", () => {
    const [first, second, third] = progressionRules.starLives;
    const samples = [-1, 0, first, second - 1, second, third - 1, third, gameRules.startingLives + 1];
    expect(samples.map(getStarsForLives)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });

  it("keeps a first run viable and unlocks each remaining role within the campaign", () => {
    const startingRoles = creatures.filter(({ id }) => getCreatureUnlockStars(id) === 0).map(({ role }) => role);
    expect(startingRoles.toSorted()).toEqual(["antiAir", "rapid", "slow", "splash", "support"]);
    expect(getCreatureUnlockStars("cragbeak")).toBeGreaterThan(0);
    expect(getCreatureUnlockStars("duskspore")).toBeGreaterThan(getCreatureUnlockStars("cragbeak"));
    expect(getCreatureUnlockStars("gildmole")).toBeGreaterThan(getCreatureUnlockStars("duskspore"));
    expect(getCreatureUnlockStars("gildmole")).toBeLessThanOrEqual(9);
  });
});
