import { enemyById, type EnemyDefinition } from "../data/enemies";
import type { WaveDefinition } from "../data/waves/types";

export interface WavePreviewEntry {
  readonly enemy: EnemyDefinition;
  readonly count: number;
}

export function wavePreview(wave: WaveDefinition): WavePreviewEntry[] {
  const counts = new Map<string, number>();
  for (const { enemyId, count } of wave.groups) {
    counts.set(enemyId, (counts.get(enemyId) ?? 0) + count);
  }

  const preview: WavePreviewEntry[] = [];
  for (const [enemyId, count] of counts) {
    const enemy = enemyById[enemyId];
    if (enemy) preview.push({ enemy, count });
  }

  return preview;
}
