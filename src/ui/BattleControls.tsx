import { Flag, Pause, Play } from 'lucide-react';
import { elementById } from '@/data/elements';
import type { EnemyDefinition } from '@/data/enemies';
import type { GameRuntime } from '@/game/runtime';
import type { GameState } from '@/game/store/gameStore';
import { wavePreview } from '@/lib/waves';
import { ElementGlyph } from './ElementInfo';

export function BattleControls({ runtime, game, onInspect }: {
  runtime: GameRuntime;
  game: GameState;
  onInspect: (enemy: EnemyDefinition) => void;
}) {
  const { wave, speed, paused, status, wavesActive, wavesCompleted, maxWaves } = game;
  const next = runtime.waves[wave];
  const ended = status === 'victory' || status === 'defeat';
  const preview = next ? wavePreview(next) : [];
  const waveLabel = next && status === 'running' ? 'Chamar próxima' : 'Iniciar onda';

  return (
    <section className="battle-panel wave-panel" aria-labelledby="wave-title">
      <div className="panel-heading"><h2 id="wave-title"><Flag size={18} aria-hidden="true" /> Ondas</h2><span>{wavesCompleted}/{maxWaves} concluídas</span></div>
      <p className="panel-copy" role="status">
        {paused ? 'Partida pausada' : ended ? 'Partida encerrada' : wavesActive > 1 ? `${wavesActive} ondas em andamento` : status === 'running' ? `Onda ${wave} em andamento` : `Onda ${wave + 1} pronta para começar`}
      </p>
      {next && !ended && (
        <div className="wave-preview">
          <p>Próxima onda · {wave + 1}</p>
          <ul>
            {preview.map(({ enemy, count }) => (
              <li key={enemy.id}><button type="button" onClick={() => onInspect(enemy)} aria-label={`Inspecionar ${enemy.name}, ${elementById[enemy.element].name}, ${count} nesta onda`}>
                <ElementGlyph element={enemy.element} size={12} /> <span>{enemy.name}</span> <strong>×{count}</strong>
              </button></li>
            ))}
          </ul>
        </div>
      )}
      <div className="field-controls">
        <button type="button" className="gold-button" onClick={() => runtime.startWave()} disabled={!next || paused || ended}><Play size={15} aria-hidden="true" /> {waveLabel}</button>
        <button type="button" className="quiet-button" onClick={game.togglePaused} disabled={ended} aria-label={paused ? 'Continuar' : 'Pausar'}>
          {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
        </button>
        <div className="speed-controls" role="group" aria-label="Velocidade de jogo">
          {([1, 2, 3] as const).map((rate) => (
            <button type="button" key={rate} aria-pressed={speed === rate} onClick={() => game.setSpeed(rate)} disabled={ended}>{rate}×</button>
          ))}
        </div>
      </div>
    </section>
  );
}
