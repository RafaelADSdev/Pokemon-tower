import { caveMap } from "./cave";
import { forestMap } from "./forest";
import type { MapDefinition, MapId } from "./types";
import { volcanoMap } from "./volcano";

export type { MapId } from "./types";

export const mapById: Readonly<Record<MapId, MapDefinition>> = {
  forest: forestMap,
  cave: caveMap,
  volcano: volcanoMap,
};

export const maps: readonly MapDefinition[] = [forestMap, caveMap, volcanoMap];

export function isMapId(id: string): id is MapId {
  return Object.hasOwn(mapById, id);
}
