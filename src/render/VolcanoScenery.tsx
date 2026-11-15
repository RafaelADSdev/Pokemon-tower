import { memo, useMemo } from "react";
import type { MapDefinition } from "@/data/maps/types";
import { SceneryBatch, type SceneryPiece } from "./SceneryBatch";
import { randomFor, sceneryPlacement } from "./sceneryPlacement";

function forgeVolcano(map: MapDefinition) {
  const random = randomFor(7_009);
  const { open, clearSightline } = sceneryPlacement(map);
  const halfWidth = map.size.width / 2;
  const halfDepth = map.size.depth / 2;
  const rock = ["#432f32", "#594042", "#625051", "#35282d"];
  const lava = ["#ff853f", "#ffb05c", "#e35438"];
  const rubble: SceneryPiece[] = [];
  const chimneys: SceneryPiece[] = [];
  const fissures: SceneryPiece[] = [];
  const embers: SceneryPiece[] = [];
  const trenches: SceneryPiece[] = [];

  function crack(x: number, z: number, dstX: number, dstZ: number) {
    if (Math.abs(dstX) > halfWidth - 0.31 || Math.abs(dstZ) > halfDepth - 0.31) return;
    if (!open(x, z, 0.87) || !open(dstX, dstZ, 0.87) || !open((x + dstX) / 2, (z + dstZ) / 2, 0.86)) return;
    const width = 0.035 + random() * 0.075;
    const length = Math.hypot(dstX - x, dstZ - z);
    const centerX = (x + dstX) / 2;
    const centerZ = (z + dstZ) / 2;
    const yaw = Math.atan2(dstX - x, dstZ - z);
    trenches.push({
      position: [centerX, 0.012, centerZ], scale: [width * 2.5, 0.021, length + 0.07], yaw, color: "#372425",
    });
    fissures.push({
      position: [centerX, 0.025, centerZ], scale: [width, 0.015, length + width], yaw,
      color: lava[Math.floor(random() * lava.length)],
    });
  }

  for (let index = 0; index < 135; index += 1) {
    const x = (random() - 0.5) * (map.size.width - 0.91);
    const z = (random() - 0.5) * (map.size.depth - 0.7);
    if (!open(x, z, 0.94)) continue;
    const size = 0.09 + random() * 0.39;
    rubble.push({
      position: [x, size * 0.17, z],
      scale: [size, size * 0.72, size * 0.74],
      color: rock[index % rock.length],
      yaw: random() * Math.PI,
    });
    if (index % 5 === 0) {
      const dx = (random() - 0.5) * 1.58;
      const dz = (random() - 0.5) * 1.76;
      crack(x, z, x + dx, z + dz);
      crack(x + dx, z + dz, x + dx * 1.48, z + dz * 1.92);
      crack(x, z, x - dx * 0.64, z - dz * 0.81);
    }
  }

  for (let index = 0; index < 82; index += 1) {
    const x = (random() - 0.5) * (map.size.width - 0.7);
    const z = (random() - 0.5) * (map.size.depth - 0.76);
    if (!clearSightline(x, z) || !open(x, z, 1.22) ||
      chimneys.some(({ position }) => Math.hypot(position[0] - x, position[2] - z) < 0.8)) continue;
    const height = z < 0 ? 0.28 + random() * 1.35 : 0.20 + random() * 0.42;
    const width = 0.15 + random() * 0.29;
    chimneys.push({
      position: [x, height / 2, z],
      scale: [width, height, width],
      color: rock[index % rock.length],
      yaw: random() * Math.PI,
      tilt: 0.05 + random() * 0.1,
    });
    if (index % 3 === 0) continue;
    embers.push({
      position: [x + 0.031, height + 0.027, z],
      scale: [width * 0.61, 0.064, width * 0.67],
      color: lava[index % lava.length],
    });
  }

  for (let index = 0; index < 32; index += 1) {
    const x = (random() - 0.5) * (map.size.width - 1.23);
    const z = halfDepth + 0.252;
    const y = -0.36 - random() * 0.53;
    const streak = 0.045 + random() * 0.25;
    fissures.push({ position: [x, y, z], scale: [streak, 0.022, 0.029], color: lava[index % lava.length] });
  }

  return { rubble, chimneys, fissures, embers, trenches };
}

export const VolcanoScenery = memo(function VolcanoScenery({ map }: { map: MapDefinition }) {
  const pieces = useMemo(() => forgeVolcano(map), [map]);
  return (
    <group>
      <SceneryBatch pieces={pieces.trenches}><boxGeometry args={[1, 1, 1]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.fissures} emission="#9f3415"><boxGeometry args={[1, 1, 1]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.rubble} shadow><dodecahedronGeometry args={[1, 0]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.chimneys} shadow><cylinderGeometry args={[0.82, 1, 1, 6]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.embers} emission="#9d3217"><cylinderGeometry args={[1, 1, 1, 6]} /></SceneryBatch>
    </group>
  );
});
