import { useEffect, useMemo } from "react";
import { Color, ExtrudeGeometry, Shape, ShapeGeometry } from "three";
import type { MapDefinition, Waypoint } from "@/data/maps/types";

function chamferedRectangle(width: number, depth: number, cut: number) {
  const x = width / 2;
  const z = depth / 2;
  const points: Waypoint[] = [
    [-x + cut, -z], [x - cut, -z], [x, -z + cut], [x, z - cut],
    [x - cut, z], [-x + cut, z], [-x, z - cut], [-x, -z + cut],
  ];
  return shapeFromPoints(points);
}

function shapeFromPoints(points: readonly Waypoint[]) {
  const shape = new Shape();
  points.forEach(([x, z], index) => {
    if (index === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  return shape;
}

function trailGeometry(path: readonly Waypoint[], halfWidth: number) {
  const left: Waypoint[] = [];
  const right: Waypoint[] = [];

  path.forEach(([x, z], index) => {
    const previous = path[index - 1] ?? path[index];
    const next = path[index + 1] ?? path[index];
    const start = index === 0 ? path[0] : previous;
    const end = index === path.length - 1 ? path[index] : next;
    const incomingAngle = index === 0
      ? Math.atan2(next[1] - z, next[0] - x)
      : Math.atan2(z - start[1], x - start[0]);
    const outgoingAngle = index === path.length - 1
      ? incomingAngle
      : Math.atan2(end[1] - z, end[0] - x);
    const normalX = -Math.sin(incomingAngle) - Math.sin(outgoingAngle);
    const normalZ = Math.cos(incomingAngle) + Math.cos(outgoingAngle);
    const miter = Math.max(0.5, normalX * -Math.sin(incomingAngle) + normalZ * Math.cos(incomingAngle));
    const dx = normalX * halfWidth / miter;
    const dz = normalZ * halfWidth / miter;

    left.push([x + dx, z + dz]);
    right.push([x - dx, z - dz]);
  });

  return new ShapeGeometry(shapeFromPoints([...left, ...right.reverse()]));
}

function Trail({ path, trail, edge }: { path: readonly Waypoint[]; trail: string; edge: string }) {
  const shapes = useMemo(() => [
    trailGeometry(path, 0.68),
    trailGeometry(path, 0.55),
    trailGeometry(path, 0.43),
  ], [path]);
  useEffect(() => () => shapes.forEach((geometry) => geometry.dispose()), [shapes]);

  return (
    <group rotation-x={-Math.PI / 2}>
      <mesh geometry={shapes[0]} position-z={0.015} receiveShadow>
        <meshStandardMaterial color={edge} roughness={1} />
      </mesh>
      <mesh geometry={shapes[1]} position-z={0.024} receiveShadow>
        <meshStandardMaterial color={trail} roughness={1} />
      </mesh>
      <mesh geometry={shapes[2]} position-z={0.031} receiveShadow>
        <meshStandardMaterial color={new Color(trail).multiplyScalar(1.15)} roughness={1} />
      </mesh>
    </group>
  );
}

function useDiorama(width: number, depth: number) {
  const geometry = useMemo(() => ({
    bedrock: new ExtrudeGeometry(chamferedRectangle(width + 0.36, depth + 0.38, 0.97), {
      depth: 0.76,
      bevelEnabled: true,
      bevelSize: 0.18,
      bevelThickness: 0.12,
      bevelSegments: 1,
    }),
    soil: new ExtrudeGeometry(chamferedRectangle(width + 0.14, depth + 0.16, 0.74), {
      depth: 0.38,
      bevelEnabled: true,
      bevelSize: 0.12,
      bevelThickness: 0.08,
      bevelSegments: 1,
    }),
    surface: new ExtrudeGeometry(chamferedRectangle(width, depth, 0.66), {
      depth: 0.08,
      bevelEnabled: false,
    }),
  }), [width, depth]);
  useEffect(() => () => Object.values(geometry).forEach((layer) => layer.dispose()), [geometry]);
  return geometry;
}

function Grid({ width, depth, color }: { width: number; depth: number; color: string }) {
  const points = useMemo(() => {
    const vertices: number[] = [];
    for (let x = -width / 2 + 1; x < width / 2; x += 1) {
      vertices.push(x, 0.003, -depth / 2, x, 0.003, depth / 2);
    }
    for (let z = -depth / 2 + 1; z < depth / 2; z += 1) {
      vertices.push(-width / 2, 0.003, z, width / 2, 0.003, z);
    }
    return new Float32Array(vertices);
  }, [width, depth]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.13} depthWrite={false} />
    </lineSegments>
  );
}

export function Terrain({ map }: { map: MapDefinition }) {
  const { width, depth } = map.size;
  const { terrain, trail, edge, accent } = map.theme;
  const layers = useDiorama(width, depth);

  return (
    <group>
      <mesh geometry={layers.bedrock} position-y={-1.45} rotation-x={-Math.PI / 2}>
        <meshStandardMaterial color={new Color(edge).multiplyScalar(0.67)} roughness={1} flatShading />
      </mesh>
      <mesh geometry={layers.soil} position-y={-0.68} rotation-x={-Math.PI / 2}>
        <meshStandardMaterial color={edge} roughness={1} flatShading />
      </mesh>
      <mesh geometry={layers.surface} position-y={-0.08} rotation-x={-Math.PI / 2} receiveShadow>
        <meshStandardMaterial color={terrain} roughness={1} flatShading />
      </mesh>
      <Grid width={width} depth={depth} color={accent} />
      {map.paths.map((path, index) => (
        <Trail key={index} path={path} trail={trail} edge={edge} />
      ))}
    </group>
  );
}
