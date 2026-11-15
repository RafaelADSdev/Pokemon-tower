import { expect, test, vi } from 'vitest';
import { createGameClock, FIXED_STEP } from './time';

test('simulates at 60 Hz with speed scaling and a fractional render position', () => {
  const clock = createGameClock();
  const step = vi.fn();

  expect(clock.advance(FIXED_STEP / 2, 1, false, step)).toBeCloseTo(0.5);
  expect(step).not.toHaveBeenCalled();
  expect(clock.advance(FIXED_STEP, 2, false, step)).toBeCloseTo(0.5);
  expect(clock.advance(FIXED_STEP / 2, 3, false, step)).toBeCloseTo(0);
  expect(step.mock.calls).toEqual(Array.from({ length: 4 }, () => [FIXED_STEP]));
});

test('pausing preserves interpolation without accumulating wall time', () => {
  const clock = createGameClock();
  const step = vi.fn();

  clock.advance(FIXED_STEP / 4, 1, false, step);
  expect(clock.advance(8, 3, true, step)).toBeCloseTo(0.25);
  expect(step).not.toHaveBeenCalled();
  expect(clock.advance(FIXED_STEP * 0.75, 1, false, step)).toBeCloseTo(0);
  expect(step).toHaveBeenCalledExactlyOnceWith(FIXED_STEP);
});

test('bounds catch-up after a long frame and clears fractional time on restart', () => {
  const clock = createGameClock();
  const step = vi.fn();

  clock.advance(10, 3, false, step);
  expect(step).toHaveBeenCalledTimes(18);
  clock.advance(FIXED_STEP / 2, 1, false, step);
  clock.reset();
  expect(clock.advance(FIXED_STEP / 2, 1, false, step)).toBeCloseTo(0.5);
  expect(step).toHaveBeenCalledTimes(18);
});
