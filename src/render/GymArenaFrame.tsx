import { Suspense, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, type Texture } from "three";
import type { GymArenaTheme, MapDefinition, Waypoint } from "@/data/maps/types";
import { RenderBoundary } from "./RenderBoundary";
import { SceneryBatch, type SceneryPiece } from "./SceneryBatch";

function colorBadge(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
}

function BadgeFace({ badge }: { badge: string }) {
  const texture = useTexture(`/images/badges/${badge.toLowerCase()}.png`, colorBadge);
  const { width, height } = texture.image as HTMLImageElement;
  const ratio = width / height;
  return (
    <mesh position-z={0.19}>
      <planeGeometry args={[1.13 * Math.min(1, ratio), 1.13 * Math.min(1, 1 / ratio)]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function GymMarquee({ arena, accent, z }: { arena: GymArenaTheme; accent: string; z: number }) {
  const sides = arena.region === "kanto" ? 8 : arena.region === "johto" ? 6 : 4;
  return (
    <group position={[0, 1.13, z]}>
      <mesh position-y={-0.43} castShadow>
        <boxGeometry args={[2.96, 1.37, 0.44]} />
        <meshStandardMaterial color={arena.detail} roughness={0.72} />
      </mesh>
      <group position={[0, 0.32, 0.21]}>
        <mesh rotation-x={Math.PI / 2} rotation-y={sides === 4 ? Math.PI / 4 : 0}>
          <cylinderGeometry args={[0.92, 0.96, 0.35, sides]} />
          <meshStandardMaterial color="#ffeed7" roughness={0.63} flatShading />
        </mesh>
        <mesh rotation-x={Math.PI / 2} rotation-y={sides === 4 ? Math.PI / 4 : 0} position-z={0.16}>
          <cylinderGeometry args={[0.77, 0.77, 0.039, sides]} />
          <meshStandardMaterial color={arena.detail} roughness={0.68} />
        </mesh>
        <RenderBoundary key={arena.id} fallback={null}>
          <Suspense fallback={null}>
            <BadgeFace badge={arena.badge} />
          </Suspense>
        </RenderBoundary>
      </group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.15, 0.04, 0.24]}>
          <boxGeometry args={[0.46, 0.075, 0.05]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}
    </group>
  );
}

function framePieces(map: MapDefinition, arena: GymArenaTheme) {
  const x = map.size.width / 2;
  const z = map.size.depth / 2;
  const structure: SceneryPiece[] = [];
  const trims: SceneryPiece[] = [];
  const cream = "#eee3ca";
  const { accent, atmosphere } = map.theme;
  const { detail, region } = arena;

  structure.push(
    { position: [0, 0.27, -z - 0.15], scale: [2 * x - 0.65, 0.61, 0.47], color: atmosphere },
    { position: [0, 0.52, -z - 0.1], scale: [2 * x - 0.72, 0.17, 0.51], color: detail },
  );

  for (const side of [-1, 1]) {
    const section = (x - 1.95) / 4;
    for (let bay = 0; bay < 4; bay += 1) {
      const bayX = side * (1.52 + section * (bay + 0.5));
      const back = -z - 0.11;
      const height = region === "johto" ? 0.81 : 0.57;
      structure.push({ position: [bayX, 0.62, back - 0.12], scale: [section - 0.06, height, 0.35], color: detail });
      if (region === "johto") {
        structure.push({ position: [bayX - side * (section - 0.14) / 2, 0.64, back + 0.1], scale: [0.15, 0.89, 0.22], color: cream });
      }
      trims.push(
        { position: [bayX, 0.63 + height / 2, back - 0.09], scale: [section - 0.08, 0.086, 0.46], color: cream },
        { position: [bayX, 0.52, back + 0.19], scale: [section * (region === "hoenn" ? 0.71 : 0.41), 0.075, 0.066], color: accent },
      );
    }
    const corner = side * (x - 0.7);
    structure.push(
      { position: [corner, 0.18, -z + 0.67], scale: [0.73, 0.43, 0.79], color: detail },
      { position: [side * x * 0.55, 0.08, z - 0.05], scale: [x * 0.77, 0.21, 0.24], color: detail },
      { position: [corner, 0.10, z - 0.64], scale: [0.67, 0.28, 0.59], color: atmosphere },
    );
    trims.push(
      { position: [corner, 0.43, -z + 0.67], scale: [0.58, 0.096, 0.62], color: accent },
      { position: [side * x * 0.55, 0.204, z - 0.05], scale: [x * 0.77, 0.04, 0.21], color: cream },
      { position: [corner, 0.257, z - 0.64], scale: [0.53, 0.052, 0.41], color: accent },
    );
  }

  return { structure, trims };
}

export function GymArenaFrame({ map, arena }: { map: MapDefinition; arena: GymArenaTheme }) {
  const { structure, trims } = useMemo(() => framePieces(map, arena), [map, arena]);
  return (
    <group>
      <SceneryBatch pieces={structure}><boxGeometry /></SceneryBatch>
      <SceneryBatch pieces={trims}><boxGeometry /></SceneryBatch>
      <GymMarquee arena={arena} accent={map.theme.accent} z={-map.size.depth / 2 - 0.08} />
    </group>
  );
}

export function GymGate({ waypoint: [x, z], arrival, accent, detail, yaw }: {
  waypoint: Waypoint;
  arrival: boolean;
  accent: string;
  detail: string;
  yaw: number;
}) {
  const light = arrival ? accent : "#9be8d4";
  return (
    <group position={[x, 0, z]} rotation-y={yaw}>
      <mesh position-y={0.07} receiveShadow>
        <cylinderGeometry args={[0.83, 0.94, 0.18, 8]} />
        <meshStandardMaterial color={detail} roughness={0.76} flatShading />
      </mesh>
      <mesh position-y={0.163} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.57, 0.76, 8]} />
        <meshBasicMaterial color={light} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position-x={side * 0.70}>
          <mesh position-y={0.33}>
            <boxGeometry args={[0.26, 0.56, 0.47]} />
            <meshStandardMaterial color="#303646" roughness={0.65} />
          </mesh>
          <mesh position-y={0.63}>
            <boxGeometry args={[0.23, 0.087, 0.42]} />
            <meshBasicMaterial color={light} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
