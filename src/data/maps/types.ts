export type Waypoint = readonly [x: number, z: number];
export type MapId = "forest" | "cave" | "volcano";

export interface TowerSlot {
  readonly id: string;
  readonly position: Waypoint;
}

export interface MapTheme {
  readonly biome: MapId;
  readonly terrain: string;
  readonly trail: string;
  readonly edge: string;
  readonly accent: string;
  readonly atmosphere: string;
}

export interface MapDefinition {
  readonly id: MapId;
  readonly name: string;
  readonly nameEn: string;
  readonly subtitle: string;
  readonly subtitleEn: string;
  readonly description: string;
  readonly descriptionEn: string;
  readonly difficulty: "intro" | "standard" | "expert";
  readonly size: { readonly width: number; readonly depth: number };
  readonly paths: readonly (readonly Waypoint[])[];
  readonly slots: readonly TowerSlot[];
  readonly theme: MapTheme;
}
