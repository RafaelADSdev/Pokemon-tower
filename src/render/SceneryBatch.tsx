import { useCallback, type ReactNode } from "react";
import { Color, InstancedMesh, Object3D } from "three";

export interface SceneryPiece {
  position: [number, number, number];
  scale: [number, number, number];
  yaw?: number;
  tilt?: number;
  color: string;
}

export function SceneryBatch({ pieces, children, shadow = false, emission }: {
  pieces: SceneryPiece[];
  children: ReactNode;
  shadow?: boolean;
  emission?: string;
}) {
  const fill = useCallback((mesh: InstancedMesh | null) => {
    if (!mesh) return;
    const transform = new Object3D();
    const color = new Color();

    pieces.forEach((piece, index) => {
      transform.position.set(...piece.position);
      transform.rotation.set(0, piece.yaw ?? 0, piece.tilt ?? 0);
      transform.scale.set(...piece.scale);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
      mesh.setColorAt(index, color.set(piece.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [pieces]);

  if (pieces.length === 0) return null;

  return (
    <instancedMesh args={[undefined, undefined, pieces.length]} ref={fill} castShadow={shadow} receiveShadow>
      {children}
      <meshStandardMaterial flatShading roughness={1} emissive={emission} emissiveIntensity={emission ? 0.82 : 0} />
    </instancedMesh>
  );
}
