import { useTexture } from "@react-three/drei";
import { Suspense, useDeferredValue, useLayoutEffect, useState } from "react";
import { SRGBColorSpace, type Texture } from "three";
import { getCreatureAppearance, type CreatureDefinition, type CreatureLevel } from "@/data/creatures";
import { RenderBoundary } from "../RenderBoundary";
import { LoadingModel, TowerAsset, type TowerMotionProps } from "./ModelAssets";
import { towerPadTop } from "./modelFit";

type PokemonTowerProps = Omit<TowerMotionProps, "idlePose"> & {
  definition: CreatureDefinition;
  level: CreatureLevel;
};

function setPortraitColorSpace(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
}

function PokemonPortrait({ path }: { path: string }) {
  const texture = useTexture(path, setPortraitColorSpace);
  return (
    <sprite center={[0.5, 0.1]} scale={[1.4, 1.4, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

function TowerForm({ definition, level, onReady, ...motion }: PokemonTowerProps & {
  onReady?: (level: CreatureLevel) => void;
}) {
  const { model, idlePose } = getCreatureAppearance(definition, level);
  // Two-form families reach their final size with the first evolution.
  const stage = level === 2 && !definition.intermediate ? 3 : level;
  useLayoutEffect(() => {
    if (model) onReady?.(level);
  }, [level, model, onReady]);

  return model && (
    <group position-y={-towerPadTop}>
      <TowerAsset path={model} stage={stage} idlePose={idlePose} {...motion} />
    </group>
  );
}

export function PokemonTowerModel({ definition, level, ...motion }: PokemonTowerProps) {
  const visibleLevel = useDeferredValue(level);
  const [lastReadyLevel, setLastReadyLevel] = useState<CreatureLevel | null>(null);
  const { model } = getCreatureAppearance(definition, visibleLevel);
  const portrait = definition.portrait && (
    <LoadingModel fallback={null}>
      <PokemonPortrait path={definition.portrait} />
    </LoadingModel>
  );
  const previous = lastReadyLevel !== null && lastReadyLevel !== visibleLevel ? (
    <LoadingModel fallback={portrait}>
      <TowerForm definition={definition} level={lastReadyLevel} {...motion} />
    </LoadingModel>
  ) : portrait;

  if (!model) return portrait;

  return (
    <Suspense fallback={portrait}>
      <RenderBoundary key={model} fallback={previous}>
        <TowerForm definition={definition} level={visibleLevel} onReady={setLastReadyLevel} {...motion} />
      </RenderBoundary>
    </Suspense>
  );
}
