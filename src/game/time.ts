export const FIXED_STEP = 1 / 60;
const MAX_FRAME_DELTA = 0.1;
const STEP_TOLERANCE = 1e-9;

export type GameSpeed = 1 | 2 | 3;

export function createGameClock() {
  let accumulator = 0;

  return {
    advance(deltaSeconds: number, speed: GameSpeed, paused: boolean, step?: (delta: number) => void) {
      if (!paused && deltaSeconds > 0) {
        // Bound catch-up when the tab loses focus or drops several frames.
        accumulator += Math.min(deltaSeconds, MAX_FRAME_DELTA) * speed;

        while (accumulator + STEP_TOLERANCE >= FIXED_STEP) {
          accumulator -= FIXED_STEP;
          step?.(FIXED_STEP);
        }

        accumulator = Math.max(0, accumulator);
      }

      return accumulator / FIXED_STEP;
    },

    reset() {
      accumulator = 0;
    },
  };
}
