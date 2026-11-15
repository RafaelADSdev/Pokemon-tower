import { statusRules, type StatusApplication } from '@/data/status';
import type { EnemyEntity } from '../ecs/world';

interface Timer {
  strength: number;
  remaining: number;
}

export interface StatusTimers {
  slow: Timer;
  burn: Timer;
  stun: Timer;
  mark: Timer;
  poison: Timer[];
}

function createTimer(): Timer {
  return { strength: 0, remaining: 0 };
}

export function createStatusTimers(): StatusTimers {
  return {
    slow: createTimer(),
    burn: createTimer(),
    stun: createTimer(),
    mark: createTimer(),
    poison: Array.from({ length: statusRules.poisonStacks }, createTimer),
  };
}

export function applyStatus(timers: StatusTimers, status: StatusApplication) {
  if (status.id === 'poison') {
    let weakest: Timer | undefined;
    for (const timer of timers.poison) {
      if (timer.remaining <= 0) {
        weakest = timer;
        break;
      }
      if (!weakest || timer.strength * timer.remaining < weakest.strength * weakest.remaining) weakest = timer;
    }
    if (weakest && status.strength * status.duration > weakest.strength * weakest.remaining) {
      weakest.strength = status.strength;
      weakest.remaining = status.duration;
    }
    return;
  }

  const timer = timers[status.id];
  if (status.id === 'stun') {
    timer.remaining = Math.max(timer.remaining, status.duration);
  } else if (timer.remaining <= 0 || status.strength > timer.strength) {
    timer.strength = status.strength;
    timer.remaining = status.duration;
  } else if (status.strength === timer.strength) {
    timer.remaining = Math.max(timer.remaining, status.duration);
  }
}

function takeTime(timer: Timer, delta: number) {
  const elapsed = Math.min(delta, timer.remaining);
  timer.remaining = Math.max(0, timer.remaining - delta);
  return timer.strength * elapsed;
}

export function statusSystem(enemies: readonly EnemyEntity[], delta: number) {
  for (const { enemy } of enemies) {
    const { slow, burn, poison, stun, mark } = enemy.statuses;
    const stunned = Math.min(delta, stun.remaining) / delta;
    const slowed = Math.min(statusRules.slowCap, slow.strength) * Math.min(1, slow.remaining / delta);
    const haste = enemy.haste * Math.min(1, enemy.hasteRemaining / delta);
    const markMultiplier = 1 + mark.strength * Math.min(1, mark.remaining / delta);
    enemy.movementFactor = (1 - stunned) * (1 - slowed) * (1 + Math.min(haste, statusRules.hasteCap));
    enemy.hasteRemaining = Math.max(0, enemy.hasteRemaining - delta);
    if (!enemy.hasteRemaining) enemy.haste = 0;
    takeTime(slow, delta);
    takeTime(stun, delta);
    takeTime(mark, delta);

    let damage = takeTime(burn, delta);
    for (const stack of poison) damage += takeTime(stack, delta);
    damage *= markMultiplier;
    const absorbed = Math.min(enemy.shield, damage);
    enemy.shield -= absorbed;
    enemy.health = Math.max(0, enemy.health - (damage - absorbed));
  }
}
