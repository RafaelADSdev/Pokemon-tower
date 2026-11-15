import type { StoreApi } from 'zustand';
import { creatureById, starterCreature } from '@/data/creatures';
import type { EnemyDefinition } from '@/data/enemies';
import type { MapDefinition } from '@/data/maps/types';
import { forestWaves } from '@/data/waves/forest';
import type { WaveDefinition } from '@/data/waves/types';
import { compilePath } from '@/lib/pathing';
import { createProjectilePool } from './ecs/projectilePool';
import { createGameWorld, createPosition, type EnemyEntity, type TowerEntity } from './ecs/world';
import { createGameStore, type GameState } from './store/gameStore';
import { cleanupSystem, type EconomyDelta } from './systems/cleanup';
import { combatSystem } from './systems/combat';
import { economySystem } from './systems/economy';
import { movementSystem } from './systems/movement';
import { projectileSystem } from './systems/projectiles';
import { targetingSystem } from './systems/targeting';
import { createWave, waveSystem, type ActiveWave } from './systems/waves';
import { createGameClock } from './time';

const DEFAULT_SEED = 0x8d75a121;
const ENEMY_BODY_HEIGHT = 0.45;

interface RuntimeOptions {
  waves?: readonly WaveDefinition[];
  store?: StoreApi<GameState>;
  seed?: number;
}

export function createGameRuntime(map: MapDefinition, options: RuntimeOptions = {}) {
  const { world, queries } = createGameWorld();
  const pool = createProjectilePool(world);
  const clock = createGameClock();
  const store = options.store ?? createGameStore();
  const definitions = options.waves ?? forestWaves;
  const paths = map.paths.map(compilePath);
  if (!paths.length) throw new Error(`Map ${map.id} has no path`);

  const economy: EconomyDelta = { reward: 0, livesLost: 0 };
  const seed = (options.seed ?? DEFAULT_SEED) >>> 0 || DEFAULT_SEED;
  let random = seed;
  let nextEntityId = 1;
  let activeWave: ActiveWave | null = null;
  let alpha = 0;

  store.getState().reset(definitions.length);

  function spawnEnemy(definition: EnemyDefinition) {
    random ^= random << 13;
    random ^= random >>> 17;
    random ^= random << 5;
    const path = paths[(random >>> 0) % paths.length];
    const [x, z] = path.waypoints[0];
    const entity: EnemyEntity = {
      id: nextEntityId++,
      position: createPosition(x, ENEMY_BODY_HEIGHT, z),
      enemy: {
        definition, path, progress: 0, health: definition.health, maxHealth: definition.health, escaped: false,
      },
    };
    world.add(entity);
  }

  function clearProjectiles() {
    const entities = queries.projectiles.entities;
    for (let index = entities.length - 1; index >= 0; index--) pool.release(entities[index]);
  }

  function step(delta: number) {
    if (!activeWave) return;
    waveSystem(activeWave, delta, spawnEnemy);

    const enemies = queries.enemies.entities;
    const towers = queries.towers.entities;
    movementSystem(enemies, delta);
    targetingSystem(towers, enemies, delta);
    combatSystem(towers, pool);
    projectileSystem(queries.projectiles.entities, pool, delta);
    cleanupSystem(enemies, world, economy);

    if (economySystem(store, economy) === 0) {
      activeWave = null;
      clearProjectiles();
      store.setState({ status: 'defeat' });
    } else if (!activeWave.remaining && !enemies.length) {
      const { wave, maxWaves, money } = store.getState();
      const bonus = activeWave.bonus;
      activeWave = null;
      clearProjectiles();
      store.setState({ money: money + bonus, status: wave === maxWaves ? 'victory' : 'ready' });
    }
  }

  return {
    store,
    queries,
    advance(deltaSeconds: number) {
      if (!activeWave) return alpha;
      const { speed, paused } = store.getState();
      alpha = clock.advance(deltaSeconds, speed, paused, step);
      return alpha;
    },

    startWave() {
      const { paused, status, wave } = store.getState();
      const definition = definitions[wave];
      if (paused || status !== 'ready' || !definition) return false;

      activeWave = createWave(definition);
      const towers = queries.towers.entities;
      for (const { tower } of towers) tower.cooldown = 0;
      clock.reset();
      alpha = 0;
      store.setState({ status: 'running', wave: wave + 1 });
      return true;
    },

    placeTower(slotId: string, creatureId = starterCreature.id) {
      const { money, occupiedSlots, paused, status } = store.getState();
      if (paused || (status !== 'ready' && status !== 'running') || Object.hasOwn(occupiedSlots, slotId)) return false;

      const slot = map.slots.find(({ id }) => id === slotId);
      const definition = Object.hasOwn(creatureById, creatureId) ? creatureById[creatureId] : undefined;
      if (!slot || !definition || money < definition.cost) return false;

      const [x, z] = slot.position;
      const entity: TowerEntity = {
        id: nextEntityId++,
        position: createPosition(x, 0, z),
        tower: { definition, slotId, heading: 0, cooldown: 0, target: null },
      };
      world.add(entity);
      store.setState({ money: money - definition.cost, occupiedSlots: { ...occupiedSlots, [slotId]: definition.id } });
      return true;
    },

    getTower(slotId: string) {
      return queries.towers.entities.find(({ tower }) => tower.slotId === slotId);
    },

    restart() {
      activeWave = null;
      alpha = 0;
      nextEntityId = 1;
      random = seed;
      clock.reset();
      clearProjectiles();
      world.clear();
      store.getState().reset(definitions.length);
    },
  };
}

export type GameRuntime = ReturnType<typeof createGameRuntime>;
