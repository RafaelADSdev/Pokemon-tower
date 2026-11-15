import { DynamicDrawUsage, type InstancedMesh, type Vector3 } from "three";
import type { Position } from "@/game/ecs/world";

export const drawCapacity = 768;

export function prepareInstances(mesh: InstancedMesh) {
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
}

export function interpolatePosition(out: Vector3, position: Position, alpha: number) {
  return out.set(
    position.previousX + (position.x - position.previousX) * alpha,
    position.previousY + (position.y - position.previousY) * alpha,
    position.previousZ + (position.z - position.previousZ) * alpha,
  );
}

export function publishInstances(mesh: InstancedMesh, count: number) {
  mesh.count = count;
  if (count > 0) mesh.instanceMatrix.needsUpdate = true;
}
