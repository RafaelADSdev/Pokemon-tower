import { memo, useEffect, useMemo } from "react";
import { TorusGeometry } from "three";
import type { GymSpecialty } from "@/data/campaign/gyms";
import type { MapDefinition, Waypoint } from "@/data/maps/types";
import { SceneryBatch, type SceneryPiece } from "./SceneryBatch";
import { sceneryPlacement } from "./sceneryPlacement";

type Point = [number, number, number];
type Shape = "block" | "drum" | "hex" | "stone" | "spike" | "orb" | "ring" | "shine";

function piecesForGym(map: MapDefinition) {
  const pieces: Record<Shape, SceneryPiece[]> = {
    block: [], drum: [], hex: [], stone: [], spike: [], orb: [], ring: [], shine: [],
  };
  const { arena, accent } = map.theme;
  if (!arena) return pieces;

  const { detail, specialty } = arena;
  const hoenn = arena.region === "hoenn";
  const steel = "#333e50";
  const silver = "#9fadb3";
  const chalk = "#e5ddd0";
  const ink = "#262736";
  const wood = "#74493e";
  const { open } = sceneryPlacement(map);

  function decorate([centerX, centerZ]: Waypoint, side: number) {
    function add(shape: Shape, [x, y, z]: Point, scale: Point, color: string, tilt = 0, yaw = 0) {
      pieces[shape].push({ position: [centerX + x, y, centerZ + z], scale, color, tilt, yaw });
    }

    function bar([x1, y1]: [number, number], [x2, y2]: [number, number], z: number, width: number, color: string) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      add("block", [(x1 + x2) / 2, (y1 + y2) / 2, z], [width, Math.hypot(dx, dy), width], color, -Math.atan2(dx, dy));
    }

    function platform(color = steel, trim = detail) {
      add("block", [0, 0.084, 0], [2.72, 0.17, 0.94], color);
      add("block", [0, 0.212, 0], [2.58, 0.087, 0.83], trim);
    }

    const layouts: Record<GymSpecialty, () => void> = {
      rock() {
        platform(hoenn ? "#69554a" : "#66594c");
        if (hoenn) {
          for (const [index, width] of [2.26, 1.76, 1.17].entries()) {
            add("block", [0.12 * index, 0.33 + index * 0.25, 0], [width, 0.25, 0.66], index % 2 ? detail : "#d3a074");
          }
          add("stone", [0.15, 0.97, 0], [0.55, 0.31, 0.32], accent, 0.16, 0.8);
          return;
        }
        add("stone", [-0.59 * side, 0.72, 0], [0.69, 0.6, 0.49], "#937558", 0.17 * side, 0.35);
        add("stone", [0.33 * side, 0.63, 0.07], [0.69, 0.46, 0.42], detail, -0.19, 0.85);
        add("stone", [0.9 * side, 0.43, 0.03], [0.31, 0.25, 0.31], accent, 0.24, 0.4);
      },
      water() {
        add("drum", [0, 0.13, 0.015], [1.46, 0.25, 0.51], hoenn ? chalk : steel);
        add("drum", [0, 0.263, 0.015], [1.38, 0.04, 0.465], accent);
        add("drum", [0, 0.287, 0.015], [1.24, 0.04, 0.405], detail);
        for (const width of [0.43, 0.76, 1.07]) {
          add("ring", [0, 0.31, 0.015], [width, 0.195, width * 0.31], accent);
        }
        if (hoenn) {
          add("hex", [0, 0.42, 0], [0.21, 0.31, 0.21], chalk);
          add("orb", [0, 0.73, 0], [0.21, 0.34, 0.21], "#d0fcfa");
          add("orb", [-0.47, 0.57, 0], [0.11, 0.19, 0.12], accent, 0.48);
          add("orb", [0.47, 0.57, 0], [0.11, 0.19, 0.12], accent, -0.48);
          return;
        }
        const x = 0.9 * side;
        add("block", [x, 0.61, -0.09], [0.18, 0.66, 0.2], chalk);
        add("block", [x - side * 0.37, 0.97, -0.09], [0.94, 0.13, 0.25], chalk);
        add("block", [x - side * 0.45, 1.045, -0.09], [0.72, 0.024, 0.2], accent);
      },
      electric() {
        platform();
        if (hoenn) {
          for (const x of [-0.89, 0.89]) {
            add("block", [x, 0.56, 0.01], [0.61, 0.67, 0.57], steel);
            add("block", [x, 0.79, 0.03], [0.64, 0.11, 0.62], detail);
            add("shine", [x, 0.58, 0.31], [0.38, 0.078, 0.018], accent);
          }
          add("block", [0, 0.77, 0], [0.72, 1.08, 0.48], detail);
          add("block", [0, 0.79, 0.244], [0.54, 0.82, 0.039], steel);
          bar([0.12, 1.13], [-0.15, 0.81], 0.28, 0.10, accent);
          bar([-0.15, 0.81], [0.11, 0.81], 0.28, 0.10, accent);
          bar([0.11, 0.81], [-0.10, 0.47], 0.28, 0.10, accent);
          return;
        }
        for (const [index, x] of [-0.83, 0, 0.83].entries()) {
          const tall = index === 1;
          const height = tall ? 1.09 : 0.69;
          const radius = tall ? 0.32 : 0.26;
          add("hex", [x, 0.35, 0], [radius, 0.24, radius], steel);
          add("drum", [x, (height + 0.35) / 2, 0], [radius * 0.52, height - 0.35, radius * 0.52], silver);
          for (let y = 0.49; y < height; y += 0.15) {
            add("ring", [x, y, 0], [radius, 0.26, radius], accent);
          }
          add("orb", [x, height + 0.11, 0], [radius * 0.73, radius * 0.73, radius * 0.73], chalk);
        }
        add("shine", [side * 1.33, 0.36, 0], [0.072, 0.32, 0.22], accent);
      },
      grass() {
        platform("#41564a", "#718c63");
        for (const z of [-0.38, 0.38]) {
          bar([-1.11, 0.26], [-1.11, 0.92], z, 0.062, chalk);
          bar([1.11, 0.26], [1.11, 0.92], z, 0.062, chalk);
          bar([-1.11, 0.92], [0, 1.32], z, 0.062, chalk);
          bar([0, 1.32], [1.11, 0.92], z, 0.062, chalk);
        }
        for (const [x, y] of [[-1.11, 0.92], [0, 1.32], [1.11, 0.92]]) {
          add("block", [x, y, 0], [0.06, 0.06, 0.84], chalk);
        }
        for (const [index, x] of [-0.78, -0.29, 0.27, 0.75].entries()) {
          add("stone", [x, 0.53, 0], [0.4, 0.36 + 0.12 * (index % 2), 0.32], index % 2 ? detail : "#558449", 0.14, index);
          add("orb", [x + 0.07, 0.78 + 0.12 * (index % 2), 0.16], [0.16, 0.12, 0.15], index % 2 ? "#ef9eb9" : "#f4cc80");
        }
      },
      poison() {
        platform(ink);
        for (const [index, x] of [-0.78, 0, 0.78].entries()) {
          const height = index === 1 ? 0.94 : 0.66;
          add("drum", [x, 0.30, 0], [0.37, 0.15, 0.36], steel);
          add("drum", [x, (height + 0.37) / 2, 0], [0.31, height - 0.37, 0.30], detail);
          add("drum", [x, height, 0], [0.36, 0.09, 0.35], steel);
          add("ring", [x, height + 0.05, 0], [0.34, 0.29, 0.33], accent);
          add("orb", [x + side * 0.07, height + 0.22, 0], [0.11, 0.13, 0.11], accent);
          add("orb", [x - side * 0.12, height + 0.37, 0], [0.071, 0.076, 0.071], accent);
        }
        add("shine", [0, 0.56, 0.315], [0.31, 0.095, 0.032], accent);
      },
      psychic() {
        add("hex", [0, 0.12, 0], [1.36, 0.23, 0.54], ink);
        add("hex", [0, 0.26, 0], [1.24, 0.08, 0.47], detail);
        add("ring", [0, 0.36, 0], [0.98, 0.23, 0.39], accent);
        add("ring", [0, 0.91, 0], [0.79, 0.26, 0.41], accent, 0.41 * side, 0.26);
        if (hoenn) {
          add("orb", [0, 0.93, 0], [0.36, 0.36, 0.36], "#c49ee9");
          add("orb", [0.81 * side, 0.72, 0], [0.18, 0.18, 0.18], "#fff3c9");
          add("orb", [-0.9 * side, 0.46, 0], [0.09, 0.09, 0.09], accent);
          return;
        }
        add("spike", [0, 0.97, 0], [0.37, 0.56, 0.35], accent, 0.19 * side, 0.4);
        add("spike", [-0.88, 0.61, 0], [0.20, 0.26, 0.20], detail, -0.24);
        add("spike", [0.88, 0.61, 0], [0.20, 0.26, 0.20], detail, 0.24);
      },
      fire() {
        if (hoenn) {
          add("drum", [0, 0.16, 0], [1.43, 0.31, 0.52], "#65534c");
          add("drum", [0, 0.33, 0], [1.27, 0.08, 0.44], "#f58648");
          add("ring", [0, 0.379, 0], [1.19, 0.27, 0.42], accent);
          add("ring", [0.06 * side, 0.39, 0.045], [0.72, 0.22, 0.22], "#ffcc77");
          add("stone", [0.82 * side, 0.55, -0.1], [0.49, 0.33, 0.35], detail, side * 0.11, 0.5);
          add("stone", [-0.95 * side, 0.45, 0.15], [0.32, 0.23, 0.31], "#966052", 0, 0.18);
          add("orb", [-0.52 * side, 0.63, 0], [0.14, 0.18, 0.13], accent, -0.17 * side);
          add("orb", [-0.41 * side, 0.92, -0.04], [0.105, 0.14, 0.109], "#ffe3ad", -0.34 * side);
          add("orb", [-0.54 * side, 1.15, -0.02], [0.07, 0.08, 0.07], "#ffe9c9");
          return;
        }
        add("hex", [0, 0.12, 0], [1.36, 0.235, 0.58], ink);
        add("hex", [0, 0.29, 0], [1.2, 0.13, 0.46], detail);
        for (const [index, x] of [-0.77, 0, 0.77].entries()) {
          const height = index === 1 ? 1.37 : 0.86;
          add("hex", [x, 0.37, 0], [0.33, 0.2, 0.33], steel);
          add("ring", [x, 0.48, 0], [0.32, 0.32, 0.32], accent);
          add("spike", [x, (height + 0.43) / 2, 0], [0.23, (height - 0.43) / 2, 0.22], "#f97638", 0.15 * side);
          add("spike", [x + 0.04 * side, 0.58, 0.15], [0.11, 0.19, 0.11], "#ffe89d", 0.18 * side);
        }
      },
      ground() {
        platform("#634635");
        for (const [index, width] of [1.92, 1.48, 1.02, 0.66].entries()) {
          add("hex", [-0.36 * side, 0.34 + index * 0.16, 0], [width * 0.5, 0.19, 0.43 - index * 0.058], index % 2 ? detail : "#ad7955", 0, 0.12);
        }
        add("stone", [0.86 * side, 0.46, 0], [0.41, 0.29, 0.34], accent, 0.2, 0.6);
        add("stone", [1.13 * side, 0.33, 0.23], [0.18, 0.12, 0.21], detail);
      },
      flying() {
        platform(hoenn ? wood : steel);
        add("block", [0, 0.29, 0.29], [1.9, 0.05, 0.12], chalk);
        if (hoenn) {
          add("drum", [-0.65, 0.69, 0], [0.125, 0.93, 0.125], wood);
          add("drum", [0.65, 0.62, 0], [0.105, 0.81, 0.105], wood);
          add("stone", [-0.65, 1.24, 0], [0.62, 0.33, 0.39], "#46765d", 0.11, 0.55);
          add("stone", [0.65, 1.11, 0], [0.56, 0.32, 0.41], "#428064", -0.12, 0.8);
        } else {
          add("drum", [-0.83 * side, 0.76, 0], [0.1, 0.96, 0.1], silver);
          add("orb", [-0.83 * side, 1.27, 0], [0.12, 0.11, 0.12], chalk);
        }
        for (const [index, width] of [0.86, 0.68, 0.49].entries()) {
          add("spike", [0.06 * side, 0.95 - index * 0.16, 0.35], [width, 0.125, 0.125], index % 2 ? accent : chalk, -0.16 * side);
        }
      },
      bug() {
        platform("#574638");
        for (const [x, y] of [[-0.65, 0.72], [0.65, 0.72], [0, 1.1]]) {
          for (let edge = 0; edge < 6; edge += 1) {
            const angle1 = edge * Math.PI / 3;
            const angle2 = (edge + 1) * Math.PI / 3;
            bar([x + 0.43 * Math.cos(angle1), y + 0.43 * Math.sin(angle1)],
              [x + 0.43 * Math.cos(angle2), y + 0.43 * Math.sin(angle2)], 0, 0.13, edge % 2 ? accent : "#c39347");
          }
          add("orb", [x, y, 0], [0.17, 0.18, 0.15], detail);
        }
      },
      normal() {
        platform(hoenn ? wood : "#6e515c");
        if (hoenn) {
          add("block", [0, 0.7, 0], [2.34, 0.86, 0.19], wood);
          for (const x of [-0.74, 0, 0.74]) {
            add("block", [x, 0.69, 0.13], [0.63, 0.64, 0.045], chalk);
            add("block", [x, 0.69, 0.16], [0.032, 0.64, 0.031], wood);
            add("block", [x, 0.69, 0.16], [0.63, 0.032, 0.031], wood);
          }
          add("block", [0, 1.17, 0], [2.57, 0.17, 0.39], detail);
          return;
        }
        add("drum", [0, 0.38, 0], [0.86, 0.27, 0.42], detail);
        add("drum", [0, 0.53, 0], [0.77, 0.1, 0.35], accent);
        for (const x of [-0.96, 0.96]) {
          add("block", [x, 0.65, -0.05], [0.53, 0.77, 0.47], ink);
          add("orb", [x, 0.63, 0.185], [0.19, 0.19, 0.08], detail);
          add("orb", [x, 0.89, 0.185], [0.09, 0.09, 0.057], accent);
        }
      },
      ghost() {
        platform(ink);
        for (const x of [-0.88, 0.88]) {
          add("drum", [x, 0.74, 0], [0.11, 1.03, 0.11], "#624454");
          add("hex", [x * 1.27, 0.38, 0.25], [0.21, 0.28, 0.21], steel);
          add("spike", [x * 1.27, 0.73, 0.25], [0.12, 0.24, 0.13], accent, x * 0.24);
        }
        add("block", [0, 1.16, 0], [2.41, 0.12, 0.19], detail);
        add("block", [0, 1.37, 0], [2.56, 0.14, 0.33], ink);
        add("block", [-1.19, 1.41, 0], [0.5, 0.14, 0.33], ink, -0.2);
        add("block", [1.19, 1.41, 0], [0.5, 0.14, 0.33], ink, 0.2);
        add("spike", [0, 0.94, 0], [0.21, 0.27, 0.18], accent, 0.27 * side);
      },
      fighting() {
        platform(hoenn ? "#515677" : wood);
        if (hoenn) {
          for (const x of [-1.17, 1.17]) {
            add("drum", [x, 0.61, 0], [0.092, 0.73, 0.092], steel);
            add("orb", [x, 0.99, 0], [0.13, 0.13, 0.13], chalk);
          }
          for (const y of [0.48, 0.66, 0.84]) {
            add("block", [0, y, 0], [2.32, 0.041, 0.042], accent);
          }
          add("block", [0, 0.35, 0.25], [1.31, 0.11, 0.37], detail);
          return;
        }
        for (const x of [-1.05, 1.05]) {
          add("block", [x, 0.74, 0], [0.13, 1, 0.15], wood);
        }
        add("block", [0, 1.24, 0], [2.24, 0.13, 0.18], wood);
        for (const x of [-0.51, 0.51]) {
          add("drum", [x, 1.08, 0], [0.04, 0.28, 0.04], steel);
          add("drum", [x, 0.72, 0], [0.2, 0.51, 0.2], detail);
          add("ring", [x, 0.79, 0], [0.21, 0.38, 0.21], accent);
        }
      },
      steel() {
        platform(ink, silver);
        for (const x of [-0.9, 0.9]) {
          add("hex", [x, 0.43, 0], [0.36, 0.37, 0.36], steel);
          add("drum", [x, 0.83, 0], [0.18, 0.58, 0.18], silver);
          add("hex", [x, 1.14, 0], [0.24, 0.15, 0.24], detail);
          add("ring", [x, 0.65, 0], [0.22, 0.42, 0.22], accent);
        }
        add("block", [0, 1.28, 0], [2.51, 0.21, 0.42], steel);
        add("shine", [0, 1.27, 0.216], [1.31, 0.061, 0.018], accent);
        add("hex", [0, 0.89, 0], [0.22, 0.57, 0.22], detail);
      },
      ice() {
        add("hex", [0, 0.15, 0], [1.44, 0.25, 0.51], "#cde2ed");
        add("hex", [0.15, 0.29, -0.06], [1.14, 0.15, 0.46], detail);
        const crystals: [number, number, number, number, string][] = [
          [-0.78, 0.39, 0.17, -0.38, "#74cadd"], [-0.31, 0.64, -0.04, -0.18, accent],
          [0.33, 0.55, 0.08, 0.19, "#c4f7ff"], [0.83, 0.32, 0.2, 0.34, detail],
        ];
        for (const [x, height, z, tilt, color] of crystals) {
          add("spike", [x, height + 0.28, z], [height * 0.53, height, height * 0.53], color, tilt, 0.49);
        }
      },
      dragon() {
        platform("#60414b");
        add("hex", [0, 0.37, 0], [0.51, 0.29, 0.43], ink);
        add("stone", [0, 0.73, 0.12], [0.35, 0.47, 0.4], detail, 0.12 * side, 0.42);
        add("spike", [-0.61, 0.94, -0.06], [0.36, 0.57, 0.16], detail, 0.57);
        add("spike", [0.61, 0.94, -0.06], [0.36, 0.57, 0.16], detail, -0.57);
        add("stone", [0, 1.21, 0.11], [0.31, 0.28, 0.36], "#82707f", 0, 0.78);
        add("hex", [0, 1.14, 0.36], [0.205, 0.126, 0.235], detail);
        add("spike", [-0.22, 1.45, 0], [0.095, 0.23, 0.08], accent, 0.34);
        add("spike", [0.22, 1.45, 0], [0.095, 0.23, 0.08], accent, -0.34);
        for (const x of [-0.12, 0.12]) {
          add("shine", [x, 1.28, 0.405], [0.09, 0.035, 0.034], accent);
        }
      },
    };

    layouts[specialty]();
  }

  const rear = -map.size.depth / 2 + 0.56;
  for (const side of [-1, 1]) {
    const sideCenter = map.size.width * 0.33 * side;
    const bays: Waypoint[] = [[sideCenter, rear], [sideCenter - side * 1.42, rear]];
    const bay = bays.find(([x, z]) => [-1.25, 0, 1.25].every((offset) => open(x + offset, z + 0.39, 0.9)));
    if (bay) decorate(bay, side);
  }

  return pieces;
}

export const GymScenery = memo(function GymScenery({ map }: { map: MapDefinition }) {
  const pieces = useMemo(() => piecesForGym(map), [map]);
  const ring = useMemo(() => new TorusGeometry(0.93, 0.07, 5, 20).rotateX(-Math.PI / 2), []);
  useEffect(() => () => ring.dispose(), [ring]);

  return (
    <group>
      <SceneryBatch pieces={pieces.block} shadow><boxGeometry args={[1, 1, 1]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.drum} shadow><cylinderGeometry args={[1, 1, 1, 18]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.hex} shadow><cylinderGeometry args={[1, 1, 1, 6]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.stone} shadow><dodecahedronGeometry args={[1, 0]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.spike} shadow><octahedronGeometry args={[1, 0]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.orb}><icosahedronGeometry args={[1, 1]} /></SceneryBatch>
      <SceneryBatch pieces={pieces.ring}><primitive object={ring} attach="geometry" /></SceneryBatch>
      <SceneryBatch pieces={pieces.shine} emission={map.theme.accent}><boxGeometry args={[1, 1, 1]} /></SceneryBatch>
    </group>
  );
});
