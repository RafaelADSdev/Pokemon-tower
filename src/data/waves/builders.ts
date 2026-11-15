import { enemyById } from "../enemies";
import { gameRules } from "../rules";
import type { WaveDefinition, WaveGroup } from "./types";

export function group(enemyId: string, count: number, interval: number, delay = 0, pathIndex?: number): WaveGroup {
  return { enemyId, count, interval, delay, pathIndex };
}

export function createWave(number: number, groups: readonly WaveGroup[]): WaveDefinition {
  const step = number - 1;
  const hasBoss = groups.some(({ enemyId }) => enemyById[enemyId]?.traits.boss);
  return {
    bonus: gameRules.waveBaseBonus + gameRules.waveBonusPerStep * step + (hasBoss ? gameRules.bossWaveBonus : 0),
    healthScale: 1 + gameRules.waveHealthPerStep * step + gameRules.waveHealthAcceleration * step ** 2,
    speedScale: 1 + gameRules.waveSpeedPerStep * step,
    groups,
  };
}
