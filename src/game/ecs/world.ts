import { World, type With } from 'miniplex';
import type { CreatureDefinition, CreatureLevel, TargetPriority } from '@/data/creatures';
import type { ElementId } from '@/data/elements';
import type { EnemyDefinition } from '@/data/enemies';
import type { StatusApplication } from '@/data/status';
import type { CompiledPath } from '@/lib/pathing';
import type { StatusTimers } from '../systems/status';
import type { ActiveWave } from '../systems/waves';

export type { TargetPriority };
export type TowerLevel = CreatureLevel;
export type EffectKind = 'shot' | 'impact' | 'damage' | 'death' | 'leak';

export interface TowerStats {
  damage: number;
  range: number;
  cooldown: number;
  targets: CreatureDefinition['targets'];
  splash: number;
  status: StatusApplication | undefined;
  support: CreatureDefinition['support'];
  income: CreatureDefinition['income'];
  airMultiplier: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
  previousX: number;
  previousY: number;
  previousZ: number;
}

export interface GameEntity {
  id: number;
  position: Position;
  enemy?: {
    definition: EnemyDefinition;
    path: CompiledPath;
    pathIndex: number;
    wave: ActiveWave;
    progress: number;
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    speed: number;
    haste: number;
    hasteRemaining: number;
    abilityCooldown: number;
    statuses: StatusTimers;
    movementFactor: number;
    visible: boolean;
    escaped: boolean;
  };
  tower?: {
    definition: CreatureDefinition;
    slotId: string;
    heading: number;
    cooldown: number;
    target: EnemyEntity | null;
    level: TowerLevel;
    evolved: boolean;
    totalSpent: number;
    priority: TargetPriority;
    stats: TowerStats;
    effectiveRange: number;
    effectiveDamage: number;
    incomeRemaining: number;
  };
  projectile?: {
    color: string;
    damage: number;
    speed: number;
    target: EnemyEntity | null;
    element: ElementId;
    targets: CreatureDefinition['targets'];
    splash: number;
    status: StatusApplication | undefined;
    airMultiplier: number;
  };
  effect?: {
    kind: EffectKind;
    color: string;
    value: number;
    age: number;
    duration: number;
    serial: number;
  };
}

export type EnemyEntity = With<GameEntity, 'enemy'>;
export type TowerEntity = With<GameEntity, 'tower'>;
export type ProjectileEntity = With<GameEntity, 'projectile'>;
export type EffectEntity = With<GameEntity, 'effect'>;

export function createPosition(x = 0, y = 0, z = 0): Position {
  return { x, y, z, previousX: x, previousY: y, previousZ: z };
}

export function snapshotPosition(position: Position) {
  position.previousX = position.x;
  position.previousY = position.y;
  position.previousZ = position.z;
}

export function createGameWorld() {
  const world = new World<GameEntity>();

  return {
    world,
    queries: {
      enemies: world.with('enemy').connect(),
      towers: world.with('tower').connect(),
      projectiles: world.with('projectile').connect(),
      effects: world.with('effect').connect(),
    },
  };
}
