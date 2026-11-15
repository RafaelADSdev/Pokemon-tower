import { memo, useMemo } from "react";
import { Color } from "three";
import type { MapDefinition, Waypoint } from "@/data/maps/types";
import { SceneryBatch as Batch, type SceneryPiece as Piece } from "./SceneryBatch";
import { randomFor, sceneryPlacement } from "./sceneryPlacement";

function makeScenery(map: MapDefinition) {
  const halfWidth = map.size.width / 2;
  const halfDepth = map.size.depth / 2;
  const random = randomFor(221);
  const { terrain } = map.theme;
  const { open, clearSightline } = sceneryPlacement(map);
  const foliage: Piece[] = [];
  const trunks: Piece[] = [];
  const stones: Piece[] = [];
  const leaves: Piece[] = [];
  const patches: Piece[] = [];
  const treeLocations: Waypoint[] = [];
  const rockTones = ["#5e6d5e", "#617063", "#384d48"];
  const foliageTones = ["#31654c", "#48815b", "#275341", "#5b8f60"];
  const leafTones = ["#71a96c", "#447a4d", "#97a86b"];

  function tree(x: number, z: number, scale: number) {
    const yaw = random() * Math.PI;
    const base = Math.floor(random() * foliageTones.length);
    trunks.push({ position: [x, 0.28 * scale, z], scale: [0.085 * scale, 0.56 * scale, 0.085 * scale], yaw, color: "#61503c" });
    for (let layer = 0; layer < 3; layer += 1) {
      const width = (0.59 - layer * 0.12) * scale;
      foliage.push({
        position: [x, (0.70 + layer * 0.36) * scale, z],
        scale: [width, (0.77 - layer * 0.08) * scale, width],
        yaw: yaw + layer * 0.5,
        color: foliageTones[(base + layer) % foliageTones.length],
      });
    }
    treeLocations.push([x, z]);
  }

  function stone(x: number, y: number, z: number, size: number) {
    stones.push({
      position: [x, y, z],
      scale: [size, size * (0.33 + random() * 0.58), size * (0.63 + random() * 0.35)],
      yaw: random() * Math.PI,
      color: rockTones[Math.floor(random() * rockTones.length)],
    });
  }

  for (let index = 0; index < 95; index += 1) {
    const x = (random() - 0.5) * (map.size.width - 0.85);
    const z = (random() - 0.5) * (map.size.depth - 0.85);
    const perimeter = Math.abs(x) > halfWidth - 1.6 || z < -halfDepth + 1.5;
    if (!open(x, z, perimeter ? 0.87 : 1.20)) continue;

    if (
      (perimeter || random() > 0.72) &&
      clearSightline(x, z) &&
      treeLocations.every(([tx, tz]) => Math.hypot(x - tx, z - tz) > 0.9)
    ) {
      tree(x, z, (z > halfDepth - 2 ? 0.64 : 0.82) + random() * 0.58);
      stone(x + 0.58, 0.04, z + 0.08, 0.19 + random() * 0.31);
    } else {
      stone(x, 0.06, z, 0.14 + random() * 0.26);
    }
  }

  const grassColors = [
    new Color(terrain).multiplyScalar(1.45).getStyle(),
    new Color(terrain).multiplyScalar(0.74).getStyle(),
    new Color(terrain).multiplyScalar(1.18).getStyle(),
  ];

  for (let index = 0; index < 260; index += 1) {
    const x = (random() - 0.5) * (map.size.width - 0.78);
    const z = (random() - 0.5) * (map.size.depth - 0.78);
    if (!open(x, z, 0.82)) continue;

    patches.push({
      position: [x, 0.006, z],
      scale: [0.22 + random() * 0.53, 0.004, 0.18 + random() * 0.30],
      yaw: random() * Math.PI,
      color: grassColors[index % grassColors.length],
    });

    if (index % 3 !== 0) continue;
    const height = 0.07 + random() * 0.16;
    for (let blade = 0; blade < 3; blade += 1) {
      leaves.push({
        position: [x + blade * 0.088, height / 2, z + (blade % 2) * 0.06],
        scale: [0.045, height * (1 + blade * 0.16), 0.047],
        yaw: random() * Math.PI,
        color: leafTones[blade],
      });
    }
  }

  for (let index = 0; index < 56; index += 1) {
    const x = (random() - 0.5) * (map.size.width + 0.36);
    const z = index % 2 === 0 ? halfDepth + 0.12 : -halfDepth - 0.12;
    stone(x, -0.41 - random() * 0.28, z, 0.08 + random() * 0.25);
  }

  return { foliage, trunks, stones, leaves, patches };
}

export const ForestScenery = memo(function ForestScenery({ map }: { map: MapDefinition }) {
  const pieces = useMemo(() => makeScenery(map), [map]);

  return (
    <group>
      <Batch pieces={pieces.patches}><cylinderGeometry args={[1, 1, 1, 6]} /></Batch>
      <Batch pieces={pieces.stones} shadow><dodecahedronGeometry args={[1, 0]} /></Batch>
      <Batch pieces={pieces.trunks} shadow><cylinderGeometry args={[0.7, 1, 1, 5]} /></Batch>
      <Batch pieces={pieces.foliage} shadow><coneGeometry args={[1, 1, 5]} /></Batch>
      <Batch pieces={pieces.leaves}><coneGeometry args={[1, 1, 3]} /></Batch>
    </group>
  );
});
