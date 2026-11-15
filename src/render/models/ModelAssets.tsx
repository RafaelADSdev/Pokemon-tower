import { Suspense, useEffect, type ReactNode } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import { Mesh, type BufferGeometry, type Matrix4, type Material, type Object3D } from "three";
import { creatures } from "@/data/creatures";
import { enemyById } from "@/data/enemies";
import type { GameRuntime } from "@/game/runtime";
import { RenderBoundary } from "../RenderBoundary";
import { modelNodeByPath } from "./generatedNodes";

export interface InstancedAsset {
  geometry: BufferGeometry;
  material?: Material | Material[];
  localTransform?: Matrix4;
}

export function ModelWarmup({ runtime }: { runtime: GameRuntime }) {
  useEffect(() => {
    const paths = new Set<string>();
    for (const wave of runtime.waves) {
      for (const group of wave.groups) {
        const path = enemyById[group.enemyId]?.model;
        if (path) paths.add(path);
      }
    }
    for (const definition of creatures) {
      if (definition.model) paths.add(definition.model);
    }
    for (const path of paths) useGLTF.preload(path, false, true);
  }, [runtime]);
  return null;
}

export function LoadingModel({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  return (
    <RenderBoundary fallback={fallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </RenderBoundary>
  );
}

export function TowerAsset({ path }: { path: string }) {
  const { nodes, scene } = useGLTF(path, false, true);
  const model = generatedMesh(path, nodes);
  if (model) {
    model.updateWorldMatrix(true, false);
    return <mesh geometry={model.geometry} material={model.material} matrix={model.matrixWorld} matrixAutoUpdate={false} castShadow />;
  }
  return <Clone object={scene} castShadow dispose={null} />;
}

function generatedMesh(path: string, nodes: Record<string, Object3D>) {
  const name = Object.hasOwn(modelNodeByPath, path) ? modelNodeByPath[path as keyof typeof modelNodeByPath] : undefined;
  const model = name && nodes[name];
  return model instanceof Mesh ? model : undefined;
}

export function useInstancedAsset(path: string): InstancedAsset {
  const { nodes } = useGLTF(path, false, true);
  // Enemy GLBs have one vertex-colored mesh, so each species uses one batch.
  const model = generatedMesh(path, nodes) ?? Object.values(nodes).find((node): node is Mesh => node instanceof Mesh);
  if (!model) throw new Error(`No instanced mesh in ${path}`);
  model.updateWorldMatrix(true, false);
  return { geometry: model.geometry, material: model.material, localTransform: model.matrixWorld };
}
