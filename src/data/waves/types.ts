export interface WaveGroup {
  readonly enemyId: string;
  readonly count: number;
  readonly interval: number;
  /** Seconds between the start of the wave and the first spawn in this group. */
  readonly delay: number;
}

export interface WaveDefinition {
  readonly bonus: number;
  readonly groups: readonly WaveGroup[];
}
