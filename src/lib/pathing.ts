import type { Waypoint } from "../data/maps/types";

export interface CompiledPath {
  readonly waypoints: readonly Waypoint[];
  readonly distances: Float64Array;
  readonly length: number;
}

export interface PathPosition {
  x: number;
  z: number;
}

export function compilePath(waypoints: readonly Waypoint[]): CompiledPath {
  if (waypoints.length === 0) throw new Error("A path needs at least one waypoint");

  const distances = new Float64Array(waypoints.length);
  let length = 0;
  for (let index = 1; index < waypoints.length; index++) {
    const [startX, startZ] = waypoints[index - 1];
    const [endX, endZ] = waypoints[index];
    length += Math.hypot(endX - startX, endZ - startZ);
    distances[index] = length;
  }

  return { waypoints, distances, length };
}

export function samplePath(path: CompiledPath, progress: number, output: PathPosition): void {
  const { waypoints, distances, length } = path;
  const last = waypoints.length - 1;

  if (progress <= 0 || length === 0) {
    output.x = waypoints[0][0];
    output.z = waypoints[0][1];
    return;
  }

  if (progress >= 1) {
    output.x = waypoints[last][0];
    output.z = waypoints[last][1];
    return;
  }

  const target = progress * length;
  let high = last;
  let low = 1;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (distances[middle] < target) low = middle + 1;
    else high = middle;
  }

  const start = waypoints[low - 1];
  const end = waypoints[low];
  const fraction = (target - distances[low - 1]) / (distances[low] - distances[low - 1]);
  output.x = start[0] + (end[0] - start[0]) * fraction;
  output.z = start[1] + (end[1] - start[1]) * fraction;
}
