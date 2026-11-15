import { regionalEnemyIds } from '../regionEnemies';
import { createWave, group } from '../waves/builders';
import type { WaveDefinition, WaveGroup } from '../waves/types';

type RegionalEnemies = (typeof regionalEnemyIds)[keyof typeof regionalEnemyIds];

function gymWaveCount(regionIndex: number, gymIndex: number) {
  const lastGyms = gymIndex >= 4 ? 1 : 0;
  return 8 + Math.min(regionIndex, 1) + lastGyms;
}

function wavesForLanes(groups: readonly WaveGroup[], waveIndex: number, lanes: number) {
  if (lanes === 1 || groups.length === 1) return groups;
  return groups.map((spawn, index) => ({ ...spawn, pathIndex: (waveIndex + index) % lanes }));
}

export function makeGymWaves(
  roster: RegionalEnemies,
  signature: string,
  ace: string,
  regionIndex: number,
  gymIndex: number,
  lanes: number,
): WaveDefinition[] {
  const waveCount = gymWaveCount(regionIndex, gymIndex);
  const crowd = Math.floor((regionIndex + gymIndex) / 3);
  const healthPressure = 0.98 + regionIndex * 0.07 + gymIndex * 0.027;
  const speedPressure = 0.97 + regionIndex * 0.025 + gymIndex * 0.009;
  const groups = [
    [group(roster.normal, 6, 1.18)],
    [group(roster.normal, 6 + crowd, 0.91), group(signature, 4, 1.04, 5.5)],
    [group(roster.fast, 7 + crowd, 0.69), group(roster.tank, 3 + regionIndex, 1.58, 4.6)],
    [group(signature, 7 + crowd, 0.78), group(roster.flying, 4 + regionIndex, 1.06, 5.2)],
    [group(roster.regen, 6 + crowd, 1.01), group(roster.shield, 4 + regionIndex, 1.12, 4.6)],
    [group(roster.split, 5 + regionIndex, 1.04), group(signature, 8 + crowd, 0.69, 6)],
    [group(roster.fast, 8 + crowd, 0.59), group(roster.stealth, 5 + regionIndex, 0.94, 4.6)],
    [group(roster.tank, 6 + crowd, 0.99), group(roster.flying, 7 + regionIndex, 0.67, 6.3)],
    [group(roster.hasteBoss, 1, 0.85, 1.7), group(roster.shield, 7 + crowd, 0.74), group(signature, 9, 0.63, 6.1)],
  ].slice(0, waveCount - 1);

  groups.push([
    group(signature, 8 + crowd, 0.66),
    group(ace, 1, 1, 3.5),
    group(gymIndex % 2 === 0 ? roster.regen : roster.fast, 8 + regionIndex, 0.71, 6.7),
  ]);

  return groups.map((items, waveIndex) => {
    const wave = createWave(waveIndex + 1, wavesForLanes(items, waveIndex, lanes));
    return {
      ...wave,
      healthScale: wave.healthScale * healthPressure,
      speedScale: wave.speedScale * speedPressure,
      bonus: wave.bonus + (waveIndex < 3 ? 19 : 10),
    };
  });
}

export function makeTournamentWaves(lanes: number): WaveDefinition[] {
  const { kanto, johto, hoenn } = regionalEnemyIds;
  const rounds = [
    [group(kanto.normal, 7, 0.91), group(johto.fast, 3, 0.94, 5.8)],
    [group(kanto.tank, 4, 1.49), group(hoenn.regen, 5, 1.04, 4.9)],
    [group(johto.flying, 5, 1), group(kanto.shield, 5, 1.13, 5.2)],
    [group(kanto.healBoss, 1, 1, 3.4), group(hoenn.normal, 8, 0.66), group(johto.fast, 5, 0.82, 7.3)],
    [group(hoenn.split, 5, 1.08), group(johto.fast, 8, 0.79, 6.3)],
    [group(kanto.flying, 7, 0.82), group(johto.shield, 7, 0.98, 4.9), group(hoenn.stealth, 4, 1.02, 9)],
    [group(johto.tank, 9, 0.95), group(kanto.regen, 9, 0.83, 6.6)],
    [group(johto.healBoss, 1, 1, 3.1), group(hoenn.flying, 11, 0.63), group(kanto.fast, 10, 0.63, 6.7)],
    [group(hoenn.flying, 10, 0.67), group(johto.split, 9, 0.85, 5.8), group(kanto.stealth, 5, 0.85, 10.2)],
    [group(johto.shield, 13, 0.65), group(kanto.tank, 11, 0.76, 6.2)],
    [group(hoenn.healBoss, 1, 1, 3.2), group(johto.shield, 8, 0.75), group(kanto.split, 14, 0.64, 6.7)],
    [group(kanto.hasteBoss, 1, 1, 2.1), group(johto.fast, 16, 0.46), group(hoenn.stealth, 11, 0.61, 7)],
    [group(hoenn.tank, 15, 0.67), group(kanto.flying, 14, 0.53, 6), group(johto.stealth, 9, 0.66, 9.6)],
    [group(johto.hasteBoss, 1, 1, 2.7), group(kanto.shield, 15, 0.57), group(hoenn.regen, 14, 0.54, 6.9)],
    [group(kanto.tank, 16, 0.58), group(johto.flying, 15, 0.47, 4.9), group(hoenn.split, 12, 0.59, 9.6)],
    [group(hoenn.hasteBoss, 1, 1, 4.6), group(kanto.healBoss, 1, 1, 9.2), group(johto.shield, 18, 0.5), group(hoenn.flying, 14, 0.51, 5.9), group(kanto.stealth, 10, 0.53, 10.1)],
  ];

  return rounds.map((groups, waveIndex) => {
    const wave = createWave(waveIndex + 1, wavesForLanes(groups, waveIndex, lanes));
    const opening = waveIndex < 8;
    return {
      ...wave,
      healthScale: wave.healthScale * (opening ? 1.18 + waveIndex * 0.035 : 1.39 + waveIndex * 0.012),
      speedScale: wave.speedScale * (1.06 + waveIndex * 0.008),
      bonus: wave.bonus + (waveIndex < 4 ? 78 : opening ? 34 : 18),
    };
  });
}
