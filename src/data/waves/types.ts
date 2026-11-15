export interface WaveGroup {
  readonly enemyId: string;
  readonly count: number;
  readonly interval: number;
  /** Seconds between the start of the wave and the first spawn in this group. */
  readonly delay: number;
  readonly pathIndex?: number;
}

export interface WaveDefinition {
  readonly bonus: number;
  readonly healthScale: number;
  readonly speedScale: number;
  readonly groups: readonly WaveGroup[];
}
