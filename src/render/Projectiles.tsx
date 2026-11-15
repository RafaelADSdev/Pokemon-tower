import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import type { GameRuntime } from "@/game/runtime";
import { drawCapacity, interpolatePosition, prepareInstances, publishInstances } from "./instances";

export function Projectiles({ runtime, alpha }: { runtime: GameRuntime; alpha: RefObject<number> }) {
  const ref = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);
  const glow = useMemo(() => new Color("#ffe5b2"), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const projectiles = runtime.queries.projectiles.entities;
    const count = Math.min(projectiles.length, drawCapacity);
    for (let index = 0; index < count; index += 1) {
      const { position, projectile } = projectiles[index];
      interpolatePosition(transform.position, position, alpha.current);
      transform.rotation.set(0, Math.atan2(position.x - position.previousX, position.z - position.previousZ), 0);
      transform.scale.set(0.107, 0.115, 0.23);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
      mesh.setColorAt(index, tint.set(projectile.color).lerp(glow, 0.4));
    }
    publishInstances(mesh, count);
    if (mesh.instanceColor && count > 0) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, drawCapacity]} ref={ref} onUpdate={prepareInstances} count={0} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
