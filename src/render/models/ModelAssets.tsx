import { Suspense, useEffect, useMemo, type ReactNode } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Mesh, type AnimationClip, type Group, type Matrix4, type Object3D } from "three";
import { useStore } from "zustand";
import { enemyById } from "@/data/enemies";
import type { WaveDefinition } from "@/data/waves/types";
import type { GameRuntime } from "@/game/runtime";
import { RenderBoundary } from "../RenderBoundary";
import { modelNodeByPath } from "./generatedNodes";
import { fitEnemyModel, prepareTowerModel, type ModelPart } from "./modelFit";

export interface InstancedAsset {
  parts: readonly ModelPart[];
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
        if (path) useGLTF.preload(path);
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

function FittedTower({ scene, clips, idlePose, reducedMotion, paused }: {
  scene: Group;
  clips: AnimationClip[];
  idlePose?: string;
  reducedMotion: boolean;
  paused: boolean;
}) {
  const fixedPose = idlePose ? clips.find(({ name }) => name === idlePose) : undefined;
  const { model, offset, scale } = useMemo(() => prepareTowerModel(scene, fixedPose), [scene, fixedPose]);
  const idleClips = useMemo(() => {
    const idle = reducedMotion || fixedPose ? undefined : clips.find(({ name }) => /idle/i.test(name));
    return idle ? [idle] : [];
  }, [clips, fixedPose, reducedMotion]);
  const { actions } = useAnimations(idleClips, model);
  const clipName = idleClips[0]?.name;

  useEffect(() => {
    if (!clipName) return;
    const action = actions[clipName];
    if (!action) return;
    action.play();
    action.getMixer().update(0);
    return () => { action.stop(); };
  }, [actions, clipName]);

  useEffect(() => {
    if (clipName) actions[clipName]?.setEffectiveTimeScale(paused ? 0 : 1);
  }, [actions, clipName, paused]);

  return (
    <group position={offset} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

export function TowerAsset({ path, idlePose, reducedMotion, paused }: { path: string; idlePose?: string; reducedMotion: boolean; paused: boolean }) {
  const { nodes, scene, animations } = useGLTF(path);
  const model = generatedMesh(path, nodes);
  if (model) {
    model.updateWorldMatrix(true, false);
    return <mesh geometry={model.geometry} material={model.material} matrix={model.matrixWorld} matrixAutoUpdate={false} castShadow />;
  }
  return <FittedTower scene={scene} clips={animations} idlePose={idlePose} reducedMotion={reducedMotion} paused={paused} />;
}

function generatedMesh(path: string, nodes: Record<string, Object3D>) {
  const name = Object.hasOwn(modelNodeByPath, path) ? modelNodeByPath[path as keyof typeof modelNodeByPath] : undefined;
  const model = name && nodes[name];
  return model instanceof Mesh ? model : undefined;
}

export function useInstancedAsset(path: string): InstancedAsset {
  const { nodes, scene } = useGLTF(path);
  return useMemo(() => {
    const model = generatedMesh(path, nodes);
    if (!model) return { parts: fitEnemyModel(scene) };
    model.updateWorldMatrix(true, false);
    return { parts: [{ geometry: model.geometry, material: model.material }], localTransform: model.matrixWorld };
  }, [path, nodes, scene]);
}
