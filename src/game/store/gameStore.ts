import { create, type StateCreator } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { gameRules } from '@/data/rules';
import type { GameSpeed } from '../time';

export type GameStatus = 'ready' | 'running' | 'victory' | 'defeat';

interface RunState {
  money: number;
  lives: number;
  wave: number;
  maxWaves: number;
  paused: boolean;
  speed: GameSpeed;
  status: GameStatus;
  selectedSlot: string | null;
}

export interface GameState extends RunState {
  setPaused: (paused: boolean) => void;
  togglePaused: () => void;
  setSpeed: (speed: GameSpeed) => void;
  selectSlot: (slot: string | null) => void;
  reset: () => void;
}

const initialRun: RunState = {
  money: gameRules.startingMoney,
  lives: gameRules.startingLives,
  wave: 0,
  maxWaves: gameRules.maxWaves,
  paused: false,
  speed: 1,
  status: 'ready',
  selectedSlot: null,
};

const state: StateCreator<GameState> = (set) => ({
  ...initialRun,
  setPaused: (paused) => set({ paused }),
  togglePaused: () => set(({ paused }) => ({ paused: !paused })),
  setSpeed: (speed) => set({ speed }),
  selectSlot: (selectedSlot) => set({ selectedSlot }),
  reset: () => set(initialRun),
});

export const useGameStore = create<GameState>(state);
export const createGameStore = () => createStore<GameState>(state);
