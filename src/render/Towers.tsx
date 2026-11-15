import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex-react";
import { useStore } from "zustand";
import { MathUtils, type Group, type MeshStandardMaterial } from "three";
import { getCreatureAppearance } from "@/data/creatures";
import type { ElementId } from "@/data/elements";
import type { TowerEntity } from "@/game/ecs/world";
import type { GameRuntime } from "@/game/runtime";
import { ATTACK_WINDUP_SECONDS } from "@/game/systems/targeting";
import type { GameSpeed } from "@/game/time";
import { LoadingModel, TowerAsset, type AttackPose } from "./models/ModelAssets";
import { sculpture } from "./models/sculpture";
import { towerPieces } from "./models/towerSculptures";

function TowerModel({ visual, color }: { visual: string; color: string }) {
  const geometry = useMemo(() => sculpture(towerPieces(visual), color), [color, visual]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial roughness={0.75} vertexColors flatShading />
    </mesh>
  );
}

function RangeOverlay({ reference, color }: { reference: React.RefObject<Group | null>; color: string }) {
  return (
    <group ref={reference}>
      <mesh position-y={0.049} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.075} depthWrite={false} />
      </mesh>
      <mesh position-y={0.051} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.99, 1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.58} depthWrite={false} />
      </mesh>
    </group>
  );
}

const padTop = 0.21;

interface AttackMotion {
  duration: number;
  lean: number;
  stride: number;
  jump: number;
  squat: number;
  roll: number;
}

const motionByElement = {
  brasa: { duration: 0.27, lean: 0.25, stride: 0.16, jump: 0.06, squat: 0.10, roll: 0.025 },
  mare: { duration: 0.33, lean: -0.19, stride: -0.12, jump: 0.06, squat: 0.11, roll: 0.025 },
  folha: { duration: 0.31, lean: 0.12, stride: 0.09, jump: 0.12, squat: 0.08, roll: 0.09 },
  faisca: { duration: 0.24, lean: 0.17, stride: 0.13, jump: 0.18, squat: 0.14, roll: 0.04 },
  pedra: { duration: 0.36, lean: 0.21, stride: 0.13, jump: 0.02, squat: 0.15, roll: 0.035 },
  sombra: { duration: 0.32, lean: 0.10, stride: 0.06, jump: 0.09, squat: 0.07, roll: 0.13 },
} satisfies Record<ElementId, AttackMotion>;

function Tower({ entity, selected, paused, running, speed, reducedMotion }: {
  entity: TowerEntity;
  selected: boolean;
  paused: boolean;
  running: boolean;
  speed: GameSpeed;
  reducedMotion: boolean;
}) {
  const facing = useRef<Group>(null);
  const body = useRef<Group>(null);
  const ring = useRef<MeshStandardMaterial>(null);
  const range = useRef<Group>(null);
  const attack = useRef({ serial: 0, elapsed: Infinity });
  const pose = useRef<AttackPose>({ charge: 0, release: 0 });
  const { tower, position } = entity;
  const { definition, evolved, level } = tower;
  const appearance = getCreatureAppearance(definition, level);
  const modelScale = evolved ? 1.18 : level === 2 ? 1.075 : 1;
  const baseGlow = evolved ? 0.72 : 0.41;
  const motion = motionByElement[definition.element];

  useFrame((_, delta) => {
    const radius = tower.stats.support?.radius ?? tower.effectiveRange;
    range.current?.scale.set(radius, 1, radius);

    const pivot = facing.current;
    const group = body.current;
    if (!pivot || !group || paused) return;

    const dt = Math.min(delta, 0.06);
    const state = attack.current;
    const fired = state.serial !== tower.attackSerial;
    state.elapsed = fired ? dt * 0.55 : state.elapsed + dt;
    state.serial = tower.attackSerial;

    // Keep a readable release at 3× while leaving room for the next wind-up.
    const duration = MathUtils.clamp(tower.stats.cooldown * 0.84 / speed, 0.135, motion.duration);
    const phase = Math.min(1, state.elapsed / duration);
    const release = MathUtils.smoothstep(phase, 0, 0.17) * (1 - MathUtils.smoothstep(phase, 0.22, 0.67));
    const settle = MathUtils.smoothstep(phase, 0.42, 0.66) * (1 - MathUtils.smoothstep(phase, 0.69, 1));
    const aim = running ? tower.aimHeading : undefined;
    const charge = aim === undefined ? 0 : 1 - MathUtils.smoothstep(tower.cooldown, 0, ATTACK_WINDUP_SECONDS);
    const nextPose = pose.current;

    const heading = aim ?? tower.heading;
    const angle = heading - pivot.rotation.y;
    const target = pivot.rotation.y + Math.atan2(Math.sin(angle), Math.cos(angle));
    pivot.rotation.y = MathUtils.damp(pivot.rotation.y, target, fired ? 50 : 21, dt);

    const charging = MathUtils.damp(nextPose.charge, charge, fired ? 45 : 25, dt);
    nextPose.charge = reducedMotion || (charge === 0 && charging < 0.001) ? 0 : charging;
    nextPose.release = reducedMotion ? 0 : release;
    const crouch = nextPose.charge;
    const momentum = nextPose.release - (reducedMotion ? 0 : 0.19 * settle);
    const side = tower.attackSerial % 2 === 0 ? -1 : 1;
    group.position.set(0, motion.jump * nextPose.release, motion.stride * momentum - 0.09 * crouch);
    group.rotation.set(motion.lean * momentum - 0.095 * crouch, 0, side * motion.roll * momentum);
    group.scale.set(1 + 0.055 * crouch, 1 - motion.squat * crouch + 0.045 * momentum, 1 + 0.075 * momentum);
    if (ring.current) {
      ring.current.emissiveIntensity = baseGlow + (reducedMotion ? 0.18 : 0.55) * release + 0.17 * charge;
    }
  }, -1);

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position-y={0.155} receiveShadow>
        <cylinderGeometry args={[0.51, 0.57, 0.1, 8]} />
        <meshStandardMaterial color={evolved ? "#73654d" : "#53574d"} flatShading roughness={0.77} />
      </mesh>
      <mesh position-y={0.208} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.437, 0.49, 8]} />
        <meshStandardMaterial ref={ring} color={definition.color} emissive={definition.color} emissiveIntensity={baseGlow} />
      </mesh>
      {level > 1 && (
        <mesh position-y={0.209} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.359, 0.383, 8]} />
          <meshBasicMaterial color={evolved ? "#f4d494" : definition.color} />
        </mesh>
      )}
      {selected && (tower.stats.range > 0 || tower.stats.support) && <RangeOverlay reference={range} color={definition.color} />}
      <group ref={facing} position-y={padTop}>
        <group ref={body}>
          <group position-y={-padTop * modelScale} scale={modelScale}>
            {appearance.model ? (
              <LoadingModel key={appearance.model} fallback={<TowerModel visual={appearance.visual} color={definition.color} />}>
                <TowerAsset path={appearance.model} idlePose={appearance.idlePose} attackPose={pose} element={definition.element} paused={paused} reducedMotion={reducedMotion} />
              </LoadingModel>
            ) : <TowerModel visual={appearance.visual} color={definition.color} />}
          </group>
        </group>
      </group>
    </group>
  );
}

export function Towers({ runtime, selectedSlot, reducedMotion }: { runtime: GameRuntime; selectedSlot?: string | null; reducedMotion: boolean }) {
  const { entities } = useEntities(runtime.queries.towers);
  useStore(runtime.store, (state) => state.towerRevision);
  const paused = useStore(runtime.store, (state) => state.paused);
  const running = useStore(runtime.store, (state) => state.status === "running");
  const speed = useStore(runtime.store, (state) => state.speed);
  return entities.map((entity) => (
    <Tower key={entity.id} entity={entity} selected={entity.tower.slotId === selectedSlot} paused={paused} running={running} speed={speed} reducedMotion={reducedMotion} />
  ));
}
