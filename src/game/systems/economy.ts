import type { StoreApi } from 'zustand';
import type { GameState } from '../store/gameStore';
import type { EconomyDelta } from './cleanup';

export function economySystem(store: StoreApi<GameState>, delta: EconomyDelta) {
  const state = store.getState();
  const lives = Math.max(0, state.lives - delta.livesLost);
  if (delta.reward || delta.livesLost) {
    store.setState({ money: state.money + delta.reward, lives });
  }
  return lives;
}
