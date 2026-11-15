import { memo, useState } from "react";
import { useCursor } from "@react-three/drei";
import type { MapDefinition, MapTheme, TowerSlot, Waypoint } from "@/data/maps/types";
import { CavernScenery } from "./CavernScenery";
import { ForestScenery } from "./Scenery";
import { Terrain } from "./Terrain";
import { VolcanoScenery } from "./VolcanoScenery";

interface MapProps {
  map: MapDefinition;
  selectedSlot?: string | null;
  onSelectSlot?: (id: string) => void;
}

const scenery = { forest: ForestScenery, cave: CavernScenery, volcano: VolcanoScenery };

const padColors = {
  forest: { stone: "#303c35", brass: "#849481", active: "#67563c" },
  cave: { stone: "#2c3541", brass: "#8eafbf", active: "#42606a" },
  volcano: { stone: "#352b2c", brass: "#b39487", active: "#6d4133" },
};

function BuildPad({ slot, theme, selected, onSelect }: {
  slot: TowerSlot;
  theme: MapTheme;
  selected: boolean;
  onSelect?: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const active = selected || hovered;
  const palette = padColors[theme.biome];
  const brass = active ? theme.accent : palette.brass;

  return (
    <group
      position={[slot.position[0], 0, slot.position[1]]}
      onPointerOver={onSelect && ((event) => {
        event.stopPropagation();
        setHovered(true);
      })}
      onPointerOut={onSelect && (() => {
        setHovered(false);
      })}
      onClick={onSelect && ((event) => {
        if (event.delta > 5) return;
        event.stopPropagation();
        onSelect(slot.id);
      })}
    >
      <mesh position-y={0.06} receiveShadow>
        <cylinderGeometry args={[0.59, 0.63, 0.13, 8]} />
        <meshStandardMaterial color={active ? palette.active : palette.stone} roughness={0.92} flatShading />
      </mesh>
      <mesh position-y={0.129} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.43, 0.49, 8]} />
        <meshStandardMaterial color={brass} emissive={brass} emissiveIntensity={active ? 0.65 : 0.1} metalness={0.25} roughness={0.6} />
      </mesh>
      <group position-y={0.132}>
        <mesh>
          <boxGeometry args={[0.29, 0.024, 0.052]} />
          <meshStandardMaterial color={brass} emissive={brass} emissiveIntensity={active ? 0.39 : 0.06} />
        </mesh>
        <mesh rotation-y={Math.PI / 2}>
          <boxGeometry args={[0.29, 0.024, 0.052]} />
          <meshStandardMaterial color={brass} emissive={brass} emissiveIntensity={active ? 0.39 : 0.06} />
        </mesh>
      </group>
    </group>
  );
}

function TrailGate({ waypoint: [x, z], arrival, accent, yaw }: {
  waypoint: Waypoint;
  arrival: boolean;
  accent: string;
  yaw: number;
}) {
  const light = arrival ? accent : "#83cfb2";
  const stone = arrival ? "#6f6752" : "#576b65";

  return (
    <group position={[x, 0, z]} rotation-y={yaw}>
      <mesh position-y={0.035}>
        <cylinderGeometry args={[0.78, 0.82, 0.08, 8]} />
        <meshStandardMaterial color="#384644" metalness={0.12} roughness={0.83} />
      </mesh>
      <mesh position-y={0.081} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.51, 0.61, 8]} />
        <meshStandardMaterial color={light} emissive={light} emissiveIntensity={0.52} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position-x={side * 0.44}>
          <mesh position-y={0.26} castShadow>
            <cylinderGeometry args={[0.14, 0.22, 0.49, 5]} />
            <meshStandardMaterial color={stone} roughness={0.92} flatShading />
          </mesh>
          <mesh position-y={0.57} rotation-z={side * 0.24} castShadow>
            <cylinderGeometry args={[0.12, 0.17, 0.27, 5]} />
            <meshStandardMaterial color={stone} roughness={0.92} flatShading />
          </mesh>
          <mesh position-y={0.729} rotation-z={side * 0.58}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color={light} emissive={light} emissiveIntensity={0.9} roughness={0.42} />
          </mesh>
        </group>
      ))}
      <mesh rotation-y={Math.PI / 4} position-y={0.45} scale={[0.83, 1.37, 0.83]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color={light} emissive={light} emissiveIntensity={arrival ? 0.76 : 0.36} flatShading roughness={0.43} />
      </mesh>
    </group>
  );
}

const Landscape = memo(function Landscape({ map }: { map: MapDefinition }) {
  const Biome = scenery[map.theme.biome];
  const unique = new Set<string>();
  const gates: { point: Waypoint; arrival: boolean; key: string }[] = [];
  for (const path of map.paths) {
    path.forEach((point, index) => {
      const arrival = index === path.length - 1;
      if (index !== 0 && !arrival) return;
      const key = point.join(",");
      if (unique.has(key)) return;
      unique.add(key);
      gates.push({ point, arrival, key });
    });
  }

  return (
    <group>
      <Terrain map={map} />
      <Biome map={map} />
      {gates.map(({ point, arrival, key }) => (
        <TrailGate key={key} waypoint={point} arrival={arrival} accent={map.theme.accent} yaw={arrival ? 0.48 : -0.36} />
      ))}
    </group>
  );
});

export function Map({ map, selectedSlot, onSelectSlot }: MapProps) {
  return (
    <group>
      <Landscape map={map} />
      {map.slots.map((slot) => (
        <BuildPad key={slot.id} slot={slot} theme={map.theme} selected={slot.id === selectedSlot} onSelect={onSelectSlot} />
      ))}
    </group>
  );
}
