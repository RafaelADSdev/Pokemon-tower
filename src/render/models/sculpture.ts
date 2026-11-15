import {
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  OctahedronGeometry,
  type BufferGeometry,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type Vector = readonly [number, number, number];
export type Shape = "orb" | "gem" | "spike" | "plinth" | "box";
export type Piece = readonly [
  shape: Shape,
  color: string,
  position: Vector,
  scale: Vector,
  tilt?: number,
  yaw?: number,
];

export function sculpture(pieces: readonly Piece[], base: string) {
  const pigment = new Color();
  const geometries = pieces.map(([shape, color, position, scale, tilt = 0, yaw = 0]) => {
    const geometry = makePrimitive(shape);
    const part = geometry.index ? geometry.toNonIndexed() : geometry;
    if (geometry !== part) geometry.dispose();

    part.scale(...scale);
    part.rotateZ(tilt);
    part.rotateY(yaw);
    part.translate(...position);
    part.deleteAttribute("uv");
    part.computeVertexNormals();

    pigment.set(color === "base" ? base : color);
    const colors = new Float32Array(part.attributes.position.count * 3);
    for (let index = 0; index < colors.length; index += 3) {
      pigment.toArray(colors, index);
    }
    part.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return part;
  });

  const result = mergeGeometries(geometries);
  for (const geometry of geometries) geometry.dispose();
  if (!result) throw new Error("The model primitives could not be merged.");
  return result;
}

function makePrimitive(shape: Shape): BufferGeometry {
  switch (shape) {
    case "orb": return new IcosahedronGeometry(1, 1);
    case "gem": return new OctahedronGeometry(1, 0);
    case "spike": return new ConeGeometry(1, 1, 5);
    case "plinth": return new CylinderGeometry(1, 1, 1, 8);
    case "box": return new BoxGeometry(1, 1, 1);
  }
}
