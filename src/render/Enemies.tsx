import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { InstancedMesh, Object3D, Sphere, Vector3 } from "three";
import { useStore } from "zustand";
import { enemies, type EnemyDefinition } from "@/data/enemies";
import type { EnemyEntity } from "@/game/ecs/world";
import type { GameRuntime } from "@/game/runtime";
import { EnemyIndicators } from "./EnemyIndicators";
import { drawCapacity, interpolatePosition, prepareInstances, publishInstances } from "./instances";
import { collectEnemyTypes, LoadingModel, useInstancedAsset, type InstancedAsset } from "./models/ModelAssets";
import { enemyPieces } from "./models/enemySculptures";
import { sculpture } from "./models/sculpture";

interface EnemiesProps {
  runtime: GameRuntime;
  alpha: RefObject<number>;
  reducedMotion: boolean;
  onSelectEnemy?: (entity: EnemyEntity) => void;
}

function prepareEnemyMesh(mesh: InstancedMesh) {
  prepareInstances(mesh);
  // These matrices are replaced every frame and can move across the entire board.
  mesh.boundingSphere ??= new Sphere(new Vector3(), 96);
}

type EnemyBatchProps = EnemiesProps & { definition: EnemyDefinition };

function EnemyBatch({ definition, runtime, alpha, reducedMotion, onSelectEnemy, model }: EnemyBatchProps & { model: InstancedAsset }) {
  const bodies = useRef<InstancedMesh>(null);
  const shades = useRef<InstancedMesh>(null);
  const ids = useRef<Int32Array | null>(null);
  const shadeIds = useRef<Int32Array | null>(null);
  const transform = useMemo(() => new Object3D(), []);
  const { geometry, material, localTransform } = model;
  const { flying, boss, stealth } = definition.traits;

  useEffect(() => {
    ids.current = new Int32Array(drawCapacity);
    if (stealth) shadeIds.current = new Int32Array(drawCapacity);
  }, [stealth]);

  useFrame(() => {
    const mesh = bodies.current;
    if (!mesh || !ids.current) return;
    const ethereal = shades.current;
    const lookup = ids.current;
    const shadeLookup = shadeIds.current;
    const entities = runtime.queries.enemies.entities;
    let count = 0;
    let shadesCount = 0;

    for (let index = 0; index < entities.length; index += 1) {
      const { id, enemy, position } = entities[index];
      if (enemy.definition.id !== definition.id) continue;
      const hidden = !enemy.visible && ethereal && shadeLookup;
      if (hidden ? shadesCount >= drawCapacity : count >= drawCapacity) continue;

      interpolatePosition(transform.position, position, alpha.current);
      const bounce = reducedMotion ? 0 : Math.sin(enemy.progress * (flying ? 175 : 245) + id * 2.38);
      const turn = Math.atan2(position.x - position.previousX, position.z - position.previousZ);
      const size = boss ? 1.28 : 1;
      transform.position.setY(transform.position.y + bounce * (flying ? 0.16 : 0.045));
      transform.rotation.set(flying ? bounce * 0.095 : 0, turn, 0);
      transform.scale.set(size * (1 - bounce * 0.055), size * (0.98 + bounce * 0.10), size);
      transform.updateMatrix();
      if (localTransform) transform.matrix.multiply(localTransform);

      if (hidden) {
        ethereal.setMatrixAt(shadesCount, transform.matrix);
        shadeLookup[shadesCount] = id;
        shadesCount += 1;
      } else {
        mesh.setMatrixAt(count, transform.matrix);
        lookup[count] = id;
        count += 1;
      }
    }

    publishInstances(mesh, count);
    if (ethereal) publishInstances(ethereal, shadesCount);
  });

  function select(event: ThreeEvent<MouseEvent>, hidden: boolean) {
    const instanceId = event.instanceId;
    if (!onSelectEnemy || instanceId === undefined || event.delta > 5) return;
    const lookup = hidden ? shadeIds.current : ids.current;
    const entity = runtime.queries.enemies.entities.find(({ id }) => id === lookup?.[instanceId]);
    if (!entity) return;
    event.stopPropagation();
    onSelectEnemy(entity);
  }

  return (
    <group>
      <instancedMesh
        args={[geometry, material, drawCapacity]}
        ref={bodies}
        onUpdate={prepareEnemyMesh}
        count={0}
        frustumCulled={false}
        onClick={onSelectEnemy ? (event) => select(event, false) : undefined}
      >
        {!material && <meshStandardMaterial vertexColors roughness={0.82} flatShading />}
      </instancedMesh>
      {stealth && (
        <instancedMesh
          args={[geometry, undefined, drawCapacity]}
          ref={shades}
          onUpdate={prepareEnemyMesh}
          count={0}
          frustumCulled={false}
          onClick={onSelectEnemy ? (event) => select(event, true) : undefined}
        >
          <meshBasicMaterial vertexColors={Boolean(geometry.attributes.color)} transparent opacity={0.34} depthWrite={false} />
        </instancedMesh>
      )}
    </group>
  );
}

function FallbackEnemyBatch(props: EnemyBatchProps) {
  const { definition } = props;
  const geometry = useMemo(() => sculpture(enemyPieces(definition.visual), definition.color), [definition]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <EnemyBatch {...props} model={{ geometry }} />;
}

function LoadedEnemyBatch({ path, ...props }: EnemyBatchProps & { path: string }) {
  const model = useInstancedAsset(path);
  return <EnemyBatch {...props} model={model} />;
}

export function Enemies(props: EnemiesProps) {
  const wave = useStore(props.runtime.store, (state) => state.wave);
  const present = useMemo(() => collectEnemyTypes(props.runtime.waves.slice(0, wave)), [props.runtime, wave]);
  return (
    <group>
      {enemies.filter(({ id }) => present.has(id)).map((definition) => {
        const fallback = <FallbackEnemyBatch definition={definition} {...props} />;
        return definition.model ? (
          <LoadingModel key={definition.model} fallback={fallback}>
            <LoadedEnemyBatch path={definition.model} definition={definition} {...props} />
          </LoadingModel>
        ) : <FallbackEnemyBatch key={definition.id} definition={definition} {...props} />;
      })}
      <EnemyIndicators runtime={props.runtime} alpha={props.alpha} />
    </group>
  );
}
