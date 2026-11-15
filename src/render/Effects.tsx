import { CameraShake } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ComponentRef } from "react";
import { Color, DoubleSide, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Object3D, type MeshBasicMaterial } from "three";
import type { GameRuntime } from "@/game/runtime";
import { attackStyles } from "./attackVfx";
import { DamageNumbers } from "./DamageNumbers";
import { drawCapacity, prepareInstances, publishInstances } from "./instances";

const compileRingMaterial: MeshBasicMaterial["onBeforeCompile"] = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nattribute float ringStrength; varying float ringOpacity;")
    .replace("#include <begin_vertex>", "#include <begin_vertex>\nringOpacity = ringStrength;");
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", "#include <common>\nvarying float ringOpacity;")
    .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= ringOpacity;");
};

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

function AttackRings({ runtime, compact, reducedMotion }: { runtime: GameRuntime; compact: boolean; reducedMotion: boolean }) {
  const meshRef = useRef<InstancedMesh>(null);
  const strengths = useMemo(() => new InstancedBufferAttribute(new Float32Array(drawCapacity), 1).setUsage(DynamicDrawUsage), []);
  const transform = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    let count = 0;
    for (const { position, effect } of runtime.queries.effects.entities) {
      const { kind, element, age, duration, radius } = effect;
      if (!element || (kind !== "impact" && (kind !== "shot" || reducedMotion))) continue;
      if (count >= drawCapacity) break;
      const style = attackStyles[element];
      const shot = kind === "shot";
      const splash = radius && radius > 0 ? radius : 0;
      const rings = !shot && style.echo && !compact && !reducedMotion ? 2 : 1;
      const maximum = shot ? 0.48 : splash || 0.91 + (style.scatter - 0.85) * 0.57;
      for (let index = 0; index < rings && count < drawCapacity; index++) {
        const progress = Math.max(0, Math.min(1, (age / duration - index * 0.19) / (0.9 - index * 0.19)));
        if ((index && progress === 0) || progress === 1) continue;
        const advance = 1 - (1 - progress) ** 3;
        const size = maximum * (reducedMotion ? 0.87 : 0.23 + advance * 0.77);
        if (shot) {
          transform.position.set(position.x, position.y + 0.12, position.z);
          transform.rotation.set(0, effect.heading ?? 0, 0);
        } else {
          transform.position.set(position.x, splash ? 0.045 + index * 0.01 : Math.max(0.1, position.y - 0.19), position.z);
          transform.rotation.set(-Math.PI / 2, 0, 0);
        }
        transform.scale.set(size, size * (shot ? 0.77 : 1), 1);
        transform.updateMatrix();
        mesh.setMatrixAt(count, transform.matrix);
        mesh.setColorAt(count, tint.set(index || shot ? style.accent : style.core));
        strengths.setX(count, (1 - progress) ** 1.38 * (index ? 0.46 : shot ? 0.66 : 0.87));
        count += 1;
      }
    }
    publishInstances(mesh, count);
    if (count > 0) {
      mesh.geometry.getAttribute("ringStrength").needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh args={[undefined, undefined, drawCapacity]} ref={meshRef} onUpdate={prepareInstances} count={0} frustumCulled={false}>
      <ringGeometry args={[0.83, 1, 28]}>
        <primitive attach="attributes-ringStrength" object={strengths} />
      </ringGeometry>
      <meshBasicMaterial onBeforeCompile={compileRingMaterial} transparent depthWrite={false} side={DoubleSide} toneMapped={false} />
    </instancedMesh>
  );
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
      const shot = effect.kind === "shot";
      const impact = effect.kind === "impact";
      const element = effect.element;
      const style = (shot || impact) && element ? attackStyles[element] : undefined;
      const particles = impact ? (compact ? 4 : 9) : shot ? (compact ? 2 : 5) : (compact ? 5 : 9);
      const progress = Math.min(1, effect.age / effect.duration);
      const easeOut = 1 - (1 - progress) ** 2.5;
      const spread = shot ? 0.45 : style?.scatter ?? (effect.kind === "death" ? 1.12 : 0.6);
      const scale = (1 - progress) ** 1.3 * (shot ? 0.112 : impact ? 0.15 : 0.12);

      for (let index = 0; index < particles && count < drawCapacity; index += 1) {
        let angle = effect.serial * 0.47 + index * 2.399;
        if (shot && effect.heading !== undefined) {
          angle = effect.heading + (index - (particles - 1) * 0.5) * 0.34;
        } else if (element === "sombra" && impact) {
          angle += progress * 2.6;
        }
        const radius = (0.08 + easeOut * spread) * (index % 2 === 0 ? 1 : 0.65);
        const lift = style?.lift ?? 0.34;
        const arc = Math.sin(progress * Math.PI) * lift * (0.6 + index % 4 * 0.26);
        const rise = element === "brasa" ? progress * 0.43 : arc;
        transform.position.set(
          position.x + Math.sin(angle) * radius,
          Math.max(0.07, position.y + 0.1 + rise + arc * (element === "brasa" ? 0.4 : 0.1)),
          position.z + Math.cos(angle) * radius,
        );
        transform.rotation.set(progress * 3.4, angle, (index % 3 - 1) * progress);
        const sharpness = style?.sharpness ?? 1;
        transform.scale.set(scale * (index % 3 === 0 ? 1.3 : 0.82), scale * 0.62, scale * sharpness);
        transform.updateMatrix();
        mesh.setMatrixAt(count, transform.matrix);
        if (style) tint.set(index % 3 === 0 ? style.accent : style.core);
        else tint.set(effect.color).lerp(shimmer, effect.kind === "leak" ? 0.41 : 0.35);
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
      <AttackRings runtime={runtime} compact={compact} reducedMotion={reducedMotion} />
      {!reducedMotion && <Sparks runtime={runtime} compact={compact} />}
      {!reducedMotion && <CameraPulse runtime={runtime} />}
      <DamageNumbers runtime={runtime} reducedMotion={reducedMotion} />
    </>
  );
}
