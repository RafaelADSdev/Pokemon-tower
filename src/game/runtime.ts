import type { StoreApi } from 'zustand';
import { creatureById, getCreatureStats, starterCreature, targetPriorities } from '@/data/creatures';
import { enemyById, type EnemyDefinition } from '@/data/enemies';
import type { MapDefinition } from '@/data/maps/types';
import { gameRules } from '@/data/rules';
import { getMapWaves } from '@/data/waves';
import type { WaveDefinition } from '@/data/waves/types';
import { compilePath, samplePath } from '@/lib/pathing';
import { createFeedback } from './ecs/effectPool';
import { createProjectilePool } from './ecs/projectilePool';
import { createGameWorld, createPosition, snapshotPosition, type EnemyEntity, type TargetPriority, type TowerEntity } from './ecs/world';
import { createGameStore, type GameState } from './store/gameStore';
import { abilitySystem } from './systems/abilities';
import { cleanupSystem, type EconomyDelta } from './systems/cleanup';
import { combatSystem } from './systems/combat';
import { economySystem, incomeSystem } from './systems/economy';
import { movementSystem } from './systems/movement';
import { projectileSystem } from './systems/projectiles';
import { createStatusTimers, statusSystem } from './systems/status';
import { revealSystem, updateTowerBuffs } from './systems/support';
import { targetingSystem } from './systems/targeting';
import { createTowerStats } from './systems/towerStats';
import { createWave, waveSystem, type ActiveWave } from './systems/waves';
import { createGameClock } from './time';

const DEFAULT_SEED = 0x8d75a121;
const ENEMY_BODY_HEIGHT = 0.45;
const FLYING_HEIGHT = 1.25;

export interface RuntimeOptions {
  waves?: readonly WaveDefinition[];
  store?: StoreApi<GameState>;
  seed?: number;
  canUseCreature?: (id: string) => boolean;
}

export function createGameRuntime(map: MapDefinition, options: RuntimeOptions = {}) {
  const { world, queries } = createGameWorld();
  const pool = createProjectilePool(world);
  const feedback = createFeedback(world, queries.effects);
  const clock = createGameClock();
  const store = options.store ?? createGameStore();
  const definitions = options.waves ?? getMapWaves(map.id);
  const paths = map.paths.map(compilePath);
  const airPaths = paths.map(({ waypoints }) => compilePath([waypoints[0], waypoints[waypoints.length - 1]]));
  if (!paths.length) throw new Error(`Map ${map.id} has no path`);

  const economy: EconomyDelta = { reward: 0, livesLost: 0, selectedEnemyGone: false };
  const activeWaves: ActiveWave[] = [];
  const seed = (options.seed ?? DEFAULT_SEED) >>> 0 || DEFAULT_SEED;
  let random = seed;
  let nextEntityId = 1;
  let alpha = 0;

  store.getState().reset(definitions.length);

  function randomPathIndex() {
    random ^= random << 13;
    random ^= random >>> 17;
    random ^= random << 5;
    return (random >>> 0) % paths.length;
  }

  function spawnEnemy(definition: EnemyDefinition, wave: ActiveWave, requestedPath?: number, progress = 0) {
    const { flying, stealth, shield, boss } = definition.traits;
    const pathIndex = requestedPath !== undefined && paths[requestedPath] ? requestedPath : randomPathIndex();
    const path = flying ? airPaths[pathIndex] : paths[pathIndex];
    const maxHealth = definition.health * wave.healthScale;
    const maxShield = (shield?.health ?? 0) * wave.healthScale;
    const position = createPosition(0, flying ? FLYING_HEIGHT : ENEMY_BODY_HEIGHT, 0);
    samplePath(path, progress, position);
    snapshotPosition(position);

    const entity: EnemyEntity = {
      id: nextEntityId++,
      position,
      enemy: {
        definition, path, pathIndex, wave, progress,
        health: maxHealth, maxHealth, shield: maxShield, maxShield, speed: definition.speed * wave.speedScale,
        haste: 0, hasteRemaining: 0, abilityCooldown: boss?.interval ?? 0, statuses: createStatusTimers(),
        movementFactor: 1, visible: !stealth, escaped: false,
      },
    };
    wave.alive++;
    world.add(entity);
  }

  function splitEnemy({ enemy }: EnemyEntity) {
    const child = enemy.definition.traits.split;
    if (!child) return;
    const definition = Object.hasOwn(enemyById, child.enemyId) ? enemyById[child.enemyId] : undefined;
    if (!definition) throw new Error(`Unknown split enemy: ${child.enemyId}`);

    for (let index = 0; index < child.count; index++) spawnEnemy(definition, enemy.wave, enemy.pathIndex, enemy.progress);
  }

  function getTower(slotId: string) {
    return queries.towers.entities.find(({ tower }) => tower.slotId === slotId);
  }

  function clearProjectiles() {
    const entities = queries.projectiles.entities;
    for (let index = entities.length - 1; index >= 0; index--) pool.release(entities[index]);
  }

  function step(delta: number) {
    feedback.advance(delta);
    if (!activeWaves.length) return;
    for (const wave of activeWaves) waveSystem(wave, delta, spawnEnemy);

    const enemies = queries.enemies.entities;
    const towers = queries.towers.entities;
    statusSystem(enemies, delta);
    abilitySystem(enemies, feedback, delta);
    movementSystem(enemies, delta);
    revealSystem(towers, enemies);
    targetingSystem(towers, enemies, delta);
    combatSystem(towers, pool, feedback);
    projectileSystem(queries.projectiles.entities, enemies, pool, feedback, delta);
    const { selectedEnemyId, lives } = store.getState();
    cleanupSystem(enemies, world, economy, feedback, selectedEnemyId, splitEnemy);
    economy.reward += incomeSystem(towers, delta);

    let completed = 0;
    for (let index = activeWaves.length - 1; index >= 0; index--) {
      const wave = activeWaves[index];
      if (wave.remaining || wave.alive) continue;
      economy.reward += wave.bonus;
      activeWaves.copyWithin(index, index + 1);
      activeWaves.pop();
      completed++;
    }

    if (lives <= economy.livesLost) activeWaves.length = 0;
    if (!activeWaves.length) clearProjectiles();
    const status = economySystem(store, economy, activeWaves.length, completed);
    if (status === 'victory' || status === 'defeat') feedback.queue(status);
  }

  return {
    store,
    queries,
    waves: definitions,
    subscribeAudio: feedback.subscribe,
    advance(deltaSeconds: number) {
      if (!activeWaves.length && !queries.effects.entities.length) return alpha;
      const { speed, paused } = store.getState();
      alpha = clock.advance(deltaSeconds, speed, paused, step);
      feedback.flush();
      return alpha;
    },

    startWave() {
      const { paused, status, wave } = store.getState();
      const definition = definitions[wave];
      if (paused || (status !== 'ready' && status !== 'running') || !definition) return false;

      if (!activeWaves.length) {
        const towers = queries.towers.entities;
        for (const { tower } of towers) tower.cooldown = 0;
        clock.reset();
        alpha = 0;
      }
      activeWaves.push(createWave(definition));
      store.setState({ status: 'running', wave: wave + 1, wavesActive: activeWaves.length });
      feedback.emit('wave');
      return true;
    },

    placeTower(slotId: string, creatureId = starterCreature.id) {
      const { money, occupiedSlots, paused, status, towerRevision } = store.getState();
      if (paused || (status !== 'ready' && status !== 'running') || Object.hasOwn(occupiedSlots, slotId)) return false;

      const slot = map.slots.find(({ id }) => id === slotId);
      const definition = Object.hasOwn(creatureById, creatureId) ? creatureById[creatureId] : undefined;
      if (!slot || !definition || money < definition.cost || options.canUseCreature?.(definition.id) === false) return false;

      const [x, z] = slot.position;
      const stats = createTowerStats(definition, 1);
      const entity: TowerEntity = {
        id: nextEntityId++,
        position: createPosition(x, 0, z),
        tower: {
          definition, slotId, heading: 0, cooldown: 0, target: null, level: 1, evolved: false,
          totalSpent: definition.cost, priority: 'first', stats,
          effectiveRange: stats.range, effectiveDamage: stats.damage, incomeRemaining: stats.income?.interval ?? 0,
        },
      };
      world.add(entity);
      updateTowerBuffs(queries.towers.entities);
      store.setState({
        money: money - definition.cost,
        occupiedSlots: { ...occupiedSlots, [slotId]: definition.id },
        towerRevision: towerRevision + 1,
      });
      feedback.emit('place');
      return true;
    },

    getTower,
    getEnemy(id: number) {
      return queries.enemies.entities.find((entity) => entity.id === id);
    },

    upgradeTower(slotId: string) {
      const { money, paused, status, towerRevision } = store.getState();
      if (paused || (status !== 'ready' && status !== 'running')) return false;
      const tower = getTower(slotId)?.tower;
      if (!tower || tower.level === 3) return false;

      const level = tower.level === 1 ? 2 : 3;
      const cost = getCreatureStats(tower.definition, level).cost;
      if (money < cost) return false;

      const stats = createTowerStats(tower.definition, level);
      if (stats.income) tower.incomeRemaining = Math.min(tower.incomeRemaining || stats.income.interval, stats.income.interval);
      tower.cooldown = Math.min(tower.cooldown, stats.cooldown);
      tower.stats = stats;
      tower.level = level;
      tower.evolved = level === 3;
      tower.totalSpent += cost;
      updateTowerBuffs(queries.towers.entities);
      store.setState({ money: money - cost, towerRevision: towerRevision + 1 });
      feedback.emit('upgrade');
      return true;
    },

    sellTower(slotId: string) {
      const { money, occupiedSlots, paused, status, towerRevision } = store.getState();
      if (paused || (status !== 'ready' && status !== 'running')) return false;
      const entity = getTower(slotId);
      if (!entity) return false;

      const nextSlots = { ...occupiedSlots };
      delete nextSlots[slotId];
      world.remove(entity);
      updateTowerBuffs(queries.towers.entities);
      store.setState({
        occupiedSlots: nextSlots,
        towerRevision: towerRevision + 1,
        money: money + Math.floor(entity.tower.totalSpent * gameRules.sellRefund),
      });
      feedback.emit('sell');
      return true;
    },

    setTargetPriority(slotId: string, priority: TargetPriority) {
      const { paused, status, towerRevision } = store.getState();
      if (paused || (status !== 'ready' && status !== 'running') || !targetPriorities.includes(priority)) return false;
      const tower = getTower(slotId)?.tower;
      if (!tower) return false;
      if (tower.priority !== priority) {
        tower.priority = priority;
        store.setState({ towerRevision: towerRevision + 1 });
      }
      return true;
    },

    restart() {
      activeWaves.length = 0;
      alpha = 0;
      nextEntityId = 1;
      random = seed;
      clock.reset();
      clearProjectiles();
      feedback.clear();
      feedback.clearCues();
      world.clear();
      store.getState().reset(definitions.length);
    },
  };
}

export type GameRuntime = ReturnType<typeof createGameRuntime>;
