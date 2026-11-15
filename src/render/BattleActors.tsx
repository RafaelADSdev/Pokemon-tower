import { lazy, Suspense, type RefObject } from "react";
import type { EnemyEntity } from "@/game/ecs/world";
import type { GameRuntime } from "@/game/runtime";
import { Effects } from "./Effects";
import { Enemies } from "./Enemies";
import { Projectiles } from "./Projectiles";
import { RenderBoundary } from "./RenderBoundary";
import { Towers } from "./Towers";
import { ModelWarmup } from "./models/ModelAssets";

const PostProcessing = lazy(() => import("./PostProcessing"));

interface BattleActorsProps {
  runtime: GameRuntime;
  alpha: RefObject<number>;
  selectedSlot?: string | null;
  onSelectEnemy?: (entity: EnemyEntity) => void;
  highEffects: boolean;
  reducedMotion: boolean;
}

export default function BattleActors({ runtime, alpha, selectedSlot, onSelectEnemy, highEffects, reducedMotion }: BattleActorsProps) {
  return (
    <>
      <ModelWarmup runtime={runtime} />
      <Enemies runtime={runtime} alpha={alpha} reducedMotion={reducedMotion} onSelectEnemy={onSelectEnemy} />
      <Projectiles runtime={runtime} alpha={alpha} />
      <Towers runtime={runtime} selectedSlot={selectedSlot} reducedMotion={reducedMotion} />
      <Effects runtime={runtime} compact={!highEffects} reducedMotion={reducedMotion} />
      {highEffects && !reducedMotion && (
        <RenderBoundary fallback={null}>
          <Suspense fallback={null}><PostProcessing /></Suspense>
        </RenderBoundary>
      )}
    </>
  );
}
