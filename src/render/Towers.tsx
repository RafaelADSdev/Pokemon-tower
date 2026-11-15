import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex-react";
import { useStore } from "zustand";
import { MathUtils, type Group } from "three";
import type { TowerEntity } from "@/game/ecs/world";
import type { GameRuntime } from "@/game/runtime";
import { LoadingModel, TowerAsset } from "./models/ModelAssets";
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

function Tower({ entity, selected, paused, reducedMotion }: { entity: TowerEntity; selected: boolean; paused: boolean; reducedMotion: boolean }) {
  const body = useRef<Group>(null);
  const range = useRef<Group>(null);
  const { tower, position } = entity;
  const { definition, evolved, level } = tower;
  const appearance = evolved ? definition.evolution : definition;

  useFrame((_, delta) => {
    const group = body.current;
    if (group) {
      const angle = tower.heading - group.rotation.y;
      const target = group.rotation.y + Math.atan2(Math.sin(angle), Math.cos(angle));
      group.rotation.y = MathUtils.damp(group.rotation.y, target, 18, delta);
    }
    const radius = tower.stats.support?.radius ?? tower.effectiveRange;
    range.current?.scale.set(radius, 1, radius);
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position-y={0.155} receiveShadow>
        <cylinderGeometry args={[0.51, 0.57, 0.1, 8]} />
        <meshStandardMaterial color={evolved ? "#73654d" : "#53574d"} flatShading roughness={0.77} />
      </mesh>
      <mesh position-y={0.208} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.437, 0.49, 8]} />
        <meshStandardMaterial color={definition.color} emissive={definition.color} emissiveIntensity={evolved ? 0.72 : 0.41} />
      </mesh>
      {level > 1 && (
        <mesh position-y={0.209} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.359, 0.383, 8]} />
          <meshBasicMaterial color={evolved ? "#f4d494" : definition.color} />
        </mesh>
      )}
      {selected && (tower.stats.range > 0 || tower.stats.support) && <RangeOverlay reference={range} color={definition.color} />}
      <group ref={body} scale={evolved ? 1.18 : level === 2 ? 1.075 : 1}>
        {appearance.model ? (
          <LoadingModel key={appearance.model} fallback={<TowerModel visual={appearance.visual} color={definition.color} />}>
            <TowerAsset path={appearance.model} idlePose={appearance.idlePose} paused={paused} reducedMotion={reducedMotion} />
          </LoadingModel>
        ) : <TowerModel visual={appearance.visual} color={definition.color} />}
      </group>
    </group>
  );
}

export function Towers({ runtime, selectedSlot, reducedMotion }: { runtime: GameRuntime; selectedSlot?: string | null; reducedMotion: boolean }) {
  const { entities } = useEntities(runtime.queries.towers);
  useStore(runtime.store, (state) => state.towerRevision);
  const paused = useStore(runtime.store, (state) => state.paused);
  return entities.map((entity) => (
    <Tower key={entity.id} entity={entity} selected={entity.tower.slotId === selectedSlot} paused={paused} reducedMotion={reducedMotion} />
  ));
}
