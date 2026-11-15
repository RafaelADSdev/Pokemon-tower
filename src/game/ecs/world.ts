import { World } from 'miniplex';

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
  enemy?: true;
  tower?: true;
  projectile?: true;
  effect?: true;
}

export function createGameWorld() {
  const world = new World<GameEntity>();

  return {
    world,
    queries: {
      enemies: world.with('enemy'),
      towers: world.with('tower'),
      projectiles: world.with('projectile'),
      effects: world.with('effect'),
    },
  };
}
