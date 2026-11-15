import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { GymSpecialty } from "@/data/campaign/gyms";
import type { MapDefinition } from "@/data/maps/types";
import { randomFor, sceneryPlacement } from "./sceneryPlacement";

type Brush = CanvasRenderingContext2D;
type FloorPattern = "masonry" | "panels" | "timber" | "tiles" | "ripples" | "inlay";

const floorPatterns = {
  rock: "masonry",
  water: "ripples",
  electric: "panels",
  grass: "inlay",
  poison: "panels",
  psychic: "tiles",
  fire: "masonry",
  ground: "masonry",
  flying: "timber",
  bug: "inlay",
  normal: "timber",
  ghost: "tiles",
  fighting: "timber",
  steel: "panels",
  ice: "ripples",
  dragon: "tiles",
} as const satisfies Record<GymSpecialty, FloorPattern>;

const paint = "#f6f0da";
const darkPaint = "#212534";

function line(brush: Brush, x1: number, y1: number, x2: number, y2: number) {
  brush.beginPath();
  brush.moveTo(x1, y1);
  brush.lineTo(x2, y2);
  brush.stroke();
}

function panelSurface(brush: Brush, width: number, depth: number, pattern: FloorPattern, detail: string) {
  const hardwood = pattern === "timber";
  const spacing = hardwood ? 0.34 : 1.15;
  const tileLength = hardwood ? 3.3 : 2.22;
  const bolted = pattern === "panels";

  for (let row = 0, z = 0; z < depth; z += spacing, row += 1) {
    brush.fillStyle = detail;
    brush.globalAlpha = row % 3 === 0 ? 0.15 : 0.05;
    brush.fillRect(0, z, width, spacing);
    brush.strokeStyle = darkPaint;
    brush.lineWidth = hardwood ? 0.026 : 0.042;
    brush.globalAlpha = 0.26;
    line(brush, 0, z, width, z);

    const offset = bolted ? 0.6 : row % 3 * tileLength / 3;
    for (let x = offset; x < width; x += tileLength) {
      line(brush, x, z, x, z + spacing);
      if (bolted) {
        brush.fillStyle = paint;
        brush.fillRect(x + 0.09, z + 0.085, 0.062, 0.062);
      }
    }
  }
}

function patternedSurface(brush: Brush, width: number, depth: number, pattern: FloorPattern, detail: string) {
  if (pattern === "masonry" || pattern === "panels" || pattern === "timber") {
    panelSurface(brush, width, depth, pattern, detail);
    return;
  }

  brush.strokeStyle = detail;
  brush.lineWidth = 0.047;
  brush.globalAlpha = 0.32;
  const spacing = pattern === "ripples" ? 0.8 : 1.22;
  for (let row = 0, z = 0; z < depth + spacing; z += spacing, row += 1) {
    if (pattern === "ripples") {
      brush.beginPath();
      brush.moveTo(-1, z);
      for (let x = -1; x < width; x += 1.9) {
        brush.bezierCurveTo(x + 0.45, z + 0.24, x + 1.25, z - 0.24, x + 1.9, z);
      }
      brush.stroke();
      continue;
    }

    for (let x = row % 2 === 0 ? 0 : -1.3; x < width + 1.3; x += 2.6) {
      brush.beginPath();
      brush.moveTo(x, z - spacing);
      brush.lineTo(x + 1.3, z);
      brush.lineTo(x, z + spacing);
      brush.lineTo(x - 1.3, z);
      brush.closePath();
      brush.stroke();
      if (pattern === "inlay") {
        line(brush, x - 0.16, z, x + 0.16, z);
        line(brush, x, z - 0.16, x, z + 0.16);
      }
    }
  }
}

function courtLines(brush: Brush, width: number, depth: number, accent: string) {
  const marginX = 0.55;
  const marginZ = 0.42;
  const innerWidth = width - 2 * marginX;
  const innerDepth = depth - 2 * marginZ;

  brush.globalAlpha = 1;
  brush.strokeStyle = darkPaint;
  brush.lineWidth = 0.22;
  brush.strokeRect(marginX, marginZ, innerWidth, innerDepth);
  brush.strokeStyle = paint;
  brush.globalAlpha = 0.78;
  brush.lineWidth = 0.095;
  brush.strokeRect(marginX, marginZ, innerWidth, innerDepth);

  for (const side of [-1, 1]) {
    const edge = width / 2 + side * innerWidth / 2;
    const inset = edge - side * 0.29;
    const top = depth / 2 - 2.5;
    const height = 5;

    brush.fillStyle = accent;
    brush.globalAlpha = 0.24;
    brush.fillRect(Math.min(inset, edge), top, 0.29, height);
    brush.globalAlpha = 0.88;
    brush.strokeStyle = accent;
    brush.lineWidth = 0.076;
    line(brush, inset, top, inset, top + height);

    brush.strokeStyle = paint;
    for (const end of [-1, 1]) {
      const z = depth / 2 + end * (innerDepth / 2 - 0.28);
      brush.lineWidth = 0.135;
      line(brush, inset, z, inset - side * 0.9, z);
      brush.lineWidth = 0.078;
      for (let tick = 0; tick < 3; tick += 1) {
        const x = inset - side * (1.18 + tick * 0.23);
        line(brush, x, z, x - side * 0.12, z - end * 0.22);
      }
    }
  }
}

function pokeball(brush: Brush, x: number, z: number, radius: number, accent: string) {
  brush.save();
  brush.translate(x, z);
  brush.beginPath();
  brush.arc(0, 0, radius, 0, 2 * Math.PI);
  brush.clip();

  brush.globalAlpha = 0.32;
  brush.fillStyle = accent;
  brush.fillRect(-radius, -radius, radius * 2, radius);
  brush.globalAlpha = 0.17;
  brush.fillStyle = paint;
  brush.fillRect(-radius, 0, radius * 2, radius);
  brush.globalAlpha = 0.76;
  brush.strokeStyle = darkPaint;
  brush.lineWidth = 0.23;
  line(brush, -radius, 0, radius, 0);
  brush.globalAlpha = 0.9;
  brush.strokeStyle = paint;
  brush.lineWidth = 0.105;
  line(brush, -radius, 0, radius, 0);
  brush.restore();

  brush.globalAlpha = 0.88;
  brush.strokeStyle = darkPaint;
  brush.lineWidth = 0.3;
  brush.beginPath();
  brush.arc(x, z, radius, 0, 2 * Math.PI);
  brush.stroke();
  brush.strokeStyle = paint;
  brush.lineWidth = 0.14;
  brush.stroke();

  brush.globalAlpha = 1;
  brush.fillStyle = darkPaint;
  brush.beginPath();
  brush.arc(x, z, radius * 0.265, 0, 2 * Math.PI);
  brush.fill();
  brush.strokeStyle = paint;
  brush.lineWidth = 0.105;
  brush.stroke();
  brush.fillStyle = paint;
  brush.beginPath();
  brush.arc(x, z, radius * 0.14, 0, 2 * Math.PI);
  brush.fill();
}

// Keep the emblem's button near midfield and visible between paths and tower pads.
function emblemCenter(map: MapDefinition) {
  const { open } = sceneryPlacement(map);
  const right = map.paths[0][0][0] < 0 ? 1 : -1;
  const candidates = [[0, 0], [1, 0], [0, -1], [0, 1], [-1, 0], [2.65, 0], [-2.65, 0], [1.3, 0], [-1.3, 0]] as const;
  const [x, z] = candidates.find(([cx, cz]) => open(cx * right, cz, 1.12)) ?? candidates[0];
  return [x * right, z];
}

function courtTexture(map: MapDefinition, width: number, depth: number) {
  const { arena, terrain, accent } = map.theme;
  if (!arena) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round(canvas.width * depth / width);
  const brush = canvas.getContext("2d");
  if (!brush) return null;

  brush.scale(canvas.width / width, canvas.height / depth);
  brush.fillStyle = terrain;
  brush.fillRect(0, 0, width, depth);
  patternedSurface(brush, width, depth, floorPatterns[arena.specialty], arena.detail);
  courtLines(brush, width, depth, accent);
  const [x, z] = emblemCenter(map);
  pokeball(brush, width / 2 + x, depth / 2 + z, Math.min(2.48, depth * 0.24), accent);

  // A little scuffing softens the clean vector paint at the scale of the board.
  let seed = 0;
  for (const char of arena.id) seed = Math.imul(seed, 31) + char.charCodeAt(0);
  const random = randomFor(seed);
  for (const [ink, opacity] of [[paint, 0.15], [darkPaint, 0.18]] as const) {
    brush.fillStyle = ink;
    brush.globalAlpha = opacity;
    for (let spot = 0; spot < 1100; spot += 1) {
      const size = 0.014 + random() * 0.04;
      brush.fillRect(random() * width, random() * depth, size * 1.6, size);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function GymCourt({ map }: { map: MapDefinition }) {
  // The board's 0.66-unit chamfers remain visible beyond this rectangle.
  const width = map.size.width - 0.84;
  const depth = map.size.depth - 0.84;
  const texture = useMemo(() => courtTexture(map, width, depth), [map, width, depth]);
  useEffect(() => () => texture?.dispose(), [texture]);
  if (!texture) return null;

  return (
    <mesh position-y={0.006} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={texture} roughness={0.94} />
    </mesh>
  );
}
