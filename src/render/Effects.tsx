import { CameraShake } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ComponentRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import type { GameRuntime } from "@/game/runtime";
import { DamageNumbers } from "./DamageNumbers";
import { drawCapacity, prepareInstances, publishInstances } from "./instances";

function CameraPulse({ runtime }: { runtime: GameRuntime }) {
  const shake = useRef<ComponentRef<typeof CameraShake>>(null);
  const lastSerial = useRef(0);
  useFrame(() => {
    let latest = lastSerial.current;
    let strength = 0;
    for (const { effect } of runtime.queries.effects.entities) {
      if (effect.serial <= lastSerial.current) continue;
      latest = Math.max(latest, effect.serial);
      if (effect.kind === "leak") strength = Math.max(strength, 0.31 + effect.value * 0.06);
      if (effect.kind === "death" && effect.value >= 4) strength = Math.max(strength, 0.33);
    }
    lastSerial.current = latest;
    if (strength > 0) shake.current?.setIntensity(Math.min(0.68, strength));
  });

  return <CameraShake ref={shake} intensity={0} decay decayRate={2.4} maxYaw={0.009} maxPitch={0.012} maxRoll={0.006} />;
}

function Sparks({ runtime, compact }: { runtime: GameRuntime; compact: boolean }) {
  const meshRef = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);
  const shimmer = useMemo(() => new Color("#ffe0ab"), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    let count = 0;
    for (const { position, effect } of runtime.queries.effects.entities) {
      if (effect.kind === "damage") continue;
      if (count >= drawCapacity) break;
      const particles = effect.kind === "death" || effect.kind === "leak" ? (compact ? 5 : 9) : (compact ? 2 : 4);
      const progress = Math.min(1, effect.age / effect.duration);
      const spread = effect.kind === "death" ? 1.12 : effect.kind === "shot" ? 0.32 : 0.6;
      const scale = (1 - progress) * (effect.kind === "death" ? 0.15 : 0.097);
      tint.set(effect.color).lerp(shimmer, effect.kind === "leak" ? 0.41 : 0.35);

      for (let index = 0; index < particles && count < drawCapacity; index += 1) {
        const angle = index * 2.399 + effect.serial * 0.47;
        const radius = (0.1 + progress * spread) * (index % 2 === 0 ? 1 : 0.74);
        const arc = Math.sin(progress * Math.PI) * (0.12 + index * 0.09);
        transform.position.set(
          position.x + Math.cos(angle) * radius,
          position.y + arc + progress * 0.2,
          position.z + Math.sin(angle) * radius,
        );
        transform.rotation.set(progress * 3.4, angle, radius);
        transform.scale.set(scale * (index % 3 === 0 ? 1.4 : 1), scale * 0.67, scale);
        transform.updateMatrix();
        mesh.setMatrixAt(count, transform.matrix);
        mesh.setColorAt(count, tint);
        count += 1;
      }
    }
    publishInstances(mesh, count);
    if (mesh.instanceColor && count > 0) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, drawCapacity]} ref={meshRef} onUpdate={prepareInstances} count={0} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

export function Effects({ runtime, compact, reducedMotion }: { runtime: GameRuntime; compact: boolean; reducedMotion: boolean }) {
  return (
    <>
      {!reducedMotion && <Sparks runtime={runtime} compact={compact} />}
      {!reducedMotion && <CameraPulse runtime={runtime} />}
      <DamageNumbers runtime={runtime} reducedMotion={reducedMotion} />
    </>
  );
}
