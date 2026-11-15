import type { Query, World } from 'miniplex';
import { elements, type ElementId } from '@/data/elements';
import { createPosition, snapshotPosition, type EffectEntity, type EffectKind, type GameEntity, type Position } from './world';

const CAPACITY = 768;
const CRITICAL_RESERVE = 32;
const EFFECT_ID_OFFSET = 0x10000;
const durations: Record<EffectKind, number> = {
  shot: 0.20,
  impact: 0.36,
  damage: 0.78,
  death: 0.52,
  leak: 0.42,
};

type AttackEffect = Pick<EffectEntity['effect'], 'element' | 'heading' | 'radius'>;

function createEffectPool(world: World<GameEntity>, query: Query<EffectEntity>) {
  let serial = 0;
  const available = Array.from({ length: CAPACITY }, (_, index): EffectEntity => ({
    id: -EFFECT_ID_OFFSET - index,
    position: createPosition(),
    effect: { kind: 'shot', color: '', value: 0, age: 0, duration: 0, serial: 0 },
  }));

  function release(entity: EffectEntity) {
    world.remove(entity);
    available.push(entity);
  }

  return {
    spawn(kind: EffectKind, from: Position, color: string, value = 0, attack?: AttackEffect) {
      if (available.length <= CRITICAL_RESERVE && kind !== 'death' && kind !== 'leak') return;
      const entity = available.pop();
      if (!entity) return;

      const { effect, position } = entity;
      position.x = from.x;
      position.y = from.y;
      position.z = from.z;
      snapshotPosition(position);
      effect.kind = kind;
      effect.color = color;
      effect.value = value;
      effect.age = 0;
      effect.duration = durations[kind];
      effect.serial = ++serial;
      effect.element = attack?.element;
      effect.heading = attack?.heading;
      effect.radius = attack?.radius;
      world.add(entity);
    },

    advance(delta: number) {
      const entities = query.entities;
      for (let index = entities.length - 1; index >= 0; index--) {
        const entity = entities[index];
        entity.effect.age += delta;
        if (entity.effect.age >= entity.effect.duration) release(entity);
      }
    },

    clear() {
      const entities = query.entities;
      for (let index = entities.length - 1; index >= 0; index--) release(entities[index]);
    },
  };
}

const cues = ['shot', 'impact', 'death', 'leak', 'boss', 'victory', 'defeat', 'place', 'upgrade', 'sell', 'wave'] as const;
export type GameCue = (typeof cues)[number];
type AttackCue = Extract<GameCue, 'shot' | 'impact'>;
type Listener = (cue: GameCue, element?: ElementId) => void;
const elementBits = new Map(elements.map(({ id }, index) => [id, 1 << index]));

function createCueChannel() {
  let listeners: readonly Listener[] = [];
  let queued = 0;
  const attacks: Record<AttackCue, number> = { shot: 0, impact: 0 };

  function emit(cue: GameCue, element?: ElementId) {
    const recipients = listeners;
    for (let index = 0; index < recipients.length; index++) {
      try {
        recipients[index](cue, element);
      } catch {
        // Audio playback can fail while the simulation continues.
      }
    }
  }

  function clearCues() {
    queued = 0;
    attacks.shot = 0;
    attacks.impact = 0;
  }

  return {
    emit,
    queue(cue: GameCue, element?: ElementId) {
      if (element && (cue === 'shot' || cue === 'impact')) attacks[cue] |= elementBits.get(element) ?? 0;
      else queued |= 1 << cues.indexOf(cue);
    },
    flush() {
      if (!queued && !attacks.shot && !attacks.impact) return;
      const current = queued;
      const shot = attacks.shot;
      const impact = attacks.impact;
      clearCues();
      for (let index = 0; index < cues.length; index++) {
        const cue = cues[index];
        if (current & (1 << index)) emit(cue);
        const mask = cue === 'shot' ? shot : cue === 'impact' ? impact : 0;
        if (!mask) continue;
        for (let element = 0; element < elements.length; element++) {
          if (mask & (1 << element)) emit(cue, elements[element].id);
        }
      }
    },
    subscribe(listener: Listener) {
      const subscription: Listener = (cue, element) => listener(cue, element);
      listeners = [...listeners, subscription];
      return () => { listeners = listeners.filter((recipient) => recipient !== subscription); };
    },
    clearCues,
  };
}

export function createFeedback(world: World<GameEntity>, query: Query<EffectEntity>) {
  return { ...createEffectPool(world, query), ...createCueChannel() };
}

export type GameFeedback = ReturnType<typeof createFeedback>;
