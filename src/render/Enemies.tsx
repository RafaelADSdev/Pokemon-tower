import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D, Vector3 } from "three";
import type { GameRuntime } from "@/game/runtime";
import { drawCapacity, interpolatePosition, prepareInstances, publishInstances } from "./instances";

interface EnemiesProps {
  runtime: GameRuntime;
  alpha: RefObject<number>;
}

export function Enemies({ runtime, alpha }: EnemiesProps) {
  const body = useRef<InstancedMesh | null>(null);
  const face = useRef<InstancedMesh | null>(null);
  const outlines = useRef<InstancedMesh | null>(null);
  const fills = useRef<InstancedMesh | null>(null);
  const transform = useMemo(() => new Object3D(), []);
  const origin = useMemo(() => new Vector3(), []);
  const offset = useMemo(() => new Vector3(), []);
  const { skin, health } = useMemo(() => ({ skin: new Color(), health: new Color() }), []);

  useFrame(({ camera }) => {
    const bodies = body.current;
    const faces = face.current;
    const borders = outlines.current;
    const bars = fills.current;
    if (!bodies || !faces || !borders || !bars) return;
    const enemies = runtime.queries.enemies.entities;
    const count = Math.min(enemies.length, drawCapacity);

    for (let index = 0; index < count; index += 1) {
      const { id, enemy, position } = enemies[index];
      interpolatePosition(origin, position, alpha.current);
      const bounce = Math.sin(enemy.progress * 250 + id * 2.38);
      const turn = Math.atan2(position.x - position.previousX, position.z - position.previousZ);
      const size = 0.39;

      transform.position.set(origin.x, origin.y + bounce * 0.048, origin.z);
      transform.rotation.set(0, turn, 0);
      transform.scale.set(size * (1 - bounce * 0.09), size * (0.86 + bounce * 0.13), size * 0.92);
      transform.updateMatrix();
      bodies.setMatrixAt(index, transform.matrix);
      bodies.setColorAt(index, skin.set(enemy.definition.color));

      for (let eye = 0; eye < 2; eye += 1) {
        offset.set((eye === 0 ? -1 : 1) * size * 0.36, size * 0.16, size * 0.77);
        offset.applyQuaternion(transform.quaternion);
        transform.position.copy(origin).add(offset);
        transform.position.setY(transform.position.y + bounce * 0.048);
        transform.scale.setScalar(size * 0.12);
        transform.updateMatrix();
        faces.setMatrixAt(index * 2 + eye, transform.matrix);
      }

      const fraction = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));
      transform.position.set(origin.x, origin.y + size + 0.22 + bounce * 0.045, origin.z);
      transform.quaternion.copy(camera.quaternion);
      transform.scale.set(0.76, 0.098, 1);
      transform.updateMatrix();
      borders.setMatrixAt(index, transform.matrix);

      const barLength = 0.69;
      offset.set(barLength * (fraction - 1) / 2, 0, 0.014).applyQuaternion(camera.quaternion);
      transform.position.add(offset);
      transform.scale.set(barLength * fraction, 0.052, 1);
      transform.updateMatrix();
      bars.setMatrixAt(index, transform.matrix);
      bars.setColorAt(index, health.setHex(fraction > 0.52 ? 0xbbe19a : fraction > 0.25 ? 0xffca78 : 0xf58568));
    }

    publishInstances(bodies, count);
    publishInstances(faces, count * 2);
    publishInstances(borders, count);
    publishInstances(bars, count);
    if (count > 0) {
      if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
      if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh args={[undefined, undefined, drawCapacity]} ref={body} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.82} flatShading />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, drawCapacity * 2]} ref={face} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#182a24" />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, drawCapacity]} ref={outlines} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#14201a" />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, drawCapacity]} ref={fills} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
