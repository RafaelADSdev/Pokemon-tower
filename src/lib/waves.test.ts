import { describe, expect, it } from "vitest";
import { enemyById, starterEnemy } from "../data/enemies";
import { maps } from "../data/maps";
import { getMapWaves } from "../data/waves";
import { wavePreview } from "./waves";

describe("map waves", () => {
  it.each(maps)("provides 30 valid and progressively scaled waves for $name", (map) => {
    const waves = getMapWaves(map.id);

    expect(waves).toHaveLength(30);
    expect(waves[0]).toMatchObject({ healthScale: 1, speedScale: 1 });

    for (const [index, wave] of waves.entries()) {
      expect(wave.groups.length).toBeGreaterThan(0);
      expect(wave.bonus).toBeGreaterThan(0);
      if (index > 0) {
        expect(wave.healthScale).toBeGreaterThan(waves[index - 1].healthScale);
        expect(wave.speedScale).toBeGreaterThan(waves[index - 1].speedScale);
      }

      for (const group of wave.groups) {
        expect(Object.hasOwn(enemyById, group.enemyId)).toBe(true);
        expect(Number.isInteger(group.count)).toBe(true);
        expect(group.count).toBeGreaterThan(0);
        expect(group.interval).toBeGreaterThan(0);
        expect(group.delay).toBeGreaterThanOrEqual(0);
        if (group.pathIndex !== undefined) expect(map.paths[group.pathIndex]).toBeDefined();
      }

      const bossWave = (index + 1) % 10 === 0;
      expect(wave.groups.some(({ enemyId }) => Boolean(enemyById[enemyId]?.traits.boss))).toBe(bossWave);
      const previewCount = wavePreview(wave).reduce((count, entry) => count + entry.count, 0);
      expect(previewCount).toBe(wave.groups.reduce((count, group) => count + group.count, 0));
    }
  });

  it("combines repeated enemy groups in the cave preview while both lanes receive spawns", () => {
    const [wave] = getMapWaves("cave");
    expect(new Set(wave.groups.map(({ pathIndex }) => pathIndex))).toEqual(new Set([0, 1]));
    expect(wavePreview(wave)).toEqual([
      { enemy: starterEnemy, count: wave.groups.reduce((count, group) => count + group.count, 0) },
    ]);
  });
});
