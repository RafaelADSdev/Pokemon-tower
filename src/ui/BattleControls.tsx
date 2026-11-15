import { Flag, Pause, Play } from 'lucide-react';
import { playSound } from '@/audio/audio';
import { elementById } from '@/data/elements';
import type { EnemyDefinition } from '@/data/enemies';
import type { GameRuntime } from '@/game/runtime';
import type { GameState } from '@/game/store/gameStore';
import { wavePreview } from '@/lib/waves';
import { ElementGlyph } from './ElementInfo';
import { useLocale } from './locale';
import './battle-panels.css';

export function BattleControls({ runtime, game, onInspect }: {
  runtime: GameRuntime;
  game: GameState;
  onInspect: (enemy: EnemyDefinition) => void;
}) {
  const { wave, speed, paused, status, wavesActive, wavesCompleted } = game;
  const { localized, t } = useLocale();
  const maxWaves = runtime.waves.length;
  const next = runtime.waves[wave];
  const ended = status === 'victory' || status === 'defeat';
  const preview = next ? wavePreview(next) : [];
  const waveLabel = next && status === 'running' ? t.callNext : t.startWave;

  return (
    <section className="battle-panel wave-panel" data-status={status} data-paused={paused} aria-labelledby="wave-title">
      <div className="panel-heading">
        <h2 id="wave-title"><span className="panel-emblem"><Flag size={17} aria-hidden="true" /></span>{t.waves}</h2>
        <span className="panel-count">{wavesCompleted}/{maxWaves} {t.completed}</span>
      </div>
      <div className="wave-meter" aria-hidden="true">
        {Array.from({ length: maxWaves }, (_, index) => (
          <span key={index} data-wave={index < wavesCompleted ? 'complete' : index < wave ? 'started' : 'queued'} />
        ))}
      </div>
      <p className="panel-copy wave-status" role="status">
        {paused ? t.paused : ended ? t.ended : wavesActive > 1 ? t.wavesRunning(wavesActive) : status === 'running' ? t.waveRunning(wave) : t.waveReady(wave + 1)}
      </p>
      <div className="field-controls">
        <button type="button" className="gold-button" onClick={() => runtime.startWave()} disabled={!next || paused || ended} aria-keyshortcuts="N"><Play size={15} aria-hidden="true" /> {waveLabel}</button>
        <button type="button" className="quiet-button" onClick={() => { game.togglePaused(); playSound('pause'); }} disabled={ended} aria-label={paused ? t.resume : t.pause} title={paused ? t.resume : t.pause} aria-keyshortcuts="Space">
          {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
        </button>
        <div className="speed-controls" role="group" aria-label={t.speed}>
          {([1, 2, 3] as const).map((rate) => (
            <button type="button" key={rate} aria-pressed={speed === rate} onClick={() => game.setSpeed(rate)} aria-keyshortcuts={String(rate)} disabled={ended}>{rate}×</button>
          ))}
        </div>
      </div>
      {next && !ended && (
        <div className="wave-preview">
          <p>{t.preview} · {wave + 1}</p>
          <ul>
            {preview.map(({ enemy, count }) => (
              <li key={enemy.id}><button type="button" onClick={() => onInspect(enemy)} aria-label={t.inspect(localized(enemy), localized(elementById[enemy.element]), count)}>
                <ElementGlyph element={enemy.element} size={12} /> <span>{localized(enemy)}</span> <strong>×{count}</strong>
              </button></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
