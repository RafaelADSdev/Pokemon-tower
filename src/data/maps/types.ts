import type { CampaignRegionId, GymSpecialty } from "../campaign/gyms";

export type Waypoint = readonly [x: number, z: number];
export type MapId = "forest" | "cave" | "volcano";
export type BiomeId = "forest" | "cave" | "volcano";

export interface TowerSlot {
  readonly id: string;
  readonly position: Waypoint;
}

export interface GymArenaTheme {
  readonly id: string;
  readonly specialty: GymSpecialty;
  readonly region: CampaignRegionId;
  readonly badge: string;
  readonly detail: string;
}

export interface MapTheme {
  readonly biome: BiomeId;
  readonly terrain: string;
  readonly trail: string;
  readonly edge: string;
  readonly accent: string;
  readonly atmosphere: string;
  readonly arena?: GymArenaTheme;
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
