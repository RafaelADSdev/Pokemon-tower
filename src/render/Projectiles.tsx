import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color, DodecahedronGeometry, DoubleSide, LatheGeometry, Object3D, Shape,
  ShapeGeometry, SphereGeometry, TorusGeometry, Vector2, Vector3, type InstancedMesh,
} from "three";
import type { ElementId } from "@/data/elements";
import type { GameRuntime } from "@/game/runtime";
import { attackElements, attackStyles } from "./attackVfx";
import { drawCapacity, interpolatePosition, prepareInstances, publishInstances } from "./instances";

const up = new Vector3(0, 1, 0);
const projectileSize = {
  brasa: [0.39, 0.39, 0.64],
  mare: [0.176, 0.18, 0.226],
  folha: [0.65, 0.65, 0.67],
  faisca: [0.60, 0.60, 0.71],
  pedra: [0.23, 0.23, 0.235],
  sombra: [0.23, 0.22, 0.26],
} as const satisfies Record<ElementId, readonly [number, number, number]>;

function leafShape() {
  const leaf = new Shape();
  leaf.moveTo(0, -0.49);
  leaf.bezierCurveTo(-0.47, -0.26, -0.37, 0.15, 0.05, 0.44);
  leaf.bezierCurveTo(0.46, 0.04, 0.35, -0.22, 0, -0.49);
  return leaf;
}

function boltShape() {
  return new Shape([
    new Vector2(-0.28, -0.58), new Vector2(0.35, -0.06),
    new Vector2(0.08, -0.04), new Vector2(0.34, 0.55),
    new Vector2(-0.34, 0.015), new Vector2(-0.08, 0),
  ]);
}

function makeProjectileGeometries() {
  return {
    brasa: new LatheGeometry([
      new Vector2(0, -0.56), new Vector2(0.24, -0.16), new Vector2(0.39, 0.04),
      new Vector2(0.31, 0.23), new Vector2(0, 0.34),
    ], 10).rotateX(Math.PI / 2),
    mare: new SphereGeometry(1, 10, 8),
    folha: new ShapeGeometry(leafShape(), 6).rotateX(Math.PI / 2),
    faisca: new ShapeGeometry(boltShape()).rotateX(Math.PI / 2),
    pedra: new DodecahedronGeometry(1, 0),
    sombra: new TorusGeometry(0.64, 0.27, 6, 12).rotateX(Math.PI / 2),
  };
}

const emptyCounts: Record<ElementId, number> = {
  brasa: 0, mare: 0, folha: 0, faisca: 0, pedra: 0, sombra: 0,
};

function finish(mesh: InstancedMesh, count: number) {
  publishInstances(mesh, count);
  if (mesh.instanceColor && count > 0) mesh.instanceColor.needsUpdate = true;
}

export function Projectiles({ runtime, alpha, compact, reducedMotion }: {
  runtime: GameRuntime;
  alpha: RefObject<number>;
  compact: boolean;
  reducedMotion: boolean;
}) {
  const cores = useRef<Partial<Record<ElementId, InstancedMesh>>>({});
  const highlights = useRef<InstancedMesh>(null);
  const trails = useRef<InstancedMesh>(null);
  const countRef = useRef({ ...emptyCounts });
  const geometries = useMemo(() => makeProjectileGeometries(), []);
  const transform = useMemo(() => new Object3D(), []);
  const anchor = useMemo(() => new Vector3(), []);
  const behind = useMemo(() => new Vector3(), []);
  const tint = useMemo(() => new Color(), []);

  useEffect(() => () => {
    for (const geometry of Object.values(geometries)) geometry.dispose();
  }, [geometries]);

  useFrame(() => {
    const glints = highlights.current;
    const wake = trails.current;
    if (!glints) return;
    const counts = countRef.current;
    for (const element of attackElements) counts[element] = 0;
    let glintCount = 0;
    let trailCount = 0;
    for (const { id, position, projectile } of runtime.queries.projectiles.entities) {
      const { element } = projectile;
      const core = cores.current[element];
      if (!core || counts[element] >= drawCapacity) continue;
      const style = attackStyles[element];
      const size = projectileSize[element];
      const dx = position.x - position.previousX;
      const dz = position.z - position.previousZ;
      const heading = dx || dz ? Math.atan2(dx, dz) : projectile.heading;
      behind.set(-Math.sin(heading), 0, -Math.cos(heading));
      interpolatePosition(anchor, position, alpha.current);
      anchor.setY(anchor.y + 0.1);
      const spin = reducedMotion ? 0 : anchor.dot(behind) * 1.85 + id * 0.83;

      transform.position.copy(anchor);
      transform.rotation.set(0, heading, 0);
      if (element === "pedra") transform.rotateX(spin).rotateZ(spin * 0.7);
      if (element === "folha") transform.rotateZ(Math.sin(spin) * 0.28);
      transform.scale.set(size[0], size[1], size[2]);
      transform.updateMatrix();
      const coreIndex = counts[element]++;
      core.setMatrixAt(coreIndex, transform.matrix);

      if (glintCount < drawCapacity) {
        const thin = element === "faisca" || element === "folha";
        transform.position.copy(anchor).addScaledVector(behind, thin ? -0.036 : -0.088);
        transform.position.setY(transform.position.y + (thin ? 0.02 : 0.069));
        transform.rotation.set(0, heading, 0);
        transform.scale.set(thin ? 0.042 : 0.1, thin ? 0.022 : 0.072, thin ? 0.16 : 0.125);
        transform.updateMatrix();
        glints.setMatrixAt(glintCount, transform.matrix);
        glints.setColorAt(glintCount++, tint.set(style.accent));
      }

      if (wake && trailCount < drawCapacity) {
        const length = style.span * (compact ? 0.74 : 1);
        const width = element === "faisca" ? 0.085 : element === "pedra" ? 0.15 : 0.131;
        transform.position.copy(anchor).addScaledVector(behind, length * 0.5 + 0.045);
        transform.quaternion.setFromUnitVectors(up, behind);
        transform.scale.set(width, length, width);
        transform.updateMatrix();
        wake.setMatrixAt(trailCount, transform.matrix);
        wake.setColorAt(trailCount++, tint.set(style.trail));
      }
    }

    for (const element of attackElements) {
      const core = cores.current[element];
      if (core) publishInstances(core, counts[element]);
    }
    finish(glints, glintCount);
    if (wake) finish(wake, trailCount);
  });

  return (
    <>
      {attackElements.map((element) => (
        <instancedMesh
          key={element}
          args={[undefined, undefined, drawCapacity]}
          ref={(mesh) => { if (mesh) cores.current[element] = mesh; else delete cores.current[element]; }}
          count={0} onUpdate={prepareInstances} frustumCulled={false}
        >
          <primitive attach="geometry" object={geometries[element]} />
          <meshBasicMaterial color={attackStyles[element].core} toneMapped={false} side={DoubleSide} />
        </instancedMesh>
      ))}
      <instancedMesh ref={highlights} args={[undefined, undefined, drawCapacity]} count={0} onUpdate={prepareInstances} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {!reducedMotion && (
        <instancedMesh ref={trails} args={[undefined, undefined, drawCapacity]} count={0} onUpdate={prepareInstances} frustumCulled={false}>
          <coneGeometry args={[1, 1, 7]} />
          <meshBasicMaterial transparent opacity={0.43} depthWrite={false} toneMapped={false} />
        </instancedMesh>
      )}
    </>
  );
}
