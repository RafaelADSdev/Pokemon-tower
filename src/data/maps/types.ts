export type Waypoint = readonly [x: number, z: number];

export interface TowerSlot {
  readonly id: string;
  readonly position: Waypoint;
}

export interface MapTheme {
  readonly biome: "forest" | "cave" | "volcano";
  readonly terrain: string;
  readonly trail: string;
  readonly edge: string;
  readonly accent: string;
  readonly atmosphere: string;
}

export interface MapDefinition {
  readonly id: string;
  readonly name: string;
  readonly size: { readonly width: number; readonly depth: number };
  readonly paths: readonly (readonly Waypoint[])[];
  readonly slots: readonly TowerSlot[];
  readonly theme: MapTheme;
}
