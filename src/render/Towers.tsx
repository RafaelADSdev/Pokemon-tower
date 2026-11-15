import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex-react";
import type { Group } from "three";
import type { GameRuntime } from "@/game/runtime";

type TowerEntity = GameRuntime["queries"]["towers"]["entities"][number];

function Emberling({ color }: { color: string }) {
  return (
    <>
      <mesh position-y={0.64} scale={[0.42, 0.44, 0.37]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} roughness={0.68} flatShading />
      </mesh>
      <mesh position={[0, 0.54, 0.215]} scale={[0.29, 0.26, 0.19]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#eac599" emissive="#df822f" emissiveIntensity={0.18} roughness={0.73} flatShading />
      </mesh>
      <mesh position={[0, 0.76, 0.277]} scale={[0.305, 0.17, 0.145]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#392820" roughness={0.8} flatShading />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.119, 0.782, 0.397]} scale={[0.044, 0.057, 0.023]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#fff5c2" toneMapped={false} />
          </mesh>
          <mesh position={[side * 0.39, 0.59, 0.004]} rotation-z={side * 0.45} scale={[0.125, 0.235, 0.155]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={color} roughness={0.71} flatShading />
          </mesh>
          <mesh position={[side * 0.22, 0.24, 0.12]} scale={[0.155, 0.12, 0.21]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#68513b" roughness={0.85} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0.02, 1.13, -0.03]} rotation-z={-0.24} scale={[0.215, 0.37, 0.19]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#fbad4d" emissive="#ff711f" emissiveIntensity={0.51} roughness={0.5} flatShading />
      </mesh>
      <mesh position={[-0.054, 1.02, 0.118]} rotation-z={0.32} scale={[0.114, 0.22, 0.126]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffe5a5" emissive="#e99a38" emissiveIntensity={0.55} roughness={0.5} flatShading />
      </mesh>
    </>
  );
}

function Tower({ entity, selected }: { entity: TowerEntity; selected: boolean }) {
  const body = useRef<Group>(null);
  const { tower, position } = entity;
  const { definition } = tower;

  useFrame(() => {
    const group = body.current;
    if (group) group.rotation.y = tower.heading;
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position-y={0.155} receiveShadow>
        <cylinderGeometry args={[0.51, 0.57, 0.1, 8]} />
        <meshStandardMaterial color="#53574d" flatShading roughness={0.77} />
      </mesh>
      <mesh position-y={0.208} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.442, 0.489, 8]} />
        <meshStandardMaterial color={definition.color} emissive={definition.color} emissiveIntensity={0.41} />
      </mesh>
      {selected && (
        <>
          <mesh position-y={0.049} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[definition.range, 64]} />
            <meshBasicMaterial color={definition.color} transparent opacity={0.08} depthWrite={false} />
          </mesh>
          <mesh position-y={0.051} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[definition.range - 0.035, definition.range, 64]} />
            <meshBasicMaterial color={definition.color} transparent opacity={0.62} depthWrite={false} />
          </mesh>
        </>
      )}
      <group ref={body}>
        <Emberling color={definition.color} />
      </group>
    </group>
  );
}

export function Towers({ runtime, selectedSlot }: { runtime: GameRuntime; selectedSlot?: string | null }) {
  const { entities } = useEntities(runtime.queries.towers);
  return entities.map((entity) => (
    <Tower key={entity.id} entity={entity} selected={entity.tower.slotId === selectedSlot} />
  ));
}
