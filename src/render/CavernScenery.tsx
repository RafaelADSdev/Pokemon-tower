import { memo, useMemo } from "react";
import type { MapDefinition } from "@/data/maps/types";
import { SceneryBatch, type SceneryPiece } from "./SceneryBatch";
import { randomFor, sceneryPlacement } from "./sceneryPlacement";

function carveCavern(map: MapDefinition) {
  const random = randomFor(2_407);
  const { open, clearSightline } = sceneryPlacement(map);
  const slate = ["#354152", "#536276", "#40495d", "#637482"];
  const crystals = ["#71cfd4", "#64a7cd", "#b0e9de", "#827db6"];
  const gravel: SceneryPiece[] = [];
  const columns: SceneryPiece[] = [];
  const shards: SceneryPiece[] = [];

  for (let index = 0; index < 120; index += 1) {
    const x = (random() - 0.5) * (map.size.width - 0.72);
    const z = (random() - 0.5) * (map.size.depth - 0.69);
    if (!open(x, z, 0.93)) continue;
    const size = 0.12 + random() * 0.24;
    gravel.push({
      position: [x, 0.045, z],
      scale: [size * 1.3, size * 0.63, size],
      yaw: random() * Math.PI,
      color: slate[index % slate.length],
    });
  }

  for (let index = 0; index < 90; index += 1) {
    const x = (random() - 0.5) * (map.size.width - 0.95);
    const z = (random() - 0.5) * (map.size.depth - 1.06);
    const tall = z < 0 && clearSightline(x, z);
    if (!open(x, z, 1.12) || columns.some(({ position }) => Math.hypot(position[0] - x, position[2] - z) < 1.06)) continue;
    const height = tall ? 0.57 + random() * 0.69 : 0.22 + random() * 0.31;
    columns.push({
      position: [x, height * 0.49, z],
      scale: [height * 0.42, height, height * 0.43],
      yaw: random() * Math.PI,
      tilt: (random() - 0.5) * 0.24,
      color: slate[index % slate.length],
    });

    if (index % 3 === 0) continue;
    for (let part = -1; part <= 1; part += 1) {
      const stretch = height * (part === 0 ? 0.79 : 0.47) + 0.17;
      shards.push({
        position: [x + part * height * 0.3, stretch * 0.54, z + height * 0.3],
        scale: [stretch * 0.31, stretch * 0.81, stretch * 0.3],
        yaw: random() * Math.PI,
        tilt: part * -0.42,
        color: crystals[(index + part + crystals.length) % crystals.length],
      });
    }
  }

  const edgeZ = map.size.depth / 2;
  for (let index = 0; index < 43; index += 1) {
    const x = (random() - 0.5) * (map.size.width + 0.32);
    gravel.push({
      position: [x, -0.56 - random() * 0.35, edgeZ + 0.18],
      scale: [0.1 + random() * 0.29, 0.07 + random() * 0.22, 0.1],
      yaw: random() * Math.PI,
      color: index % 7 === 0 ? crystals[index % crystals.length] : slate[index % slate.length],
    });
  }
  return { gravel, columns, shards };
}

export const CavernScenery = memo(function CavernScenery({ map }: { map: MapDefinition }) {
  const pieces = useMemo(() => carveCavern(map), [map]);
  return (
    <group>
      <SceneryBatch pieces={pieces.gravel} shadow>
        <dodecahedronGeometry args={[1, 0]} />
      </SceneryBatch>
      <SceneryBatch pieces={pieces.columns} shadow>
        <cylinderGeometry args={[0.16, 1, 1, 5]} />
      </SceneryBatch>
      <SceneryBatch pieces={pieces.shards} emission="#245f6a" shadow>
        <octahedronGeometry args={[1, 0]} />
      </SceneryBatch>
    </group>
  );
});
