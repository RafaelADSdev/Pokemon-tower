import { World, type With } from 'miniplex';
import type { CreatureDefinition } from '@/data/creatures';
import type { EnemyDefinition } from '@/data/enemies';
import type { CompiledPath } from '@/lib/pathing';

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
    progress: number;
    health: number;
    maxHealth: number;
    escaped: boolean;
  };
  tower?: {
    definition: CreatureDefinition;
    slotId: string;
    heading: number;
    cooldown: number;
    target: EnemyEntity | null;
  };
  projectile?: {
    color: string;
    damage: number;
    speed: number;
    target: EnemyEntity | null;
  };
  effect?: true;
}

export type EnemyEntity = With<GameEntity, 'enemy'>;
export type TowerEntity = With<GameEntity, 'tower'>;
export type ProjectileEntity = With<GameEntity, 'projectile'>;

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
