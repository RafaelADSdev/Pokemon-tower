import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D, Vector3 } from "three";
import type { EnemyEntity } from "@/game/ecs/world";
import type { GameRuntime } from "@/game/runtime";
import { drawCapacity, interpolatePosition, prepareInstances, publishInstances } from "./instances";

const green = new Color(0xc4e8a7);
const amber = new Color(0xffc483);
const danger = new Color(0xf38367);
const gold = new Color(0xffe3a9);
const silver = new Color(0xa6bbd3);
const shieldBlue = new Color(0xa5e1ef);

function statusTint(enemy: EnemyEntity["enemy"], color: Color) {
  const { burn, poison, slow, mark, stun } = enemy.statuses;
  if (stun.remaining > 0) return color.setHex(0xffe498);
  if (burn.remaining > 0) return color.setHex(0xff9b6e);
  for (let index = 0; index < poison.length; index += 1) {
    if (poison[index].remaining > 0) return color.setHex(0xbac985);
  }
  if (mark.remaining > 0) return color.setHex(0xead096);
  if (slow.remaining > 0) return color.setHex(0xa5dfe8);
  if (enemy.hasteRemaining > 0) return color.setHex(0xe5a08a);
}

export function EnemyIndicators({ runtime, alpha }: { runtime: GameRuntime; alpha: RefObject<number> }) {
  const outlines = useRef<InstancedMesh>(null);
  const fills = useRef<InstancedMesh>(null);
  const shields = useRef<InstancedMesh>(null);
  const halos = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const origin = useMemo(() => new Vector3(), []);
  const offset = useMemo(() => new Vector3(), []);
  const tint = useMemo(() => new Color(), []);

  useFrame(({ camera }) => {
    const borders = outlines.current;
    const bars = fills.current;
    const barriers = shields.current;
    const circles = halos.current;
    if (!borders || !bars || !barriers || !circles) return;
    const { selectedEnemyId, selectedSlot } = runtime.store.getState();
    let targetId: number | undefined;
    if (selectedSlot) {
      for (const { tower } of runtime.queries.towers.entities) {
        if (tower.slotId === selectedSlot) {
          targetId = tower.target?.id;
          break;
        }
      }
    }
    const entities = runtime.queries.enemies.entities;
    const count = Math.min(entities.length, drawCapacity);
    let barrierIndex = 0;
    let circleIndex = 0;

    for (let index = 0; index < count; index += 1) {
      const { id, enemy, position } = entities[index];
      const { boss, flying } = enemy.definition.traits;
      const selected = selectedEnemyId === id;
      const width = boss ? 1.12 : 0.69;
      const barHeight = boss ? 0.076 : 0.051;
      const health = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));
      interpolatePosition(origin, position, alpha.current);
      transform.position.set(origin.x, origin.y + (boss ? 1.08 : 0.59), origin.z);
      transform.quaternion.copy(camera.quaternion);
      transform.scale.set(width + 0.074, barHeight + 0.047, 1);
      transform.updateMatrix();
      borders.setMatrixAt(index, transform.matrix);
      borders.setColorAt(index, selected ? gold : boss ? amber : tint.setHex(0x162018));

      offset.set(width * (health - 1) / 2, 0, 0.014).applyQuaternion(camera.quaternion);
      transform.position.add(offset);
      transform.scale.set(width * health, barHeight, 1);
      transform.updateMatrix();
      bars.setMatrixAt(index, transform.matrix);
      bars.setColorAt(index, !enemy.visible ? silver : health > 0.52 ? green : health > 0.25 ? amber : danger);

      if (enemy.shield > 0 && enemy.maxShield > 0) {
        const fraction = Math.min(1, enemy.shield / enemy.maxShield);
        offset.set(width * (fraction - health) / 2, 0.078, 0).applyQuaternion(camera.quaternion);
        transform.position.add(offset);
        transform.scale.set(width * fraction, barHeight * 0.63, 1);
        transform.updateMatrix();
        barriers.setMatrixAt(barrierIndex, transform.matrix);
        barrierIndex += 1;
      }

      const status = statusTint(enemy, tint);
      const effectColor = selected || targetId === id ? gold : status ?? (enemy.shield > 0 ? shieldBlue : undefined);
      if (effectColor || flying) {
        const radius = boss ? 0.77 : 0.51;
        transform.position.set(origin.x, 0.068, origin.z);
        transform.rotation.set(-Math.PI / 2, 0, 0);
        transform.scale.set(radius, radius, 1);
        transform.updateMatrix();
        circles.setMatrixAt(circleIndex, transform.matrix);
        circles.setColorAt(circleIndex, effectColor ?? silver);
        circleIndex += 1;
      }
    }

    publishInstances(borders, count);
    publishInstances(bars, count);
    publishInstances(barriers, barrierIndex);
    publishInstances(circles, circleIndex);
    if (borders.instanceColor && count > 0) borders.instanceColor.needsUpdate = true;
    if (bars.instanceColor && count > 0) bars.instanceColor.needsUpdate = true;
    if (circles.instanceColor && circleIndex > 0) circles.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh args={[undefined, undefined, drawCapacity]} ref={outlines} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, drawCapacity]} ref={fills} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, drawCapacity]} ref={shields} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={shieldBlue} toneMapped={false} />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, drawCapacity]} ref={halos} onUpdate={prepareInstances} count={0} frustumCulled={false}>
        <ringGeometry args={[0.87, 1, 12]} />
        <meshBasicMaterial transparent opacity={0.71} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
