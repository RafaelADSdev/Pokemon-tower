import type { StoreApi } from 'zustand';
import type { TowerEntity } from '../ecs/world';
import type { GameState } from '../store/gameStore';
import type { EconomyDelta } from './cleanup';

export function incomeSystem(towers: readonly TowerEntity[], delta: number) {
  let earned = 0;
  for (const { tower } of towers) {
    const { income } = tower.stats;
    if (!income) continue;
    tower.incomeRemaining -= delta;
    if (tower.incomeRemaining > 0) continue;
    tower.incomeRemaining += income.interval;
    earned += income.amount;
  }
  return earned;
}

export function economySystem(store: StoreApi<GameState>, delta: EconomyDelta, wavesActive: number, justCompleted: number) {
  const state = store.getState();
  const lives = Math.max(0, state.lives - delta.livesLost);
  const wavesCompleted = state.wavesCompleted + justCompleted;
  const status = lives === 0 ? 'defeat' : wavesCompleted === state.maxWaves ? 'victory' : wavesActive > 0 ? 'running' : 'ready';
  if (delta.reward || delta.livesLost || delta.selectedEnemyGone || justCompleted) {
    store.setState({
      money: state.money + delta.reward,
      lives,
      selectedEnemyId: delta.selectedEnemyGone ? null : state.selectedEnemyId,
      wavesActive: status === 'defeat' ? 0 : wavesActive,
      wavesCompleted,
      status,
    });
  }
}
