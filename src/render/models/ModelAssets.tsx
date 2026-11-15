import { Suspense, useEffect, type ReactNode } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import { Mesh, type BufferGeometry, type Matrix4, type Material, type Object3D } from "three";
import { useStore } from "zustand";
import { enemyById } from "@/data/enemies";
import type { WaveDefinition } from "@/data/waves/types";
import type { GameRuntime } from "@/game/runtime";
import { RenderBoundary } from "../RenderBoundary";
import { modelNodeByPath } from "./generatedNodes";

export interface InstancedAsset {
  geometry: BufferGeometry;
  material?: Material | Material[];
  localTransform?: Matrix4;
}

export function collectEnemyTypes(waves: readonly WaveDefinition[]) {
  const ids = new Set<string>();
  for (const wave of waves) {
    for (const group of wave.groups) {
      let id: string | undefined = group.enemyId;
      while (id !== undefined && !ids.has(id)) {
        ids.add(id);
        id = enemyById[id]?.traits.split?.enemyId;
      }
    }
  }
  return ids;
}

export function ModelWarmup({ runtime }: { runtime: GameRuntime }) {
  const wave = useStore(runtime.store, (state) => state.wave);
  useEffect(() => {
    const upcoming = collectEnemyTypes(runtime.waves.slice(Math.max(0, wave - 1), wave + 1));
    const warm = () => {
      for (const id of upcoming) {
        const path = enemyById[id]?.model;
        if (path) useGLTF.preload(path, false, true);
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      const job = window.requestIdleCallback(warm, { timeout: 1_800 });
      return () => window.cancelIdleCallback(job);
    }
    const job = window.setTimeout(warm, 240);
    return () => window.clearTimeout(job);
  }, [runtime, wave]);
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
