import type { MapId } from "../maps/types";
import { caveWaves } from "./cave";
import { forestWaves } from "./forest";
import type { WaveDefinition } from "./types";
import { volcanoWaves } from "./volcano";

export const wavesByMap: Readonly<Record<MapId, readonly WaveDefinition[]>> = {
  forest: forestWaves,
  cave: caveWaves,
  volcano: volcanoWaves,
};

export function getMapWaves(mapId: MapId): readonly WaveDefinition[] {
  return wavesByMap[mapId];
}
