import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { InstancedMesh, Object3D, Sphere, Vector3 } from "three";
import { enemies, type EnemyDefinition } from "@/data/enemies";
import type { EnemyEntity } from "@/game/ecs/world";
import type { GameRuntime } from "@/game/runtime";
import { EnemyIndicators } from "./EnemyIndicators";
import { drawCapacity, interpolatePosition, prepareInstances, publishInstances } from "./instances";
import { enemyPieces } from "./models/enemySculptures";
import { sculpture } from "./models/sculpture";

interface EnemiesProps {
  runtime: GameRuntime;
  alpha: RefObject<number>;
  onSelectEnemy?: (entity: EnemyEntity) => void;
}

function prepareEnemyMesh(mesh: InstancedMesh) {
  prepareInstances(mesh);
  // These matrices are replaced every frame and can move across the entire board.
  mesh.boundingSphere ??= new Sphere(new Vector3(), 96);
}

function EnemyBatch({ definition, runtime, alpha, onSelectEnemy }: EnemiesProps & { definition: EnemyDefinition }) {
  const bodies = useRef<InstancedMesh>(null);
  const shades = useRef<InstancedMesh>(null);
  const ids = useRef<Int32Array | null>(null);
  const shadeIds = useRef<Int32Array | null>(null);
  const transform = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => sculpture(enemyPieces(definition.visual), definition.color), [definition]);
  const { flying, boss, stealth } = definition.traits;

  useEffect(() => {
    ids.current = new Int32Array(drawCapacity);
    if (stealth) shadeIds.current = new Int32Array(drawCapacity);
  }, [stealth]);
  useEffect(() => () => geometry.dispose(), [geometry]);

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
      const bounce = Math.sin(enemy.progress * (flying ? 175 : 245) + id * 2.38);
      const turn = Math.atan2(position.x - position.previousX, position.z - position.previousZ);
      const size = boss ? 1.28 : 1;
      transform.position.setY(transform.position.y + bounce * (flying ? 0.16 : 0.045));
      transform.rotation.set(flying ? bounce * 0.095 : 0, turn, 0);
      transform.scale.set(size * (1 - bounce * 0.055), size * (0.98 + bounce * 0.10), size);
      transform.updateMatrix();

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
        args={[geometry, undefined, drawCapacity]}
        ref={bodies}
        onUpdate={prepareEnemyMesh}
        count={0}
        frustumCulled={false}
        onClick={onSelectEnemy ? (event) => select(event, false) : undefined}
      >
        <meshStandardMaterial vertexColors roughness={0.82} flatShading />
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
          <meshBasicMaterial vertexColors transparent opacity={0.34} depthWrite={false} />
        </instancedMesh>
      )}
    </group>
  );
}

export function Enemies(props: EnemiesProps) {
  return (
    <group>
      {enemies.map((definition) => <EnemyBatch key={definition.id} definition={definition} {...props} />)}
      <EnemyIndicators runtime={props.runtime} alpha={props.alpha} />
    </group>
  );
}
