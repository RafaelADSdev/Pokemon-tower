import { createStore, type StateCreator } from 'zustand';
import { gameRules } from '@/data/rules';
import type { GameSpeed } from '../time';

export type GameStatus = 'ready' | 'running' | 'victory' | 'defeat';

interface RunState {
  money: number;
  lives: number;
  wave: number;
  maxWaves: number;
  wavesActive: number;
  wavesCompleted: number;
  paused: boolean;
  speed: GameSpeed;
  status: GameStatus;
  selectedSlot: string | null;
  selectedEnemyId: number | null;
  occupiedSlots: Readonly<Partial<Record<string, string>>>;
  towerRevision: number;
}

export interface GameState extends RunState {
  setPaused: (paused: boolean) => void;
  togglePaused: () => void;
  setSpeed: (speed: GameSpeed) => void;
  selectSlot: (slot: string | null) => void;
  selectEnemy: (enemy: number | null) => void;
  reset: (maxWaves?: number) => void;
}

const initialRun: RunState = {
  money: gameRules.startingMoney,
  lives: gameRules.startingLives,
  wave: 0,
  maxWaves: gameRules.maxWaves,
  wavesActive: 0,
  wavesCompleted: 0,
  paused: false,
  speed: 1,
  status: 'ready',
  selectedSlot: null,
  selectedEnemyId: null,
  occupiedSlots: {},
  towerRevision: 0,
};

const state: StateCreator<GameState> = (set) => ({
  ...initialRun,
  setPaused: (paused) => set({ paused }),
  togglePaused: () => set(({ paused }) => ({ paused: !paused })),
  setSpeed: (speed) => set({ speed }),
  selectSlot: (selectedSlot) => set({ selectedSlot, selectedEnemyId: null }),
  selectEnemy: (selectedEnemyId) => set({ selectedEnemyId, selectedSlot: null }),
  reset: (maxWaves = initialRun.maxWaves) => set({ ...initialRun, maxWaves }),
});

export const createGameStore = () => createStore<GameState>(state);
